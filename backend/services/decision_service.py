# -*- coding: utf-8 -*-
"""AI 治理决策 Service.

职责：
1. 从 MySQL 拉取分省历史监测、模型预测、评估指标
2. 从 Neo4j 拉取上游链路、超标事件、水质等级分布
3. 组装 Graph-RAG Prompt
4. 调用 DeepSeek 生成治理建议
5. 将生成结果落库并返回给前端
"""

from __future__ import annotations

import os
from datetime import datetime, timedelta
from decimal import Decimal
from functools import lru_cache
from typing import Any

import pymysql
import requests
from dotenv import load_dotenv
from neo4j import GraphDatabase
from utils.neo4j_helper import get_neo4j_config

load_dotenv(override=False)

PROMPT_VERSION = "decision-v20260421"
DEFAULT_MODEL_TYPE = "LSTM"
DEFAULT_HISTORY_DAYS = 30
SUPPORTED_MODELS = {"LSTM", "ARIMA"}

INDICATOR_FIELDS = {
    "dissolved_oxygen": "溶解氧",
    "ammonia_nitrogen": "氨氮",
    "total_phosphorus": "总磷",
    "permanganate_index": "高锰酸盐指数",
}

METRIC_INDICATOR_ALIASES = {
    "溶解氧": "溶解氧",
    "氨氮": "氨氮",
    "总磷": "总磷",
    "高锰酸盐指数": "高锰酸钾指数",
    "高锰酸钾指数": "高锰酸钾指数",
}

MYSQL_CONFIG = {
    "host": os.getenv("MYSQL_HOST", "localhost"),
    "port": int(os.getenv("MYSQL_PORT", "3306")),
    "user": os.getenv("MYSQL_USER", "root"),
    "password": os.getenv("MYSQL_PASSWORD", "123456"),
    "database": os.getenv("MYSQL_DATABASE", "haihe_river_basin"),
    "charset": "utf8mb4",
    "cursorclass": pymysql.cursors.DictCursor,
}


@lru_cache(maxsize=16)
def _table_columns(table_name: str) -> set[str]:
    conn = pymysql.connect(**MYSQL_CONFIG)
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT COLUMN_NAME
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = %s
                """,
                (table_name,),
            )
            return {row["COLUMN_NAME"] for row in cursor.fetchall()}
    finally:
        conn.close()


def _available_indicator_fields(table_name: str) -> dict[str, str]:
    columns = _table_columns(table_name)
    return {
        field: label
        for field, label in INDICATOR_FIELDS.items()
        if field in columns
    }

NEO4J_CONFIG = get_neo4j_config()
NEO4J_URI = NEO4J_CONFIG["uri"]
NEO4J_USER = NEO4J_CONFIG["user"]
NEO4J_PASSWORD = NEO4J_CONFIG["password"]
NEO4J_DATABASE = NEO4J_CONFIG["database"]

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "").strip()
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-v4-flash").strip() or "deepseek-v4-flash"
DEEPSEEK_API_URL = os.getenv(
    "DEEPSEEK_API_URL",
    "https://api.deepseek.com/chat/completions",
)


class DecisionService:
    """按省生成 AI 治理决策。"""

    def __init__(self) -> None:
        self.mysql_conn = None
        self.neo4j_driver = None

    def _get_mysql(self):
        if not self.mysql_conn or not self.mysql_conn.open:
            self.mysql_conn = pymysql.connect(**MYSQL_CONFIG)
        return self.mysql_conn

    def _get_neo4j_driver(self):
        if not self.neo4j_driver:
            self.neo4j_driver = GraphDatabase.driver(
                NEO4J_URI,
                auth=(NEO4J_USER, NEO4J_PASSWORD),
            )
        return self.neo4j_driver

    def _get_neo4j_session(self):
        driver = self._get_neo4j_driver()
        if NEO4J_DATABASE:
            return driver.session(database=NEO4J_DATABASE)
        return driver.session()

    def close(self) -> None:
        if self.mysql_conn and self.mysql_conn.open:
            self.mysql_conn.close()
        if self.neo4j_driver:
            self.neo4j_driver.close()

    def _fmt(self, value: Any, digits: int = 4):
        if value is None:
            return None
        if isinstance(value, Decimal):
            value = float(value)
        if isinstance(value, (int, float)):
            return round(float(value), digits)
        return value

    def _date_text(self, value: Any) -> str | None:
        if value is None:
            return None
        if isinstance(value, datetime):
            return value.strftime("%Y-%m-%d")
        return str(value)[:10]

    def _normalize_model(self, model_type: str | None) -> str:
        value = (model_type or DEFAULT_MODEL_TYPE).upper()
        return value if value in SUPPORTED_MODELS else DEFAULT_MODEL_TYPE

    def _dictfetch_series(self, rows, date_key: str) -> list[dict[str, Any]]:
        return [
            {
                "date": self._date_text(row[date_key]),
                **{
                    field: self._fmt(row.get(field))
                    for field in INDICATOR_FIELDS
                    if field in row
                },
            }
            for row in rows
        ]

    def _indicator_items(self, *row_groups: Any) -> list[tuple[str, str]]:
        items = []
        for field, label in INDICATOR_FIELDS.items():
            for group in row_groups:
                if not group:
                    continue
                rows = group if isinstance(group, list) else [group]
                if any(field in row for row in rows if isinstance(row, dict)):
                    items.append((field, label))
                    break
        return items

    def get_prediction_window(self, province: str, model_type: str = DEFAULT_MODEL_TYPE) -> dict[str, Any]:
        conn = self._get_mysql()
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    MIN(DATE(predict_time)) AS start_date,
                    MAX(DATE(predict_time)) AS end_date,
                    COUNT(DISTINCT DATE(predict_time)) AS day_count
                FROM fact_water_quality_predict
                WHERE region_name = %s AND model_type = %s
                """,
                (province, self._normalize_model(model_type)),
            )
            row = cursor.fetchone()
        if not row or not row["start_date"] or not row["end_date"]:
            raise ValueError(f"{province} 暂无 {model_type} 预测数据")
        return {
            "start_date": self._date_text(row["start_date"]),
            "end_date": self._date_text(row["end_date"]),
            "day_count": int(row["day_count"] or 0),
        }

    def get_latest_history_date(self, province: str) -> str | None:
        conn = self._get_mysql()
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT MAX(DATE(monitor_time)) AS max_date FROM fact_water_quality_history WHERE region_name = %s",
                (province,),
            )
            row = cursor.fetchone()
        return self._date_text(row["max_date"]) if row and row["max_date"] else None

    def _resolve_window(self, default_end: str | None, start_date: str | None, end_date: str | None, days: int | None):
        resolved_end = end_date or default_end
        if not resolved_end:
            return None, None
        if start_date:
            return start_date, resolved_end
        if days:
            begin = datetime.strptime(resolved_end, "%Y-%m-%d") - timedelta(days=max(days - 1, 0))
            return begin.strftime("%Y-%m-%d"), resolved_end
        return None, resolved_end

    def get_prediction_trend(
        self,
        province: str,
        model_type: str = DEFAULT_MODEL_TYPE,
        days: int | None = None,
        end_date: str | None = None,
        start_date: str | None = None,
    ) -> list[dict[str, Any]]:
        window = self.get_prediction_window(province, model_type)
        sql_start, sql_end = self._resolve_window(window["end_date"], start_date, end_date, days)
        conn = self._get_mysql()
        prediction_fields = _available_indicator_fields("fact_water_quality_predict")
        select_metrics = ",\n                ".join(
            f"AVG({field}) AS {field}" for field in prediction_fields
        )
        query = """
            SELECT
                DATE(predict_time) AS stat_date
            FROM fact_water_quality_predict
            WHERE region_name = %s AND model_type = %s
        """
        if select_metrics:
            query = query.replace(
                "DATE(predict_time) AS stat_date",
                f"DATE(predict_time) AS stat_date,\n                {select_metrics}",
            )
        params = [province, self._normalize_model(model_type)]
        if sql_start and sql_end:
            query += " AND DATE(predict_time) BETWEEN %s AND %s"
            params.extend([sql_start, sql_end])
        elif sql_end:
            query += " AND DATE(predict_time) <= %s"
            params.append(sql_end)
        query += " GROUP BY DATE(predict_time) ORDER BY stat_date"
        with conn.cursor() as cursor:
            cursor.execute(query, tuple(params))
            rows = cursor.fetchall()
        return self._dictfetch_series(rows, "stat_date")

    def get_historical_trend(
        self,
        province: str,
        days: int | None = DEFAULT_HISTORY_DAYS,
        end_date: str | None = None,
        start_date: str | None = None,
    ) -> list[dict[str, Any]]:
        latest_history_date = self.get_latest_history_date(province)
        sql_start, sql_end = self._resolve_window(latest_history_date, start_date, end_date, days)
        conn = self._get_mysql()
        history_fields = _available_indicator_fields("fact_water_quality_history")
        select_metrics = ",\n                ".join(
            f"AVG({field}) AS {field}" for field in history_fields
        )
        query = """
            SELECT
                DATE(monitor_time) AS stat_date
            FROM fact_water_quality_history
            WHERE region_name = %s
        """
        if select_metrics:
            query = query.replace(
                "DATE(monitor_time) AS stat_date",
                f"DATE(monitor_time) AS stat_date,\n                {select_metrics}",
            )
        params = [province]
        if sql_start and sql_end:
            query += " AND DATE(monitor_time) BETWEEN %s AND %s"
            params.extend([sql_start, sql_end])
        elif sql_end:
            query += " AND DATE(monitor_time) <= %s"
            params.append(sql_end)
        query += " GROUP BY DATE(monitor_time) ORDER BY stat_date"
        with conn.cursor() as cursor:
            cursor.execute(query, tuple(params))
            rows = cursor.fetchall()
        return self._dictfetch_series(rows, "stat_date")

    def get_model_metrics(self, province: str, model_type: str = DEFAULT_MODEL_TYPE) -> dict[str, dict[str, float]]:
        conn = self._get_mysql()
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT indicator_name, metric_name, metric_value, sample_count
                FROM model_evaluation_metrics
                WHERE model_name = %s AND region_name = %s
                """,
                (self._normalize_model(model_type), province),
            )
            rows = cursor.fetchall()
        metrics: dict[str, dict[str, float]] = {}
        for row in rows:
            indicator = METRIC_INDICATOR_ALIASES.get(row["indicator_name"], row["indicator_name"])
            bucket = metrics.setdefault(indicator, {})
            bucket[row["metric_name"].upper()] = self._fmt(row["metric_value"], 6)
            if row.get("sample_count") is not None:
                bucket["sample_count"] = int(row["sample_count"])
        return metrics

    def get_latest_prediction(self, province: str, model_type: str = DEFAULT_MODEL_TYPE, end_date: str | None = None) -> dict[str, Any] | None:
        rows = self.get_prediction_trend(province, model_type=model_type, end_date=end_date, days=1 if end_date else None)
        if rows:
            return rows[-1]
        return None

    def get_upstream_network(self, province: str) -> list[dict[str, Any]]:
        with self._get_neo4j_session() as session:
            result = session.run(
                """
                MATCH (up:Station)-[r:UPSTREAM_OF]->(target:Station {province: $province})
                RETURN target.name AS target_station,
                       up.name AS upstream_station,
                       up.province AS upstream_province,
                       COALESCE(r.river, '') AS river,
                       COALESCE(r.distance_km, 0) AS distance_km,
                       COALESCE(r.flow_days, 0) AS flow_days
                ORDER BY upstream_province, upstream_station
                LIMIT 20
                """,
                province=province,
            )
            return [dict(record) for record in result]

    def get_upstream_pollution_trace(self, province: str, pollutant_name: str = "氨氮", date: str | None = None) -> list[dict[str, Any]]:
        analysis_date = date or self.get_latest_history_date(province) or self.get_prediction_window(province)["end_date"]
        with self._get_neo4j_session() as session:
            result = session.run(
                """
                MATCH (up:Station)-[r:UPSTREAM_OF]->(target:Station {province: $province})
                MATCH (up)-[e:EXCEEDS]->(p:Pollutant)
                WHERE e.date <= $analysis_date
                  AND ($pollutant_name = '' OR p.name = $pollutant_name)
                RETURN target.name AS target_station,
                       up.name AS upstream_station,
                       up.province AS upstream_province,
                       p.name AS pollutant,
                       e.date AS exceed_date,
                       COALESCE(e.val, 0) AS exceed_value,
                       COALESCE(e.limit, 0) AS limit_value,
                       COALESCE(e.ratio, 0) AS ratio,
                       COALESCE(r.river, '') AS river
                ORDER BY e.date DESC, ratio DESC
                LIMIT 12
                """,
                province=province,
                pollutant_name=pollutant_name or "",
                analysis_date=analysis_date,
            )
            traces = []
            for record in result:
                traces.append(
                    {
                        "target_station": record["target_station"],
                        "upstream_station": record["upstream_station"],
                        "upstream_province": record["upstream_province"],
                        "pollutant": record["pollutant"],
                        "exceed_date": self._date_text(record["exceed_date"]),
                        "exceed_value": self._fmt(record["exceed_value"]),
                        "limit": self._fmt(record["limit_value"]),
                        "ratio": self._fmt(record["ratio"]),
                        "river": record["river"],
                    }
                )
            return traces

    def get_water_level_distribution(self, province: str, date: str | None = None) -> dict[str, Any]:
        analysis_date = date or self.get_latest_history_date(province) or self.get_prediction_window(province)["end_date"]
        with self._get_neo4j_session() as session:
            nearest = session.run(
                """
                MATCH (s:Station {province: $province})-[h:HAS_LEVEL]->(:WaterLevel)
                WHERE h.date <= $analysis_date
                RETURN h.date AS level_date
                ORDER BY h.date DESC
                LIMIT 1
                """,
                province=province,
                analysis_date=analysis_date,
            ).single()
            if not nearest or not nearest["level_date"]:
                return {"date": None, "distribution": []}
            level_date = self._date_text(nearest["level_date"])
            result = session.run(
                """
                MATCH (s:Station {province: $province})-[h:HAS_LEVEL {date: $level_date}]->(w:WaterLevel)
                RETURN w.name AS level_name, COUNT(*) AS station_count
                ORDER BY station_count DESC, level_name
                """,
                province=province,
                level_date=level_date,
            )
            return {
                "date": level_date,
                "distribution": [
                    {"level": record["level_name"], "count": int(record["station_count"])}
                    for record in result
                ],
            }

    def _series_stats(self, series: list[dict[str, Any]], field: str) -> dict[str, Any] | None:
        values = [(row["date"], row.get(field)) for row in series if row.get(field) is not None]
        if not values:
            return None
        numbers = [item[1] for item in values]
        return {
            "start_date": values[0][0],
            "start_value": values[0][1],
            "end_date": values[-1][0],
            "end_value": values[-1][1],
            "delta": round(values[-1][1] - values[0][1], 4),
            "min_value": round(min(numbers), 4),
            "max_value": round(max(numbers), 4),
        }

    def _sample_series_text(self, series: list[dict[str, Any]], field: str, max_points: int = 5) -> str:
        samples = [(row["date"], row.get(field)) for row in series if row.get(field) is not None]
        if not samples:
            return "无有效样本"
        if len(samples) <= max_points:
            picked = samples
        else:
            step = max(1, (len(samples) - 1) // (max_points - 1))
            picked = [samples[index] for index in range(0, len(samples), step)][: max_points - 1]
            if picked[-1] != samples[-1]:
                picked.append(samples[-1])
        return "；".join(f"{day}:{value}" for day, value in picked)

    def _build_trend_summary(self, prediction_trend: list[dict[str, Any]]) -> list[str]:
        lines = []
        for field, label in self._indicator_items(prediction_trend):
            stats = self._series_stats(prediction_trend, field)
            if not stats:
                lines.append(f"{label}：当前模型预测序列为空。")
                continue
            direction = "上升" if stats["delta"] > 0 else "下降" if stats["delta"] < 0 else "基本持平"
            lines.append(
                f"{label}：{stats['start_date']} 为 {stats['start_value']}，{stats['end_date']} 为 {stats['end_value']}，"
                f"区间总体{direction}，最小值 {stats['min_value']}，最大值 {stats['max_value']}。"
            )
            lines.append(f"{label}关键采样：{self._sample_series_text(prediction_trend, field)}。")
        return lines

    def _build_comparison_summary(self, historical_trend: list[dict[str, Any]], prediction_trend: list[dict[str, Any]]) -> list[str]:
        history_map = {row["date"]: row for row in historical_trend}
        prediction_map = {row["date"]: row for row in prediction_trend}
        common_dates = sorted(set(history_map) & set(prediction_map))
        if not common_dates:
            return ["当前历史监测与预测序列没有同日重叠区间，无法直接计算贴合度。"]
        lines = [f"历史监测与预测在 {common_dates[0]} 至 {common_dates[-1]} 存在 {len(common_dates)} 天重叠区间。"]
        for field, label in self._indicator_items(historical_trend, prediction_trend):
            gaps = []
            for day in common_dates:
                actual = history_map[day].get(field)
                predicted = prediction_map[day].get(field)
                if actual is None or predicted is None:
                    continue
                gaps.append(abs(predicted - actual))
            if not gaps:
                lines.append(f"{label}：重叠日期存在，但预测值为空。")
                continue
            lines.append(f"{label}：重叠区间平均绝对误差约 {round(sum(gaps) / len(gaps), 4)}。")
        return lines

    def _build_metric_summary(self, metrics: dict[str, dict[str, float]]) -> list[str]:
        if not metrics:
            return ["当前库中未查询到该省份该模型的评估指标。"]
        lines = []
        for indicator, bucket in metrics.items():
            parts = []
            for metric_name in ("MAE", "MSE", "RMSE", "R2"):
                if metric_name in bucket:
                    parts.append(f"{metric_name}={bucket[metric_name]}")
            if "sample_count" in bucket:
                parts.append(f"样本数={bucket['sample_count']}")
            lines.append(f"{indicator}：{'，'.join(parts) if parts else '暂无统计值'}。")
        return lines

    def _build_trace_summary(self, network: list[dict[str, Any]], traces: list[dict[str, Any]]) -> list[str]:
        lines = []
        if network:
            preview = "；".join(
                (
                    f"{item['upstream_province']}{item['upstream_station']} -> {item['target_station']}"
                    + (f"（{item['river']}）" if item.get("river") else "")
                )
                for item in network[:4]
            )
            lines.append(f"上游链路共识别 {len(network)} 条，示例：{preview}。")
        else:
            lines.append("Neo4j 中未识别到该省对应的上游站点链路。")
        if traces:
            preview = "；".join(
                f"{item['exceed_date']} {item['upstream_province']}{item['upstream_station']} {item['pollutant']}超标倍数{item['ratio']}"
                for item in traces[:4]
            )
            lines.append(f"上游超标事件共检索到 {len(traces)} 条，最近高风险记录：{preview}。")
        else:
            lines.append("在当前分析日期之前，未检索到直接关联的上游超标事件。")
        return lines

    def _build_water_level_summary(self, water_level: dict[str, Any]) -> list[str]:
        if not water_level.get("date") or not water_level.get("distribution"):
            return ["未查询到对应日期的水质等级分布。"]
        summary = "，".join(f"{item['level']} {item['count']}个站点" for item in water_level["distribution"])
        return [f"{water_level['date']} 的水质等级分布为：{summary}。"]

    def build_context(self, province: str, date: str | None = None, model_type: str = DEFAULT_MODEL_TYPE) -> dict[str, Any]:
        model_name = self._normalize_model(model_type)
        full_window = self.get_prediction_window(province, model_name)
        analysis_date = min(date or full_window["end_date"], full_window["end_date"])
        prediction_trend = self.get_prediction_trend(
            province,
            model_type=model_name,
            start_date=full_window["start_date"],
            end_date=analysis_date,
        )
        historical_trend = self.get_historical_trend(
            province,
            start_date=full_window["start_date"],
            end_date=analysis_date,
        )
        latest_prediction = prediction_trend[-1] if prediction_trend else None
        metrics = self.get_model_metrics(province, model_name)
        upstream_network = self.get_upstream_network(province)
        upstream_traces = self.get_upstream_pollution_trace(province, pollutant_name="", date=analysis_date)
        water_level = self.get_water_level_distribution(province, date=analysis_date)
        context = {
            "prompt_version": PROMPT_VERSION,
            "province": province,
            "analysis_date": analysis_date,
            "model_type": model_name,
            "prediction_range": {
                "start_date": full_window["start_date"],
                "end_date": analysis_date,
                "day_count": len(prediction_trend),
                "full_day_count": full_window["day_count"],
            },
            "historical_range": {
                "start_date": historical_trend[0]["date"] if historical_trend else None,
                "end_date": historical_trend[-1]["date"] if historical_trend else None,
                "day_count": len(historical_trend),
            },
            "latest_prediction": latest_prediction,
            "prediction_trend": prediction_trend,
            "historical_trend": historical_trend,
            "model_metrics": metrics,
            "upstream_network": upstream_network,
            "upstream_traces": upstream_traces,
            "water_level_distribution": water_level,
        }
        context["summary"] = {
            "coverage_note": (
                f"{province}{model_name} 当前可用预测区间为 "
                f"{full_window['start_date']} 至 {full_window['end_date']}，"
                f"本次分析截至 {analysis_date}，纳入 {len(prediction_trend)} 天预测样本。"
            ),
            "trend_lines": self._build_trend_summary(prediction_trend),
            "comparison_lines": self._build_comparison_summary(historical_trend, prediction_trend),
            "metric_lines": self._build_metric_summary(metrics),
            "trace_lines": self._build_trace_summary(upstream_network, upstream_traces),
            "water_level_lines": self._build_water_level_summary(water_level),
        }
        return context

    def generate_prompt(self, context: dict[str, Any]) -> str:
        latest = context.get("latest_prediction") or {}
        summary = context["summary"]
        latest_parts = []
        for field, label in self._indicator_items(context.get("prediction_trend"), context.get("historical_trend"), latest):
            value = latest.get(field)
            if value is not None:
                latest_parts.append(f"{label}{value}")
        latest_text = "，".join(latest_parts) if latest_parts else "暂无最新预测值"
        blocks = [
            f"[PROMPT_VERSION={PROMPT_VERSION}]",
            "你是流域水环境治理专家，请基于真实数据库上下文输出分省治理决策。",
            f"分析对象：{context['province']}，模型：{context['model_type']}，分析日期：{context['analysis_date']}。",
            summary["coverage_note"],
            f"最新预测摘要：{latest.get('date', context['analysis_date'])}，{latest_text}。",
            "三个月预测趋势：",
            *[f"- {line}" for line in summary["trend_lines"]],
            "历史监测与预测重叠对比：",
            *[f"- {line}" for line in summary["comparison_lines"]],
            "模型评估指标：",
            *[f"- {line}" for line in summary["metric_lines"]],
            "Neo4j 溯源图谱信息：",
            *[f"- {line}" for line in summary["trace_lines"]],
            "水质等级分布：",
            *[f"- {line}" for line in summary["water_level_lines"]],
            "请严格基于上述数据生成治理方案，不要编造未提供的监测值或站点。",
            "输出格式要求：",
            "1. 先给出一句总体判断。",
            "2. 分别写“趋势判断”“风险溯源”“治理建议”“实施优先级”四段。",
            "3. 每段 2-4 句，突出可执行性。",
            "4. 如果某指标缺失，明确说明“当前库中暂无该指标有效预测值”。",
        ]
        return "\n".join(blocks)

    def _render_fallback_report(self, context: dict[str, Any]) -> str:
        summary = context["summary"]
        return "\n".join(
            [
                f"总体判断：{context['province']}{context['model_type']} 预测显示，当前分析期内水质风险存在分化，建议采用“重点指标压降 + 上游协同联防”的治理策略。",
                f"趋势判断：{summary['coverage_note']} {' '.join(summary['trend_lines'][:2])}",
                f"风险溯源：{' '.join(summary['trace_lines'][:2])}",
                f"治理建议：优先围绕氨氮、总磷等高敏感指标安排排查，结合重叠区间误差和历史贴合度，对波动较大的断面增加采样频次，并对上游高风险站点开展联合溯源。",
                "实施优先级：先稳住近期波动最大的指标，再对上游链路中近期出现超标记录的站点实施清单化治理，最后按水质等级分布结果滚动复核治理效果。",
            ]
        )

    def call_deepseek(self, prompt: str, context: dict[str, Any]) -> tuple[str, str]:
        if not DEEPSEEK_API_KEY:
            return self._render_fallback_report(context), "fallback"
        payload = {
            "model": DEEPSEEK_MODEL,
            "temperature": 0.3,
            "messages": [
                {"role": "system", "content": "你是严谨的水环境治理分析助手。"},
                {"role": "user", "content": prompt},
            ],
        }
        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json",
        }
        try:
            response = requests.post(DEEPSEEK_API_URL, json=payload, headers=headers, timeout=60)
            response.raise_for_status()
            body = response.json()
            content = body["choices"][0]["message"]["content"].strip()
            return content or self._render_fallback_report(context), "deepseek"
        except Exception:
            return self._render_fallback_report(context), "fallback"

    def save_decision(self, province: str, analysis_date: str, model_type: str, prompt: str, response: str) -> int:
        conn = self._get_mysql()
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO ai_governance_report (region_name, generate_time, context_prompt, report_content, model_type)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (province, analysis_date, prompt, response, self._normalize_model(model_type)),
            )
            conn.commit()
            return int(cursor.lastrowid)

    def get_existing_decision(self, province: str, analysis_date: str, model_type: str) -> dict[str, Any] | None:
        conn = self._get_mysql()
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, region_name, generate_time, report_content, model_type, created_at
                FROM ai_governance_report
                WHERE region_name = %s
                  AND DATE(generate_time) = %s
                  AND model_type = %s
                  AND context_prompt LIKE %s
                ORDER BY id DESC
                LIMIT 1
                """,
                (province, analysis_date, self._normalize_model(model_type), f"%{PROMPT_VERSION}%"),
            )
            return cursor.fetchone()

    def get_decision_history(self, province: str, limit: int = 10):
        conn = self._get_mysql()
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, region_name, generate_time, report_content, model_type, created_at
                FROM ai_governance_report
                WHERE region_name = %s
                ORDER BY id DESC
                LIMIT %s
                """,
                (province, int(limit)),
            )
            return cursor.fetchall()

    def generate_decision(
        self,
        province: str,
        date: str | None = None,
        model_type: str = DEFAULT_MODEL_TYPE,
        force_refresh: bool = False,
    ) -> dict[str, Any]:
        context = self.build_context(province, date, model_type)
        analysis_date = context["analysis_date"]
        if not force_refresh:
            cached = self.get_existing_decision(province, analysis_date, context["model_type"])
            if cached:
                return {
                    "id": cached["id"],
                    "province": province,
                    "date": analysis_date,
                    "model_type": context["model_type"],
                    "report": cached["report_content"],
                    "source": "cache",
                    "prompt_version": PROMPT_VERSION,
                    "summary": context["summary"],
                    "prediction_range": context["prediction_range"],
                    "historical_range": context["historical_range"],
                }
        prompt = self.generate_prompt(context)
        report, source = self.call_deepseek(prompt, context)
        decision_id = self.save_decision(province, analysis_date, context["model_type"], prompt, report)
        return {
            "id": decision_id,
            "province": province,
            "date": analysis_date,
            "model_type": context["model_type"],
            "report": report,
            "source": source,
            "prompt_version": PROMPT_VERSION,
            "summary": context["summary"],
            "prediction_range": context["prediction_range"],
            "historical_range": context["historical_range"],
        }
