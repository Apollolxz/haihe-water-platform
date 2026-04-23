# -*- coding: utf-8 -*-
"""
流域时空推演沙盘数据工具（数据库版）
从 haihe_river_basin.fact_water_quality_predict 读取预测数据，进行风险预警计算
"""

import os
import pandas as pd
import numpy as np
from datetime import datetime
import pymysql
from dotenv import load_dotenv

load_dotenv(override=True)

# GB 3838-2002 地表水环境质量标准（部分关键指标）
STANDARDS = {
    'dissolved_oxygen': {
        'thresholds': [7.5, 6.0, 5.0, 3.0, 2.0],
        'direction': 'high',
    },
    'permanganate_index': {
        'thresholds': [2, 4, 6, 10, 15],
        'direction': 'low',
    },
    'ammonia_nitrogen': {
        'thresholds': [0.15, 0.5, 1.0, 1.5, 2.0],
        'direction': 'low',
    },
    'total_phosphorus': {
        'thresholds': [0.02, 0.1, 0.2, 0.3, 0.4],
        'direction': 'low',
    },
}

LEVEL_NAMES = ['I类', 'II类', 'III类', 'IV类', 'V类', '劣V类']
RISK_LEVELS = ['安全', '低风险', '中风险', '高风险', '极高风险']
RISK_COLORS = ['#22c55e', '#84cc16', '#f59e0b', '#ef4444', '#7f1d1d']


def _get_db_conn():
    """获取数据库连接"""
    return pymysql.connect(
        host=os.getenv('MYSQL_HOST', 'localhost'),
        port=int(os.getenv('MYSQL_PORT', '3306')),
        user=os.getenv('MYSQL_USER', 'root'),
        password=os.getenv('MYSQL_PASSWORD', ''),
        database='haihe_river_basin',
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )


def _classify_level(value, indicator):
    """根据指标值判定水质等级 (0-5, 0=I类, 5=劣V类)"""
    if pd.isna(value):
        return 5
    cfg = STANDARDS.get(indicator)
    if not cfg:
        return 2
    thresholds = cfg['thresholds']
    direction = cfg['direction']
    for i, th in enumerate(thresholds):
        if direction == 'high':
            if value >= th:
                return i
        else:
            if value <= th:
                return i
    return len(thresholds)


def _compute_risk(row):
    """计算单条记录的风险等级、风险指数、超标指标"""
    max_level = 0
    risk_score = 0
    exceeded = []
    suggestions = []

    do = row.get('dissolved_oxygen')
    if pd.notna(do):
        do_level = _classify_level(do, 'dissolved_oxygen')
        max_level = max(max_level, do_level)
        if do_level >= 3:
            exceeded.append(f"溶解氧({do:.2f})")
            risk_score += (5 - do) * 5 if do < 5 else 0
            if do < 3:
                suggestions.append("溶解氧严重不足，建议紧急增氧、控制上游排污")
            elif do < 5:
                suggestions.append("溶解氧偏低，建议增加水体曝气，排查有机污染源")

    nh3 = row.get('ammonia_nitrogen')
    if pd.notna(nh3):
        nh3_level = _classify_level(nh3, 'ammonia_nitrogen')
        max_level = max(max_level, nh3_level)
        if nh3_level >= 3:
            exceeded.append(f"氨氮({nh3:.3f})")
            risk_score += nh3 * 15
            if nh3 >= 2.0:
                suggestions.append("氨氮严重超标，建议启动农业面源污染管控，加强污水处理厂监管")
            elif nh3 >= 1.0:
                suggestions.append("氨氮超标，建议减少化肥施用，排查生活污水排放")

    tp = row.get('total_phosphorus')
    if pd.notna(tp):
        tp_level = _classify_level(tp, 'total_phosphorus')
        max_level = max(max_level, tp_level)
        if tp_level >= 3:
            exceeded.append(f"总磷({tp:.3f})")
            risk_score += tp * 30
            if tp >= 0.4:
                suggestions.append("总磷严重超标，建议限制含磷洗涤剂使用，排查工业磷排放")
            elif tp >= 0.2:
                suggestions.append("总磷偏高，建议控制农业面源磷流失")

    codmn = row.get('permanganate_index')
    if pd.notna(codmn):
        codmn_level = _classify_level(codmn, 'permanganate_index')
        max_level = max(max_level, codmn_level)
        if codmn_level >= 3:
            exceeded.append(f"高锰酸盐指数({codmn:.2f})")
            risk_score += codmn * 3
            if codmn >= 10:
                suggestions.append("有机物污染严重，建议排查工业废水及城镇污水直排")
            elif codmn >= 6:
                suggestions.append("有机污染指标偏高，建议加强污染源监控")

    risk_index = min(100, risk_score)

    if max_level <= 2:
        risk_level = 0
    elif max_level == 3:
        risk_level = 2
    elif max_level == 4:
        risk_level = 3
    elif max_level >= 5:
        risk_level = 4
    else:
        risk_level = 1

    if risk_index > 60 and risk_level < 3:
        risk_level = 3
    elif risk_index > 40 and risk_level < 2:
        risk_level = 2

    return {
        'max_level': max_level,
        'level_name': LEVEL_NAMES[max_level],
        'risk_level': risk_level,
        'risk_name': RISK_LEVELS[risk_level],
        'risk_color': RISK_COLORS[risk_level],
        'risk_index': round(risk_index, 2),
        'exceeded_indicators': exceeded,
        'suggestions': list(set(suggestions)),
    }


def load_all_prediction_data(model_type='ARIMA'):
    """从数据库加载预测数据，返回结构化字典"""
    conn = _get_db_conn()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    region_name, predict_time, model_type,
                    water_temp, ph, dissolved_oxygen, permanganate_index,
                    conductivity, turbidity, ammonia_nitrogen,
                    total_phosphorus, total_nitrogen,
                    chlorophyll, algae_density, water_quality_index
                FROM fact_water_quality_predict
                WHERE model_type = %s
                ORDER BY region_name, predict_time
            """, (model_type,))
            rows = cursor.fetchall()
    finally:
        conn.close()

    if not rows:
        return {}

    df = pd.DataFrame(rows)
    df['predict_time'] = pd.to_datetime(df['predict_time'])
    df['datetime'] = df['predict_time']

    # 数值列转 float
    for col in ['water_temp', 'ph', 'dissolved_oxygen', 'conductivity', 'turbidity',
                'permanganate_index', 'ammonia_nitrogen', 'total_phosphorus', 'total_nitrogen',
                'chlorophyll', 'algae_density', 'water_quality_index']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

    # 计算每条记录的风险
    risks = df.apply(lambda row: _compute_risk(row.to_dict()), axis=1)
    df['max_level'] = risks.apply(lambda x: x['max_level'])
    df['level_name'] = risks.apply(lambda x: x['level_name'])
    df['risk_level'] = risks.apply(lambda x: x['risk_level'])
    df['risk_name'] = risks.apply(lambda x: x['risk_name'])
    df['risk_color'] = risks.apply(lambda x: x['risk_color'])
    df['risk_index'] = risks.apply(lambda x: x['risk_index'])
    df['exceeded_indicators'] = risks.apply(lambda x: x['exceeded_indicators'])
    df['suggestions'] = risks.apply(lambda x: x['suggestions'])

    # 按省份分组
    all_data = {}
    for prov in df['region_name'].unique():
        prov_df = df[df['region_name'] == prov].copy()
        if not prov_df.empty:
            all_data[prov] = prov_df

    return all_data


def get_sandbox_summary(model_type='ARIMA'):
    """获取沙盘概览数据，用于前端地图和时序推演"""
    data = load_all_prediction_data(model_type)
    result = {
        'provinces': [],
        'time_series': {},
        'latest': {},
        'stats': {},
    }
    all_dates = set()
    for prov, df in data.items():
        if df.empty:
            continue
        prov_name = prov
        result['provinces'].append(prov_name)
        # 时序数据（按天聚合）
        df['date'] = df['predict_time'].dt.strftime('%Y-%m-%d')
        daily = df.groupby('date').agg({
            'risk_index': 'mean',
            'risk_level': 'max',
            'dissolved_oxygen': 'mean',
            'ammonia_nitrogen': 'mean',
            'total_phosphorus': 'mean',
            'permanganate_index': 'mean',
            'water_temp': 'mean',
            'ph': 'mean',
        }).reset_index()
        daily['risk_name'] = daily['risk_level'].apply(lambda x: RISK_LEVELS[int(x)] if pd.notna(x) else '安全')
        daily['risk_color'] = daily['risk_level'].apply(lambda x: RISK_COLORS[int(x)] if pd.notna(x) else '#22c55e')
        daily = daily.replace({np.nan: None})
        daily_records = daily.to_dict('records')
        result['time_series'][prov_name] = daily_records
        for r in daily_records:
            all_dates.add(r['date'])
        # 最新一天的数据
        latest_date = daily['date'].max()
        latest_row = daily[daily['date'] == latest_date].iloc[0].to_dict()
        latest_df = df[df['date'] == latest_date]
        worst = latest_df.loc[latest_df['risk_index'].idxmax()]
        result['latest'][prov_name] = {
            'date': latest_date,
            'risk_index': round(worst['risk_index'], 2),
            'risk_level': int(worst['risk_level']),
            'risk_name': worst['risk_name'],
            'risk_color': worst['risk_color'],
            'exceeded': worst['exceeded_indicators'],
            'suggestions': worst['suggestions'],
            'avg_do': round(latest_row['dissolved_oxygen'], 2) if pd.notna(latest_row.get('dissolved_oxygen')) else None,
            'avg_nh3': round(latest_row['ammonia_nitrogen'], 3) if pd.notna(latest_row.get('ammonia_nitrogen')) else None,
            'avg_tp': round(latest_row['total_phosphorus'], 3) if pd.notna(latest_row.get('total_phosphorus')) else None,
            'avg_codmn': round(latest_row['permanganate_index'], 2) if pd.notna(latest_row.get('permanganate_index')) else None,
        }
        # 统计
        result['stats'][prov_name] = {
            'total_records': len(df),
            'max_risk_index': round(df['risk_index'].max(), 2),
            'avg_risk_index': round(df['risk_index'].mean(), 2),
            'high_risk_days': int((df['risk_level'] >= 3).sum()),
        }
    result['date_range'] = sorted(list(all_dates))
    result['coordinates'] = {
        '北京市': [116.4074, 39.9042],
        '天津市': [117.2008, 39.0842],
        '河北省': [114.5149, 38.0423],
        '山西省': [112.5489, 37.8706],
        '河南省': [113.6253, 34.7466],
        '山东省': [117.0208, 36.6681],
    }
    # 模型元信息：告知前端当前模型及可用指标
    if model_type == 'LSTM':
        avail = ['ammonia_nitrogen', 'total_phosphorus']
        miss = ['dissolved_oxygen', 'permanganate_index']
        note = 'LSTM模型仅预测了氨氮和总磷指标，溶解氧与高锰酸盐指数缺失'
    else:
        avail = ['dissolved_oxygen', 'ammonia_nitrogen', 'total_phosphorus', 'permanganate_index']
        miss = []
        note = 'ARIMA模型完整预测了全部四项核心指标'
    result['model_info'] = {
        'model_type': model_type,
        'available_indicators': avail,
        'missing_indicators': miss,
        'note': note
    }
    return result


def _build_standard_table(do, nh3, tp, codmn):
    """生成指标与国标对照表（HTML）"""
    rows = []
    if do is not None:
        do_class = 'I-II类' if do >= 6 else ('III类' if do >= 5 else ('IV类' if do >= 3 else ('V类' if do >= 2 else '劣V类')))
        rows.append(f"<tr><td style='padding:6px 10px;border:1px solid #e2e8f0'>溶解氧</td><td style='padding:6px 10px;border:1px solid #e2e8f0'>{do}</td><td style='padding:6px 10px;border:1px solid #e2e8f0'>≥5.0 (III类)</td><td style='padding:6px 10px;border:1px solid #e2e8f0'>{do_class}</td></tr>")
    if nh3 is not None:
        nh3_class = 'I-II类' if nh3 <= 0.5 else ('III类' if nh3 <= 1.0 else ('IV类' if nh3 <= 1.5 else ('V类' if nh3 <= 2.0 else '劣V类')))
        rows.append(f"<tr><td style='padding:6px 10px;border:1px solid #e2e8f0'>氨氮</td><td style='padding:6px 10px;border:1px solid #e2e8f0'>{nh3}</td><td style='padding:6px 10px;border:1px solid #e2e8f0'>≤1.0 (III类)</td><td style='padding:6px 10px;border:1px solid #e2e8f0'>{nh3_class}</td></tr>")
    if tp is not None:
        tp_class = 'I-II类' if tp <= 0.1 else ('III类' if tp <= 0.2 else ('IV类' if tp <= 0.3 else ('V类' if tp <= 0.4 else '劣V类')))
        rows.append(f"<tr><td style='padding:6px 10px;border:1px solid #e2e8f0'>总磷</td><td style='padding:6px 10px;border:1px solid #e2e8f0'>{tp}</td><td style='padding:6px 10px;border:1px solid #e2e8f0'>≤0.2 (III类)</td><td style='padding:6px 10px;border:1px solid #e2e8f0'>{tp_class}</td></tr>")
    if codmn is not None:
        codmn_class = 'I-II类' if codmn <= 4 else ('III类' if codmn <= 6 else ('IV类' if codmn <= 10 else ('V类' if codmn <= 15 else '劣V类')))
        rows.append(f"<tr><td style='padding:6px 10px;border:1px solid #e2e8f0'>高锰酸盐指数</td><td style='padding:6px 10px;border:1px solid #e2e8f0'>{codmn}</td><td style='padding:6px 10px;border:1px solid #e2e8f0'>≤6.0 (III类)</td><td style='padding:6px 10px;border:1px solid #e2e8f0'>{codmn_class}</td></tr>")
    if not rows:
        return ""
    return f"""
    <table style="width:100%;border-collapse:collapse;font-size:13px;margin:10px 0;background:#fff">
        <thead style="background:#f0f9ff">
            <tr>
                <th style="padding:8px 10px;border:1px solid #e2e8f0;text-align:left">指标</th>
                <th style="padding:8px 10px;border:1px solid #e2e8f0;text-align:left">监测/预测值</th>
                <th style="padding:8px 10px;border:1px solid #e2e8f0;text-align:left">GB 3838-2002 III类标准</th>
                <th style="padding:8px 10px;border:1px solid #e2e8f0;text-align:left">水质类别</th>
            </tr>
        </thead>
        <tbody>{''.join(rows)}</tbody>
    </table>
    """


def _generate_professional_advice(prov_name, worst_row, avg_do, avg_nh3, avg_tp, avg_codmn, date_filter):
    """基于水质指标组合，生成高度专业化的治理与应急建议（HTML字符串）"""
    exceeded = worst_row.get('exceeded_indicators', [])
    risk_level = int(worst_row.get('risk_level', 0))
    risk_name = worst_row.get('risk_name', '安全')

    pollution_types = []
    if avg_do is not None and avg_do < 5:
        pollution_types.append('低氧型')
    if avg_codmn is not None and avg_codmn > 6:
        pollution_types.append('有机污染型')
    if avg_nh3 is not None and avg_nh3 > 1.0:
        pollution_types.append('氮污染型')
    if avg_tp is not None and avg_tp > 0.2:
        pollution_types.append('磷限制富营养化型')
    if len(pollution_types) >= 2:
        pollution_types = ['复合型'] + pollution_types
    pollution_type_str = '、'.join(pollution_types) if pollution_types else '清洁型'

    if risk_level >= 4:
        emergency_level = 'I级（红色）—— 极高风险'
        emergency_desc = '应立即启动流域水环境突发事件应急预案，实施最严格的污染源管控与应急增氧措施。'
    elif risk_level == 3:
        emergency_level = 'II级（橙色）—— 高风险'
        emergency_desc = '建议在24小时内发布水环境风险预警，加密监测频次，重点工业源实施限产限排。'
    elif risk_level == 2:
        emergency_level = 'III级（黄色）—— 中风险'
        emergency_desc = '建议加强日常监管与巡查，对重点排污口开展突击检查，防范风险进一步升级。'
    else:
        emergency_level = 'IV级（蓝色）—— 低风险/安全'
        emergency_desc = '维持常规监测与日常管护，关注上游来水与气象变化，做好预防性准备。'

    indicator_advices = []
    if avg_do is not None and avg_do < 5:
        indicator_advices.append("""
            <li><strong>溶解氧不足（{do} mg/L）：</strong>水温升高或有机物降解耗氧是导致溶解氧下降的主因。
            <em>工程措施：</em>① 在重点河段布设移动式曝气船或纳米曝气设备，快速提升水体溶解氧至5 mg/L以上；
            ② 调控闸坝实施生态补水，引入上游清洁水源稀释置换；
            ③ 削减上游有机污染源排放，必要时对城镇污水处理厂实施一级A标准超净排放。</li>
        """.format(do=avg_do))
    if avg_codmn is not None and avg_codmn > 6:
        indicator_advices.append("""
            <li><strong>高锰酸盐指数超标（{codmn} mg/L）：</strong>指示水体受有机污染物负荷较重，可能来自工业废水、城镇生活污水或农业径流。
            <em>工程措施：</em>① 对沿河重点排污口开展24小时在线监控，COD超排企业立即限产；
            ② 加快推进城镇污水处理厂提标改造（由一级A提升至地表水准IV类）；
            ③ 在支流汇入口建设人工湿地或生态沟渠，利用植物-微生物协同降解有机物。</li>
        """.format(codmn=avg_codmn))
    if avg_nh3 is not None and avg_nh3 > 1.0:
        indicator_advices.append("""
            <li><strong>氨氮超标（{nh3} mg/L）：</strong>主要来源于畜禽养殖废水、生活污水及农田氮肥流失，夏季高温时硝化作用受抑制导致氨氮累积。
            <em>工程措施：</em>① 对规模化养殖场实施粪污资源化利用与封闭式收集，杜绝直排；
            ② 在污水处理厂增设后置反硝化滤池，强化生物脱氮；
            ③ 推广测土配方施肥与生态缓冲带建设，减少农田氮素径流。</li>
        """.format(nh3=avg_nh3))
    if avg_tp is not None and avg_tp > 0.2:
        indicator_advices.append("""
            <li><strong>总磷超标（{tp} mg/L）：</strong>提示水体存在富营养化风险，磷是藻类暴发的关键限制因子。
            <em>工程措施：</em>① 实施污水处理厂化学除磷（投加PAC/PACl或生物除磷A²O工艺升级）；
            ② 严格控制含磷洗涤剂使用，全面排查磷化工企业废水排放；
            ③ 在湖库或缓流河段设置生态浮岛与磷吸附基质，降低内源释放风险。</li>
        """.format(tp=avg_tp))

    if not indicator_advices:
        indicator_advices = ["<li>当前各项指标均处于安全范围，建议保持现有治理成效，持续推进入河排污口规范化整治与生态修复工程。</li>"]

    if risk_level >= 3:
        monitor_plan = """
            <li><strong>监测频次：</strong>常规断面由每月1次加密为每日1次；重点风险断面实施每6小时自动在线监测。</li>
            <li><strong>扩展指标：</strong>在溶解氧、氨氮、高锰酸盐指数、总磷基础上，增测叶绿素a、藻密度、pH、水温及挥发性酚类。</li>
            <li><strong>预警发布：</strong>建立省市县三级联动预警信息发布机制，数据实时共享至生态环境大数据平台。</li>
        """
    elif risk_level == 2:
        monitor_plan = """
            <li><strong>监测频次：</strong>常规断面加密至每周2-3次；重点排污口实行每日巡查。</li>
            <li><strong>扩展指标：</strong>关注溶解氧日变化与氨氮波动，必要时加测叶绿素a。</li>
            <li><strong>预警发布：</strong>由市级生态环境部门向相关区县发布风险提示函。</li>
        """
    else:
        monitor_plan = """
            <li><strong>监测频次：</strong>维持常规监测方案（每月1次或每季度1次）。</li>
            <li><strong>扩展指标：</strong>按常规水质评价指标执行。</li>
            <li><strong>预警发布：</strong>无需专门发布预警，纳入日常环境管理。</li>
        """

    date_context = f"（分析日期：{date_filter}）" if date_filter else "（预测期综合评估）"

    return f"""
    <div style="margin-top:14px; padding:16px; background:#ffffff; border-radius:12px; border:1px solid #e2e8f0;">
        <h4 style="color:#0ea5e9; margin:0 0 10px 0; font-size:15px;">一、污染类型判定与水质分级</h4>
        <p style="margin:4px 0; color:#475569; font-size:13px;">
            <strong>{prov_name}</strong>{date_context} 判定为 <strong style="color:#ef4444">{pollution_type_str}</strong> 水污染，
            当前风险等级 <strong>{risk_name}</strong>，应急响应对应 <strong>{emergency_level}</strong>。
            {emergency_desc}
        </p>
        {_build_standard_table(avg_do, avg_nh3, avg_tp, avg_codmn)}

        <h4 style="color:#0ea5e9; margin:14px 0 10px 0; font-size:15px;">二、分指标精准治理与工程技术措施</h4>
        <ul style="margin:0; color:#475569; padding-left:18px; font-size:13px; line-height:1.9;">
            {''.join(indicator_advices)}
        </ul>

        <h4 style="color:#0ea5e9; margin:14px 0 10px 0; font-size:15px;">三、应急响应与监测加密方案</h4>
        <ul style="margin:0; color:#475569; padding-left:18px; font-size:13px; line-height:1.8;">
            {monitor_plan}
        </ul>

        <h4 style="color:#0ea5e9; margin:14px 0 10px 0; font-size:15px;">四、跨区域协同与联防联控建议</h4>
        <p style="margin:4px 0; color:#475569; font-size:13px; line-height:1.8;">
            海河流域为跨省界河流，{prov_name} 位于流域中下游或支流汇水区，其水质状况受上游来水影响显著。
            建议与上游山西、河北等省市建立 <strong>"信息共享、联合监测、协同执法、应急联动"</strong> 四项机制。
            一旦发现跨省界断面水质异常，应在2小时内通报下游省份，并同步启动闸坝联合调度，通过生态补水与截污导流降低下游风险。
            对重点污染企业实施流域统一排污许可管理，推行涉水企业环保信用评价结果跨省互认。
        </p>
    </div>
    """


def generate_risk_report(province_filter=None, date_filter=None, model_type='ARIMA'):
    """生成风险预警报告（HTML 字符串），支持按省份和日期过滤"""
    data = load_all_prediction_data(model_type)
    if not data:
        return "<p>未找到预测数据，无法生成报告。</p>"

    selected = {}
    for prov, df in data.items():
        prov_name = prov
        if province_filter and province_filter not in ['全部', 'all', '']:
            if province_filter != prov_name and not prov_name.startswith(province_filter):
                continue
        selected[prov_name] = df.copy()

    if not selected:
        return f"<p>未找到省份 [{province_filter}] 的预测数据。</p>"

    for prov_name, df in selected.items():
        df['date'] = df['predict_time'].dt.strftime('%Y-%m-%d')

    if date_filter:
        for prov_name, df in selected.items():
            selected[prov_name] = df[df['date'] == date_filter]

    total_records = sum(len(df) for df in selected.values())
    high_risk_count = sum((df['risk_level'] >= 3).sum() for df in selected.values())
    max_risk_province = max(selected.items(), key=lambda x: x[1]['risk_index'].max())[0] if selected else '-'

    province_sections = []
    for prov_name, df in selected.items():
        if df.empty:
            continue
        avg_index = round(df['risk_index'].mean(), 2)
        high_days = int((df['risk_level'] >= 3).sum())
        worst_row = df.loc[df['risk_index'].idxmax()]

        if date_filter:
            avg_do = round(df['dissolved_oxygen'].mean(), 2) if pd.notna(df['dissolved_oxygen'].mean()) else None
            avg_nh3 = round(df['ammonia_nitrogen'].mean(), 3) if pd.notna(df['ammonia_nitrogen'].mean()) else None
            avg_tp = round(df['total_phosphorus'].mean(), 3) if pd.notna(df['total_phosphorus'].mean()) else None
            avg_codmn = round(df['permanganate_index'].mean(), 2) if pd.notna(df['permanganate_index'].mean()) else None
            header_info = f"<p style='margin:4px 0;color:#64748b;font-size:13px'>当日平均风险指数: <strong style='color:#0ea5e9'>{avg_index}</strong> &nbsp;|&nbsp; 最高风险指数: <strong style='color:#ef4444'>{round(worst_row['risk_index'], 2)}</strong></p>"
        else:
            daily = df.groupby('date').agg({'risk_index': 'mean', 'risk_level': 'max'}).reset_index()
            worst_day = daily.loc[daily['risk_index'].idxmax()]['date']
            worst_index = round(daily['risk_index'].max(), 2)
            avg_do = round(df['dissolved_oxygen'].mean(), 2) if pd.notna(df['dissolved_oxygen'].mean()) else None
            avg_nh3 = round(df['ammonia_nitrogen'].mean(), 3) if pd.notna(df['ammonia_nitrogen'].mean()) else None
            avg_tp = round(df['total_phosphorus'].mean(), 3) if pd.notna(df['total_phosphorus'].mean()) else None
            avg_codmn = round(df['permanganate_index'].mean(), 2) if pd.notna(df['permanganate_index'].mean()) else None
            header_info = f"<p style='margin:4px 0;color:#64748b;font-size:13px'>预测期平均风险指数: <strong style='color:#0ea5e9'>{avg_index}</strong> &nbsp;|&nbsp; 最高风险日: <strong style='color:#ef4444'>{worst_day}</strong> (指数 {worst_index}) &nbsp;|&nbsp; 高风险记录数: <strong>{high_days}</strong></p>"

        professional_advice = _generate_professional_advice(prov_name, worst_row, avg_do, avg_nh3, avg_tp, avg_codmn, date_filter)

        province_sections.append(f"""
        <div style="margin: 16px 0; padding: 0; background: #f8fafc; border-radius: 16px; border-left: 5px solid {worst_row['risk_color']};\">
            <div style="padding: 14px 18px; border-bottom: 1px dashed #e2e8f0;">
                <h3 style="color: #1e293b; margin: 0 0 6px 0; font-size: 17px; font-weight: 700;">{prov_name}</h3>
                {header_info}
                <p style="margin: 6px 0 0; color: #475569; font-size: 13px;">主要超标指标: <span style="color:#ef4444; font-weight:600;">{', '.join(worst_row['exceeded_indicators']) if worst_row['exceeded_indicators'] else '无'}</span></p>
            </div>
            {professional_advice}
        </div>
        """)

    date_label = f" &nbsp;|&nbsp; 分析日期: {date_filter}" if date_filter else ""
    html = f"""
    <div style="font-family: 'Microsoft YaHei', sans-serif; background: #ffffff; color: #1e293b; padding: 24px; border-radius: 16px;">
        <h1 style="color: #0ea5e9; margin-bottom: 8px; font-size: 24px;">海河流域水质风险预警与精准治理报告</h1>
        <p style="color: #64748b; margin-bottom: 18px; font-size: 13px;">生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} &nbsp;|&nbsp; 覆盖范围: {province_filter if province_filter else '全部省市'}{date_label} &nbsp;|&nbsp; 数据来源: 水质预测结果（六省市）</p>
        
        <div style="display: flex; gap: 14px; margin-bottom: 22px;">
            <div style="flex: 1; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 16px; border-radius: 12px; text-align: center; border: 1px solid #bae6fd;">
                <div style="font-size: 22px; font-weight: bold; color: #0ea5e9;">{total_records}</div>
                <div style="color: #64748b; font-size: 12px;">预测记录总数</div>
            </div>
            <div style="flex: 1; background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%); padding: 16px; border-radius: 12px; text-align: center; border: 1px solid #fecdd3;">
                <div style="font-size: 22px; font-weight: bold; color: #f43f5e;">{high_risk_count}</div>
                <div style="color: #64748b; font-size: 12px;">高风险记录数</div>
            </div>
            <div style="flex: 1; background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%); padding: 16px; border-radius: 12px; text-align: center; border: 1px solid #fde047;">
                <div style="font-size: 18px; font-weight: bold; color: #eab308;">{max_risk_province}</div>
                <div style="color: #64748b; font-size: 12px;">最高风险区域</div>
            </div>
        </div>
        
        <h2 style="color: #0ea5e9; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; font-size: 18px; margin-bottom: 12px;">分省市风险评估与精准治理方案</h2>
        <p style="color: #64748b; font-size: 13px; margin-bottom: 14px;">本报告基于 GB 3838-2002《地表水环境质量标准》III类限值进行评价，针对超标指标从污染成因、工程技术、应急响应、监测加密、联防联控五个维度提出系统性治理建议。</p>
        {''.join(province_sections)}
        
        <div style="margin-top: 24px; padding: 16px; background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%); border-radius: 12px; border: 1px solid #bae6fd;">
            <strong style="color: #0ea5e9; font-size: 15px;">总体建议与流域统筹:</strong>
            <p style="color: #475569; font-size: 13px; line-height: 1.85; margin: 8px 0 0 0;">
                海河流域六省市水质风险时空分布不均，{max_risk_province} 为当前最高风险区域。
                建议以 <strong>"控源、截污、增氧、补水、联调"</strong> 为总体技术路线，建立跨省界水质目标责任制与生态补偿机制。
                对高风险断面实施 <strong>"一断面一策"</strong> 精细化管理，将城镇污水处理、农业面源控制、工业清洁生产、河道生态修复四大工程措施协同推进，确保流域水质稳定达标。
            </p>
        </div>
    </div>
    """
    return html


def get_model_comparison_metrics():
    """从 model_evaluation_metrics 获取 ARIMA vs LSTM 评估指标对比"""
    conn = _get_db_conn()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT model_name, indicator_name, metric_name, ROUND(AVG(metric_value), 4) as avg_value
                FROM model_evaluation_metrics
                GROUP BY model_name, indicator_name, metric_name
                ORDER BY model_name, indicator_name, metric_name
            """)
            rows = cursor.fetchall()
    finally:
        conn.close()

    # 组织为结构化数据
    comparison = {}
    for row in rows:
        model = row['model_name']
        indicator = row['indicator_name']
        metric = row['metric_name']
        value = row['avg_value']
        if model not in comparison:
            comparison[model] = {}
        if indicator not in comparison[model]:
            comparison[model][indicator] = {}
        comparison[model][indicator][metric] = value

    # 计算综合评分（MAE越低越好，RMSE越低越好）
    summary = {}
    for model, indicators in comparison.items():
        total_mae = 0
        total_mse = 0
        count = 0
        for ind, metrics in indicators.items():
            if 'MAE' in metrics:
                total_mae += metrics['MAE']
            if 'MSE' in metrics:
                total_mse += metrics['MSE']
            count += 1
        summary[model] = {
            'avg_mae': round(total_mae / count, 4) if count else None,
            'avg_mse': round(total_mse / count, 4) if count else None,
            'indicator_count': count
        }

    return {
        'comparison': comparison,
        'summary': summary,
        'indicators': sorted(list(set(
            ind for model_data in comparison.values() for ind in model_data.keys()
        )))
    }


if __name__ == '__main__':
    print("发现数据:", list(load_all_prediction_data().keys()))
    summary = get_sandbox_summary()
    print("省份:", summary['provinces'])
    print("日期范围:", len(summary['date_range']), "天")
    for p, info in summary['latest'].items():
        print(p, info)
    print("\n模型对比:", get_model_comparison_metrics())
