# AI辅助生成：豆包-专家版, 2026-04-11
from collections import defaultdict
from datetime import datetime, timedelta

import numpy as np

from models.water_quality import WaterQuality


SIX_PROVINCES = ['北京市', '天津市', '河北省', '山西省', '山东省', '河南省']
PROVINCE_INDEX = {name: idx for idx, name in enumerate(SIX_PROVINCES)}

LEVEL_META = {
    1: {'name': 'Ⅰ类', 'color': '#22c55e'},
    2: {'name': 'Ⅱ类', 'color': '#38bdf8'},
    3: {'name': 'Ⅲ类', 'color': '#facc15'},
    4: {'name': 'Ⅳ类', 'color': '#fb7185'},
    5: {'name': 'Ⅴ类', 'color': '#ef4444'},
    6: {'name': '劣Ⅴ类', 'color': '#7f1d1d'},
}

INDICATORS = [
    {'field': 'ph', 'name': 'pH', 'unit': '', 'decimals': 2, 'threshold': {'type': 'range', 'min': 6.0, 'max': 9.0, 'source': 'GB 3838-2002 Ⅲ类'}},
    {'field': 'ammonia_nitrogen', 'name': '氨氮', 'unit': 'mg/L', 'decimals': 3, 'threshold': {'type': 'low', 'value': 1.0, 'source': 'GB 3838-2002 Ⅲ类'}},
    {'field': 'dissolved_oxygen', 'name': '溶解氧', 'unit': 'mg/L', 'decimals': 2, 'threshold': {'type': 'high', 'value': 5.0, 'source': 'GB 3838-2002 Ⅲ类'}},
    {'field': 'conductivity', 'name': '电导率', 'unit': 'μS/cm', 'decimals': 1, 'threshold': {'type': 'reference_high', 'quantile': 90, 'source': '历史P90参考阈值'}},
    {'field': 'permanganate_index', 'name': '高锰酸钾指数', 'unit': 'mg/L', 'decimals': 2, 'threshold': {'type': 'low', 'value': 6.0, 'source': 'GB 3838-2002 Ⅲ类'}},
    {'field': 'water_temp', 'name': '水温', 'unit': '℃', 'decimals': 2, 'threshold': {'type': 'reference_high', 'quantile': 90, 'source': '历史P90参考阈值'}},
    {'field': 'chlorophyll', 'name': '叶绿素', 'unit': 'μg/L', 'decimals': 2, 'threshold': {'type': 'reference_high', 'quantile': 90, 'source': '历史P90参考阈值'}},
    {'field': 'algae_density', 'name': '藻密度', 'unit': 'cells/mL', 'decimals': 0, 'threshold': {'type': 'reference_high', 'quantile': 90, 'source': '历史P90参考阈值'}},
    {'field': 'turbidity', 'name': '浊度', 'unit': 'NTU', 'decimals': 2, 'threshold': {'type': 'reference_high', 'quantile': 90, 'source': '历史P90参考阈值'}},
    {'field': 'total_nitrogen', 'name': '总氮', 'unit': 'mg/L', 'decimals': 2, 'threshold': {'type': 'low', 'value': 1.0, 'source': 'GB 3838-2002 Ⅲ类'}},
    {'field': 'total_phosphorus', 'name': '总磷', 'unit': 'mg/L', 'decimals': 3, 'threshold': {'type': 'low', 'value': 0.2, 'source': 'GB 3838-2002 Ⅲ类'}},
]
INDICATOR_MAP = {item['field']: item for item in INDICATORS}
POLLUTANT_FIELDS = ['dissolved_oxygen', 'ammonia_nitrogen', 'total_nitrogen', 'total_phosphorus', 'permanganate_index', 'ph']
CORE_FIELDS = ['dissolved_oxygen', 'ammonia_nitrogen', 'total_phosphorus', 'permanganate_index']
CORE_POINTS = {
    'dissolved_oxygen': [(0.0, 0.0), (2.0, 30.0), (3.0, 45.0), (5.0, 70.0), (6.0, 85.0), (7.5, 100.0)],
    'ammonia_nitrogen': [(0.0, 100.0), (0.15, 96.0), (0.5, 85.0), (1.0, 70.0), (1.5, 55.0), (2.0, 40.0), (3.0, 20.0)],
    'total_phosphorus': [(0.0, 100.0), (0.02, 96.0), (0.1, 85.0), (0.2, 70.0), (0.3, 55.0), (0.4, 40.0), (0.6, 20.0)],
    'permanganate_index': [(0.0, 100.0), (2.0, 96.0), (4.0, 85.0), (6.0, 70.0), (10.0, 55.0), (15.0, 35.0), (20.0, 20.0)],
}


def _scope(province):
    if province in SIX_PROVINCES:
        return [province], province
    return list(SIX_PROVINCES), '全流域'


def _in_clause(column, values):
    return f"{column} IN ({','.join(['%s'] * len(values))})", list(values)


def _f(value, digits=None):
    if value is None:
        return None
    value = float(value)
    return round(value, digits) if digits is not None else value


def _d(value):
    return str(value) if value is not None else None


def _date_obj(value):
    if value is None:
        return None
    if hasattr(value, "strftime"):
        return value
    text = str(value)[:10]
    return datetime.strptime(text, "%Y-%m-%d")


def _interp(value, points):
    if value is None:
        return None
    value = float(value)
    if value <= points[0][0]:
        return points[0][1]
    for i in range(1, len(points)):
        x1, y1 = points[i - 1]
        x2, y2 = points[i]
        if value <= x2:
            return y1 + (y2 - y1) * (value - x1) / (x2 - x1)
    return points[-1][1]


def _level(do, nh3, tp, codmn):
    level = 1
    if do is not None:
        do = float(do)
        if do < 2:
            level = max(level, 6)
        elif do < 3:
            level = max(level, 5)
        elif do < 5:
            level = max(level, 4)
        elif do < 6:
            level = max(level, 3)
        elif do < 7.5:
            level = max(level, 2)
    if nh3 is not None:
        nh3 = float(nh3)
        if nh3 > 2:
            level = max(level, 6)
        elif nh3 > 1.5:
            level = max(level, 5)
        elif nh3 > 1:
            level = max(level, 4)
        elif nh3 > 0.5:
            level = max(level, 3)
        elif nh3 > 0.15:
            level = max(level, 2)
    if tp is not None:
        tp = float(tp)
        if tp > 0.4:
            level = max(level, 6)
        elif tp > 0.3:
            level = max(level, 5)
        elif tp > 0.2:
            level = max(level, 4)
        elif tp > 0.1:
            level = max(level, 3)
        elif tp > 0.02:
            level = max(level, 2)
    if codmn is not None:
        codmn = float(codmn)
        if codmn > 15:
            level = max(level, 6)
        elif codmn > 10:
            level = max(level, 5)
        elif codmn > 6:
            level = max(level, 4)
        elif codmn > 4:
            level = max(level, 3)
        elif codmn > 2:
            level = max(level, 2)
    return level


def _score(row):
    values = []
    for field in CORE_FIELDS:
        score = _interp(row.get(field), CORE_POINTS[field])
        if score is not None:
            values.append(score)
    return round(sum(values) / len(values), 1) if values else None


def _resolve_threshold(meta, refs):
    t = meta['threshold']
    if t['type'] == 'range':
        return {'min': t['min'], 'max': t['max']}
    if t['type'] == 'reference_high':
        return refs.get(meta['field'])
    return t['value']


def _threshold_display(meta, refs):
    t = meta['threshold']
    value = _resolve_threshold(meta, refs)
    if value is None:
        return '暂无'
    if t['type'] == 'range':
        return f"{t['min']:.1f}-{t['max']:.1f}"
    if t['type'] == 'high':
        return f"≥ {value:.1f}"
    if t['type'] == 'low':
        return f"≤ {value:.{meta['decimals']}f}"
    return f"> P90 ({value:.{meta['decimals']}f})"


def _exceeded(value, meta, refs):
    if value is None:
        return False
    value = float(value)
    t = meta['threshold']['type']
    limit = _resolve_threshold(meta, refs)
    if limit is None:
        return False
    if t == 'high':
        return value < float(limit)
    if t in ('low', 'reference_high'):
        return value > float(limit)
    return value < float(limit['min']) or value > float(limit['max'])


def _severity(value, meta, refs):
    if value is None:
        return 0.0
    value = float(value)
    t = meta['threshold']['type']
    limit = _resolve_threshold(meta, refs)
    if limit is None:
        return 0.0
    if t == 'high':
        base = max(float(limit), 0.0001)
        return max((base - value) / base, 0.0)
    if t in ('low', 'reference_high'):
        base = max(float(limit), 0.0001)
        return max((value - base) / base, 0.0)
    if value < limit['min']:
        return (limit['min'] - value) / max(abs(limit['min']), 1.0)
    if value > limit['max']:
        return (value - limit['max']) / max(abs(limit['max']), 1.0)
    return 0.0


def _change_state(meta, current, previous):
    if current is None or previous is None:
        return 'neutral'
    delta = float(current) - float(previous)
    if abs(delta) < 1e-9:
        return 'steady'
    t = meta['threshold']['type']
    if t == 'high':
        return 'improved' if delta > 0 else 'worsened'
    if t in ('low', 'reference_high'):
        return 'improved' if delta < 0 else 'worsened'
    current_gap = _severity(current, meta, {})
    previous_gap = _severity(previous, meta, {})
    if current_gap < previous_gap:
        return 'improved'
    if current_gap > previous_gap:
        return 'worsened'
    return 'steady'


def _dominant(row, refs, fields=None):
    best_name, best_ratio = '综合达标', 0.0
    for field in fields or POLLUTANT_FIELDS:
        meta = INDICATOR_MAP[field]
        ratio = _severity(row.get(field), meta, refs)
        if ratio > best_ratio:
            best_name, best_ratio = meta['name'], ratio
    return best_name, round(best_ratio, 4)


def _sort_provinces(items):
    return sorted(items, key=lambda x: PROVINCE_INDEX.get(x['province'], 99))


def _station_count(cursor, clause, params, province_grouped=False):
    if province_grouped:
        cursor.execute(
            f"""
            SELECT province, COUNT(DISTINCT location) AS station_count
            FROM water_quality_raw
            WHERE {clause} AND location IS NOT NULL AND TRIM(location) <> ''
            GROUP BY province
            """,
            params,
        )
        rows = cursor.fetchall()
        counts = {row['province']: int(row['station_count'] or 0) for row in rows}
        if any(value >= 10 for value in counts.values()):
            return counts

        cursor.execute(
            f"""
            SELECT province, COUNT(DISTINCT station_name) AS station_count
            FROM station_coordinates
            WHERE {clause} AND station_name IS NOT NULL
            GROUP BY province
            """,
            params,
        )
        rows = cursor.fetchall()
        return {row['province']: int(row['station_count'] or 0) for row in rows}

    cursor.execute(
        f"""
        SELECT COUNT(DISTINCT location) AS station_count
        FROM water_quality_raw
        WHERE {clause} AND location IS NOT NULL AND TRIM(location) <> ''
        """,
        params,
    )
    count = int((cursor.fetchone() or {}).get('station_count') or 0)
    if count >= 50:
        return count

    cursor.execute(
        f"""
        SELECT COUNT(DISTINCT station_name) AS station_count
        FROM station_coordinates
        WHERE {clause} AND station_name IS NOT NULL
        """,
        params,
    )
    return int((cursor.fetchone() or {}).get('station_count') or count)


def _reference_thresholds(cursor):
    fields = [item['field'] for item in INDICATORS if item['threshold']['type'] == 'reference_high']
    clause, params = _in_clause('province', SIX_PROVINCES)
    cursor.execute(f"SELECT {', '.join(fields)} FROM water_quality_raw WHERE {clause}", params)
    rows = cursor.fetchall()
    result = {}
    for item in INDICATORS:
        if item['threshold']['type'] != 'reference_high':
            continue
        values = [float(row[item['field']]) for row in rows if row.get(item['field']) is not None]
        result[item['field']] = round(float(np.percentile(values, item['threshold'].get('quantile', 90))), item['decimals']) if values else None
    return result


def get_screen_overview_data(province='all'):
    scope_provinces, scope_label = _scope(province)
    hist_clause, hist_params = _in_clause('province', scope_provinces)
    pred_clause, pred_params = _in_clause('region_name', scope_provinces)
    all_clause, all_params = _in_clause('province', SIX_PROVINCES)
    avg_sql = ', '.join([f"AVG({item['field']}) AS {item['field']}" for item in INDICATORS])
    fields_sql = ', '.join([item['field'] for item in INDICATORS])

    conn = WaterQuality.get_db()
    try:
        with conn.cursor() as cursor:
            refs = _reference_thresholds(cursor)

            cursor.execute(f"SELECT MIN(year_date) AS min_date, MAX(year_date) AS max_date, COUNT(*) AS total_records, COUNT(DISTINCT year_date) AS day_count FROM water_quality_raw WHERE {hist_clause}", hist_params)
            history = cursor.fetchone() or {}
            latest_date = history.get('max_date')
            if latest_date is None:
                return {'scope': {'province': province if province in SIX_PROVINCES else 'all', 'label': scope_label}, 'message': '当前范围暂无可用监测数据'}

            cursor.execute(f"SELECT MIN(DATE(predict_time)) AS min_date, MAX(DATE(predict_time)) AS max_date, COUNT(*) AS total_records FROM fact_water_quality_predict WHERE {pred_clause}", pred_params)
            prediction = cursor.fetchone() or {}
            cursor.execute(f"SELECT MAX(year_date) AS compare_date FROM water_quality_raw WHERE {hist_clause} AND year_date <= DATE_SUB(%s, INTERVAL 1 YEAR)", hist_params + [latest_date])
            compare_date = (cursor.fetchone() or {}).get('compare_date')
            cursor.execute(f"SELECT {avg_sql}, COUNT(*) AS sample_count FROM water_quality_raw WHERE {hist_clause} AND year_date=%s", hist_params + [latest_date])
            latest = cursor.fetchone() or {}
            compare = {}
            if compare_date is not None:
                cursor.execute(f"SELECT {avg_sql} FROM water_quality_raw WHERE {hist_clause} AND year_date=%s", hist_params + [compare_date])
                compare = cursor.fetchone() or {}

            cursor.execute(f"SELECT {fields_sql} FROM water_quality_raw WHERE {hist_clause} AND year_date BETWEEN DATE_SUB(%s, INTERVAL 29 DAY) AND %s", hist_params + [latest_date, latest_date])
            window_rows = cursor.fetchall()
            scope_station_count = _station_count(cursor, hist_clause, hist_params)
            cursor.execute(f"SELECT year_date, AVG(dissolved_oxygen) AS dissolved_oxygen, AVG(ammonia_nitrogen) AS ammonia_nitrogen, AVG(total_phosphorus) AS total_phosphorus, AVG(permanganate_index) AS permanganate_index FROM water_quality_raw WHERE {hist_clause} GROUP BY year_date ORDER BY year_date", hist_params)
            daily_rows = cursor.fetchall()

            cursor.execute(f"""
                SELECT w.province, latest.latest_date, AVG(w.ph) AS ph, AVG(w.dissolved_oxygen) AS dissolved_oxygen,
                       AVG(w.ammonia_nitrogen) AS ammonia_nitrogen, AVG(w.total_phosphorus) AS total_phosphorus,
                       AVG(w.total_nitrogen) AS total_nitrogen, AVG(w.permanganate_index) AS permanganate_index, COUNT(*) AS sample_count
                FROM water_quality_raw w
                JOIN (SELECT province, MAX(year_date) AS latest_date FROM water_quality_raw WHERE {all_clause} GROUP BY province) latest
                  ON latest.province = w.province AND latest.latest_date = w.year_date
                GROUP BY w.province, latest.latest_date
            """, all_params)
            province_rows = cursor.fetchall()
            station_counts = _station_count(cursor, all_clause, all_params, province_grouped=True)
            cursor.execute(f"SELECT station_name, province, river_basin, longitude_gcj02, latitude_gcj02 FROM station_coordinates WHERE {hist_clause} AND longitude_gcj02 IS NOT NULL AND latitude_gcj02 IS NOT NULL", hist_params)
            stations = cursor.fetchall()

            cursor.execute(f"SELECT model_name, metric_name, AVG(metric_value) AS avg_value FROM model_evaluation_metrics WHERE {pred_clause} GROUP BY model_name, metric_name", pred_params)
            model_rows = cursor.fetchall()
            cursor.execute(f"SELECT COUNT(DISTINCT indicator_name) AS indicator_count FROM model_evaluation_metrics WHERE {pred_clause}", pred_params)
            metric_indicator_count = int((cursor.fetchone() or {}).get('indicator_count') or 0)

        indicator_cards, pollutant_ranking = [], []
        for item in INDICATORS:
            field = item['field']
            current = _f(latest.get(field), item['decimals'])
            previous = _f(compare.get(field), item['decimals']) if compare else None
            values = [float(row[field]) for row in window_rows if row.get(field) is not None]
            exceed_count = sum(1 for value in values if _exceeded(value, item, refs))
            exceed_rate = round(exceed_count * 100 / len(values), 1) if values else None
            yoy = None
            if previous is not None and abs(previous) >= 1e-9:
                yoy = round(((current or 0.0) - previous) / abs(previous) * 100, 1)
            indicator_cards.append({
                'name': item['name'], 'field': field, 'unit': item['unit'], 'value': current,
                'previous_value': previous, 'yoy_change': yoy, 'change_state': _change_state(item, current, previous),
                'rate_label': '超阈率' if item['threshold']['type'] == 'reference_high' else '超标率',
                'exceed_rate': exceed_rate, 'exceed_count': exceed_count, 'sample_count': len(values),
                'coverage_rate': round(len(values) * 100 / len(window_rows), 1) if window_rows else 0.0,
                'threshold_source': item['threshold']['source'], 'threshold_display': _threshold_display(item, refs),
            })
            if field in POLLUTANT_FIELDS:
                pollutant_ranking.append({
                    'name': item['name'], 'field': field, 'rate': exceed_rate or 0.0,
                    'exceed_count': exceed_count, 'sample_count': len(values),
                    'threshold_source': item['threshold']['source'], 'threshold_display': _threshold_display(item, refs),
                })
        pollutant_ranking.sort(key=lambda x: (x['rate'], x['exceed_count']), reverse=True)

        province_snapshots = []
        for row in province_rows:
            snapshot = {
                'province': row['province'], 'latest_date': _d(row['latest_date']), 'ph': _f(row.get('ph'), 2),
                'dissolved_oxygen': _f(row.get('dissolved_oxygen'), 2), 'ammonia_nitrogen': _f(row.get('ammonia_nitrogen'), 3),
                'total_phosphorus': _f(row.get('total_phosphorus'), 3), 'total_nitrogen': _f(row.get('total_nitrogen'), 2),
                'permanganate_index': _f(row.get('permanganate_index'), 2), 'sample_count': int(row.get('sample_count') or 0),
                'station_count': station_counts.get(row['province'], 0),
            }
            lv = _level(snapshot['dissolved_oxygen'], snapshot['ammonia_nitrogen'], snapshot['total_phosphorus'], snapshot['permanganate_index'])
            dominant_name, dominant_ratio = _dominant(snapshot, refs)
            snapshot.update({
                'level_index': lv, 'level_name': LEVEL_META[lv]['name'], 'color': LEVEL_META[lv]['color'],
                'composite_score': _score(snapshot), 'dominant_pollutant': dominant_name, 'dominant_ratio': dominant_ratio,
            })
            province_snapshots.append(snapshot)
        province_snapshots = _sort_provinces(province_snapshots)
        province_map = {item['province']: item for item in province_snapshots}
        province_ranking = sorted(province_snapshots, key=lambda x: x['composite_score'] if x['composite_score'] is not None else -1, reverse=True)
        for idx, item in enumerate(province_ranking, 1):
            item['rank'] = idx
            item['selected'] = item['province'] == scope_label

        station_points = []
        for row in stations:
            snap = province_map.get(row['province'])
            if not snap:
                continue
            station_points.append({
                'name': row['station_name'], 'province': row['province'], 'river_basin': row['river_basin'],
                'value': [_f(row['longitude_gcj02'], 6), _f(row['latitude_gcj02'], 6), snap['composite_score'] or 0.0],
                'composite_score': snap['composite_score'], 'level_index': snap['level_index'], 'level_name': snap['level_name'],
                'color': snap['color'], 'latest_date': snap['latest_date'], 'dissolved_oxygen': snap['dissolved_oxygen'],
                'ammonia_nitrogen': snap['ammonia_nitrogen'], 'total_phosphorus': snap['total_phosphorus'],
                'permanganate_index': snap['permanganate_index'], 'station_count': snap['station_count'],
            })

        latest_date_obj = _date_obj(latest_date)
        compare_date_obj = _date_obj(compare_date)
        monthly = defaultdict(lambda: {'scores': [], 'dissolved_oxygen': [], 'ammonia_nitrogen': [], 'total_phosphorus': [], 'permanganate_index': []})
        for row in daily_rows:
            month = _date_obj(row['year_date']).strftime('%Y-%m')
            score = _score(row)
            if score is not None:
                monthly[month]['scores'].append(score)
            for field in CORE_FIELDS:
                if row.get(field) is not None:
                    monthly[month][field].append(float(row[field]))
        monthly_rows = []
        for month in sorted(monthly):
            bucket = monthly[month]
            if not bucket['scores']:
                continue
            row = {'month': month, 'score': round(sum(bucket['scores']) / len(bucket['scores']), 1)}
            for field, digits in [('dissolved_oxygen', 2), ('ammonia_nitrogen', 3), ('total_phosphorus', 3), ('permanganate_index', 2)]:
                row[field] = round(sum(bucket[field]) / len(bucket[field]), digits) if bucket[field] else None
            row['dominant_pollutant'], _ = _dominant(row, refs, CORE_FIELDS)
            monthly_rows.append(row)
        monthly_rows = monthly_rows[-12:]
        trend_scores = [row['score'] for row in monthly_rows]
        mean_score = float(np.mean(trend_scores)) if trend_scores else 0.0
        std_score = float(np.std(trend_scores)) if trend_scores else 0.0
        anomalies = [row for row in monthly_rows if row['score'] <= mean_score - std_score]
        if not anomalies and monthly_rows:
            anomalies = sorted(monthly_rows, key=lambda x: x['score'])[:min(3, len(monthly_rows))]

        model_summary_map = defaultdict(dict)
        for row in model_rows:
            model_summary_map[row['model_name']][row['metric_name']] = _f(row['avg_value'], 4)
        model_summary = []
        for name in ['ARIMA', 'LSTM']:
            if name in model_summary_map:
                model_summary.append({'model_name': name, 'avg_mae': model_summary_map[name].get('MAE'), 'avg_mse': model_summary_map[name].get('MSE')})

        latest_level = _level(latest.get('dissolved_oxygen'), latest.get('ammonia_nitrogen'), latest.get('total_phosphorus'), latest.get('permanganate_index'))
        latest_score = _score(latest)
        best_mae = min((item for item in model_summary if item['avg_mae'] is not None), key=lambda x: x['avg_mae'], default=None)
        best_mse = min((item for item in model_summary if item['avg_mse'] is not None), key=lambda x: x['avg_mse'], default=None)

        return {
            'scope': {
                'province': province if province in SIX_PROVINCES else 'all',
                'label': scope_label,
                'history_start': _d(history.get('min_date')),
                'history_end': _d(history.get('max_date')),
                'history_days': int(history.get('day_count') or 0),
                'history_records': int(history.get('total_records') or 0),
                'prediction_start': _d(prediction.get('min_date')),
                'prediction_end': _d(prediction.get('max_date')),
                'prediction_records': int(prediction.get('total_records') or 0),
                'latest_history_date': _d(latest_date),
                'comparison_date': _d(compare_date),
                'window_start': _d(latest_date_obj - timedelta(days=29) if latest_date_obj else None),
                'window_end': _d(latest_date_obj),
            },
            'header': {
                'title': '海河六域・水质时空演变智能治理系统',
                'monitor_range': '京津晋冀鲁豫 6 省市',
                'indicator_count': len(INDICATORS),
                'data_cycle': f"历史监测 {_d(history.get('min_date'))} 至 {_d(history.get('max_date'))} / 模型预测 {_d(prediction.get('min_date'))} 至 {_d(prediction.get('max_date'))}",
            },
            'summary': {
                'scope_label': scope_label, 'composite_score': latest_score, 'quality_level': LEVEL_META[latest_level]['name'],
                'quality_color': LEVEL_META[latest_level]['color'], 'station_count': scope_station_count,
                'latest_sample_count': int(latest.get('sample_count') or 0), 'abnormal_events_30d': int(sum(item['exceed_count'] for item in pollutant_ranking)),
            },
            'map': {'provinces': province_snapshots, 'stations': station_points},
            'indicators': indicator_cards,
            'rankings': {'province_ranking': province_ranking, 'pollutant_ranking': pollutant_ranking[:6]},
            'model_accuracy': {
                'indicator_count': metric_indicator_count, 'summary': model_summary,
                'best_mae_model': best_mae['model_name'] if best_mae else None, 'best_mse_model': best_mse['model_name'] if best_mse else None,
                'note': '误差值来自 model_evaluation_metrics，因跨指标量纲差异较大，前端采用对数坐标展示。',
            },
            'trend': {
                'dates': [row['month'] for row in monthly_rows], 'scores': [row['score'] for row in monthly_rows],
                'anomaly_points': [{'date': row['month'], 'value': row['score'], 'label': f"{row['month']} · {row['dominant_pollutant']}"} for row in sorted(anomalies, key=lambda x: x['month'])],
                'average_score': round(mean_score, 1) if trend_scores else None, 'series_name': f"{scope_label}综合水质指数",
                'method': '按溶解氧、氨氮、总磷、高锰酸钾指数折算',
            },
            'notes': {
                'threshold_basis': 'pH、溶解氧、氨氮、总氮、总磷、高锰酸钾指数采用 GB 3838-2002 Ⅲ类限值；水温、电导率、浊度、叶绿素、藻密度采用数据库历史P90参考阈值。',
                'selection_tip': '点击左侧地图或省份按钮，可联动切换中部指标、右侧排行与底部趋势。',
            }
        }
    finally:
        conn.close()
