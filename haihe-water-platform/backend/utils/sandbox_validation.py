import math
import os
from collections import defaultdict
from functools import lru_cache

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

try:
    from xgboost import XGBRegressor
    HAS_XGBOOST = True
except ImportError:
    XGBRegressor = None
    HAS_XGBOOST = False

from models.water_quality import WaterQuality


SIX_PROVINCES = ['北京市', '天津市', '河北省', '山西省', '山东省', '河南省']
PROVINCE_FILE_PREFIX = {
    '北京市': '北京',
    '天津市': '天津',
    '河北省': '河北',
    '山西省': '山西',
    '山东省': '山东',
    '河南省': '河南',
}

DATA_ROOT = os.getenv('SANDBOX_DATA_ROOT', r'D:\haihe\shuju预测\批量处理结果')
GRID_IMAGE_DIR = os.path.join(DATA_ROOT, 'lstm预测结果图集_分指标汇总')
ARIMA_EXPORT_DIR = os.path.join(DATA_ROOT, 'arima预测数据表格')
LSTM_EXPORT_DIR = os.path.join(DATA_ROOT, 'lstm预测数据表格_补全后')
PROVINCE_SOURCE_CSV = {
    '北京市': os.path.join(DATA_ROOT, '海河流域_北京市_水质时间节点均值表_处理完成_6H.csv'),
    '天津市': os.path.join(DATA_ROOT, '海河流域_天津市_水质时间节点均值表_处理完成_6H.csv'),
    '河北省': os.path.join(DATA_ROOT, '海河流域_河北省_水质时间节点均值表_处理完成_6H.csv'),
    '山西省': os.path.join(DATA_ROOT, '海河流域_山西省_水质时间节点均值表_处理完成_6H.csv'),
    '山东省': os.path.join(DATA_ROOT, '海河流域_山东省_水质时间节点均值表_处理完成_6H.csv'),
    '河南省': os.path.join(DATA_ROOT, '海河流域_河南省_水质时间节点均值表_处理完成_6H.csv'),
}

INDICATORS = [
    {'field': 'water_temp', 'label': '水温', 'unit': '℃', 'metric_label': '水温', 'file_label': '水温', 'arima_column': '水温', 'lstm_column': '水温_预测'},
    {'field': 'ph', 'label': 'pH', 'unit': '', 'metric_label': 'PH', 'file_label': 'pH', 'arima_column': 'PH', 'lstm_column': 'PH_预测'},
    {'field': 'dissolved_oxygen', 'label': '溶解氧', 'unit': 'mg/L', 'metric_label': '溶解氧', 'file_label': '溶解氧', 'arima_column': '溶解氧', 'lstm_column': '溶解氧_预测'},
    {'field': 'conductivity', 'label': '电导率', 'unit': 'μS/cm', 'metric_label': '电导率', 'file_label': '电导率', 'arima_column': '电导率', 'lstm_column': '电导率_预测'},
    {'field': 'turbidity', 'label': '浊度', 'unit': 'NTU', 'metric_label': '浊度', 'file_label': '浊度', 'arima_column': '浊度', 'lstm_column': '浊度_预测'},
    {'field': 'permanganate_index', 'label': '高锰酸钾指数', 'unit': 'mg/L', 'metric_label': '高锰酸钾指数', 'file_label': '高锰酸钾指数', 'arima_column': '高锰酸钾指数', 'lstm_column': '高锰酸钾指数_预测'},
    {'field': 'ammonia_nitrogen', 'label': '氨氮', 'unit': 'mg/L', 'metric_label': '氨氮', 'file_label': '氨氮', 'arima_column': '氨氮', 'lstm_column': '氨氮_预测'},
    {'field': 'total_phosphorus', 'label': '总磷', 'unit': 'mg/L', 'metric_label': '总磷', 'file_label': '总磷', 'arima_column': '总磷', 'lstm_column': '总磷_预测'},
    {'field': 'total_nitrogen', 'label': '总氮', 'unit': 'mg/L', 'metric_label': '总氮', 'file_label': '总氮', 'arima_column': '总氮', 'lstm_column': '总氮_预测'},
    {'field': 'chlorophyll', 'label': '叶绿素', 'unit': 'μg/L', 'metric_label': '叶绿素', 'file_label': '叶绿素', 'arima_column': None, 'lstm_column': None},
    {'field': 'algae_density', 'label': '藻密度', 'unit': 'cells/mL', 'metric_label': '藻密度', 'file_label': '藻密度', 'arima_column': None, 'lstm_column': None},
]
INDICATOR_BY_FIELD = {item['field']: item for item in INDICATORS}
INDICATOR_BY_LABEL = {item['label']: item for item in INDICATORS}
INDICATOR_BY_METRIC = {item['metric_label']: item for item in INDICATORS}

TIME_MODES = [
    {'value': 'history', 'label': '历史回溯验证'},
    {'value': 'forecast', 'label': '3个月预测'},
]

MODEL_MODES = [
    {'value': 'ARIMA', 'label': 'ARIMA 模型'},
    {'value': 'LSTM', 'label': 'LSTM 模型'},
    {'value': 'COMPARE', 'label': '双模型对比'},
]


def _get_db():
    return WaterQuality.get_db()


@lru_cache(maxsize=16)
def _table_columns(table_name):
    conn = _get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT COLUMN_NAME
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = %s
            """, (table_name,))
            return {row['COLUMN_NAME'] for row in cursor.fetchall()}
    finally:
        conn.close()


def _table_has_column(table_name, column_name):
    return column_name in _table_columns(table_name)


def _normalize_provinces(raw_value):
    if not raw_value or raw_value == 'all':
        return list(SIX_PROVINCES)
    if isinstance(raw_value, str):
        values = [item.strip() for item in raw_value.split(',') if item.strip()]
    else:
        values = [item for item in raw_value if item]
    selected = [item for item in values if item in SIX_PROVINCES]
    return selected or list(SIX_PROVINCES)


def _normalize_indicator(raw_value):
    if raw_value in INDICATOR_BY_FIELD:
        return INDICATOR_BY_FIELD[raw_value]
    if raw_value in INDICATOR_BY_LABEL:
        return INDICATOR_BY_LABEL[raw_value]
    return INDICATOR_BY_FIELD['ammonia_nitrogen']


def _normalize_model_mode(raw_value):
    if raw_value in ('ARIMA', 'LSTM', 'COMPARE'):
        return raw_value
    return 'COMPARE'


def _normalize_time_mode(raw_value):
    if raw_value in ('history', 'forecast'):
        return raw_value
    return 'history'


def _scope_label(provinces):
    if len(provinces) == len(SIX_PROVINCES):
        return '全流域聚合'
    if len(provinces) == 1:
        return provinces[0]
    return '、'.join(provinces)


def _in_clause(column, values):
    return f"{column} IN ({','.join(['%s'] * len(values))})", list(values)


def _to_date(value):
    return str(value) if value is not None else None


def _to_number(value, digits=4):
    if value is None:
        return None
    return round(float(value), digits)


def _series_digits(field):
    if field in ('ammonia_nitrogen', 'total_phosphorus'):
        return 3
    if field in ('algae_density',):
        return 0
    if field in ('conductivity',):
        return 1
    return 2


def _query_daily_series(cursor, provinces, field, table, date_col, group_model=False):
    if not _table_has_column(table, field):
        return []
    clause, params = _in_clause('region_name' if table == 'fact_water_quality_predict' else 'region_name', provinces)
    select_model = 'model_type,' if group_model else ''
    group_model_sql = 'model_type,' if group_model else ''
    cursor.execute(f"""
        SELECT {select_model} DATE({date_col}) AS date, AVG({field}) AS value
        FROM {table}
        WHERE {clause}
          AND {field} IS NOT NULL
        GROUP BY {group_model_sql} DATE({date_col})
        ORDER BY date
    """, params)
    return cursor.fetchall()


def _safe_pct_diff(predicted, actual):
    if predicted is None or actual is None or abs(actual) < 1e-9:
        return None
    return round((float(predicted) - float(actual)) / abs(float(actual)) * 100, 2)


def _build_lookup(rows, value_key='value', model_key=None):
    if model_key:
        lookup = defaultdict(dict)
        for row in rows:
            lookup[row[model_key]][str(row['date'])] = float(row[value_key]) if row[value_key] is not None else None
        return lookup
    return {str(row['date']): float(row[value_key]) if row[value_key] is not None else None for row in rows}


def _filter_dates(all_dates, days):
    if len(all_dates) <= days:
        return all_dates
    return all_dates[-days:]


def _window_dates(history_lookup, prediction_lookup, time_mode, days):
    history_dates = sorted(history_lookup.keys())
    pred_dates = sorted(set(prediction_lookup.get('ARIMA', {}).keys()) | set(prediction_lookup.get('LSTM', {}).keys()))

    if time_mode == 'forecast':
        return _filter_dates(pred_dates, days)

    overlap = sorted(set(history_dates) & set(pred_dates))
    return _filter_dates(overlap, days)


def _line_panel(cursor, provinces, indicator, time_mode, days, model_mode):
    history_rows = _query_daily_series(cursor, provinces, indicator['field'], 'fact_water_quality_history', 'monitor_time')
    prediction_rows = _query_daily_series(cursor, provinces, indicator['field'], 'fact_water_quality_predict', 'predict_time', group_model=True)

    history_lookup = _build_lookup(history_rows)
    prediction_lookup = _build_lookup(prediction_rows, model_key='model_type')
    dates = _window_dates(history_lookup, prediction_lookup, time_mode, days)

    actual = [history_lookup.get(date) for date in dates]
    arima = [prediction_lookup.get('ARIMA', {}).get(date) for date in dates]
    lstm = [prediction_lookup.get('LSTM', {}).get(date) for date in dates]

    note = '历史验证窗口采用真实监测与同期预测重叠日期。'
    if time_mode == 'forecast':
        note = '预测窗口以模型输出为主；若真实监测同日存在，则同步叠加显示。'

    return {
        'title': '真实监测值 VS 模型预测值',
        'subtitle': f"范围：{_scope_label(provinces)} ｜ 指标：{indicator['label']} ｜ 维度：{dict((item['value'], item['label']) for item in TIME_MODES)[time_mode]}",
        'unit': indicator['unit'],
        'dates': dates,
        'actual': [round(value, _series_digits(indicator['field'])) if value is not None else None for value in actual],
        'arima': [round(value, _series_digits(indicator['field'])) if value is not None else None for value in arima],
        'lstm': [round(value, _series_digits(indicator['field'])) if value is not None else None for value in lstm],
        'model_mode': model_mode,
        'note': note,
    }


def _spatial_panel(cursor, indicator):
    predict_has_field = _table_has_column('fact_water_quality_predict', indicator['field'])
    history_has_field = _table_has_column('fact_water_quality_history', indicator['field'])

    cursor.execute("SELECT MAX(DATE(predict_time)) AS max_date FROM fact_water_quality_predict")
    predict_max_date = cursor.fetchone()['max_date']
    cursor.execute("SELECT MAX(DATE(monitor_time)) AS max_date FROM fact_water_quality_history")
    history_max_date = cursor.fetchone()['max_date']

    latest_date = predict_max_date or history_max_date
    if not predict_has_field and history_max_date is not None:
        latest_date = history_max_date
    if not history_has_field and predict_max_date is not None:
        latest_date = predict_max_date

    clause, params = _in_clause('region_name', SIX_PROVINCES)
    prediction_rows = []
    history_rows = []

    if predict_has_field and latest_date is not None:
        cursor.execute(f"""
            SELECT model_type, region_name, AVG({indicator['field']}) AS value
            FROM fact_water_quality_predict
            WHERE {clause}
              AND DATE(predict_time) = %s
              AND {indicator['field']} IS NOT NULL
            GROUP BY model_type, region_name
        """, params + [latest_date])
        prediction_rows = cursor.fetchall()

    if history_has_field and latest_date is not None:
        cursor.execute(f"""
            SELECT region_name, AVG({indicator['field']}) AS value
            FROM fact_water_quality_history
            WHERE {clause}
              AND DATE(monitor_time) = %s
              AND {indicator['field']} IS NOT NULL
            GROUP BY region_name
        """, params + [latest_date])
        history_rows = cursor.fetchall()

    history_map = {row['region_name']: _to_number(row['value'], _series_digits(indicator['field'])) for row in history_rows}
    model_map = defaultdict(dict)
    for row in prediction_rows:
        model_map[row['model_type']][row['region_name']] = _to_number(row['value'], _series_digits(indicator['field']))

    comparison = []
    heatmap = []
    bar_series = {
        '真实监测': [],
        'ARIMA 预测': [],
        'LSTM 预测': [],
    }
    value_pool = []

    for province in SIX_PROVINCES:
        actual = history_map.get(province)
        arima = model_map.get('ARIMA', {}).get(province)
        lstm = model_map.get('LSTM', {}).get(province)
        arima_diff = _safe_pct_diff(arima, actual)
        lstm_diff = _safe_pct_diff(lstm, actual)
        best_model = '--'
        if arima_diff is not None or lstm_diff is not None:
            pairs = []
            if arima_diff is not None:
                pairs.append(('ARIMA', abs(arima_diff)))
            if lstm_diff is not None:
                pairs.append(('LSTM', abs(lstm_diff)))
            if pairs:
                best_model = min(pairs, key=lambda item: item[1])[0]

        comparison.append({
            'province': province,
            'actual': actual,
            'arima': arima,
            'lstm': lstm,
            'arima_diff_pct': arima_diff,
            'lstm_diff_pct': lstm_diff,
            'best_model': best_model,
        })

        province_values = [actual, arima, lstm]
        for idx, value in enumerate(province_values):
            if value is not None:
                heatmap.append([SIX_PROVINCES.index(province), idx, value])
                value_pool.append(value)
        bar_series['真实监测'].append(actual)
        bar_series['ARIMA 预测'].append(arima)
        bar_series['LSTM 预测'].append(lstm)

    return {
        'title': '六省市横向对比矩阵',
        'subtitle': '按 LSTM预测.py / LSTM补充图.py 的六省市横向对比口径，改为 ECharts 数值矩阵图。',
        'latest_date': _to_date(latest_date),
        'unit': indicator['unit'],
        'provinces': SIX_PROVINCES,
        'models': ['真实监测', 'ARIMA 预测', 'LSTM 预测'],
        'heatmap': heatmap,
        'bar_series': [{'name': name, 'data': values} for name, values in bar_series.items()],
        'min_value': min(value_pool) if value_pool else None,
        'max_value': max(value_pool) if value_pool else None,
        'source_note': '全部数值来自 MySQL：真实值取历史表最新同日均值，ARIMA/LSTM 取预测表最新同日均值。',
        'comparison': comparison,
    }


def _prediction_cv(cursor, province, model_type, field, time_mode, days):
    if not _table_has_column('fact_water_quality_predict', field):
        return None
    cursor.execute(f"""
        SELECT DATE(predict_time) AS date, AVG({field}) AS value
        FROM fact_water_quality_predict
        WHERE region_name = %s
          AND model_type = %s
          AND {field} IS NOT NULL
        GROUP BY DATE(predict_time)
        ORDER BY date
    """, (province, model_type))
    rows = cursor.fetchall()
    values = [float(row['value']) for row in rows]
    if not values:
        return None
    if len(values) > days:
        values = values[-days:]
    mean_value = sum(values) / len(values)
    if abs(mean_value) < 1e-9:
        return 0.0
    variance = sum((value - mean_value) ** 2 for value in values) / len(values)
    return round((variance ** 0.5) / abs(mean_value) * 100, 2)


def _radar_panel(cursor, radar_province, days):
    arima_values = []
    lstm_values = []
    labels = []

    for indicator in INDICATORS:
        labels.append(indicator['label'])
        arima_values.append(_prediction_cv(cursor, radar_province, 'ARIMA', indicator['field'], 'forecast', days))
        lstm_values.append(_prediction_cv(cursor, radar_province, 'LSTM', indicator['field'], 'forecast', days))

    valid_values = [value for value in arima_values + lstm_values if value is not None]
    max_value = max(valid_values) if valid_values else 10
    radar_max = max(10, math.ceil(max_value / 5) * 5)

    return {
        'title': f'{radar_province}多指标预测波动雷达',
        'subtitle': '口径：3个月预测日均值的变异系数 CV%',
        'province': radar_province,
        'indicators': labels,
        'arima': arima_values,
        'lstm': lstm_values,
        'max_value': radar_max,
    }


def _metric_summary(cursor, provinces, indicator):
    clause, params = _in_clause('region_name', provinces)
    cursor.execute(f"""
        SELECT model_name, metric_name, AVG(metric_value) AS avg_value, SUM(sample_count) AS sample_count
        FROM model_evaluation_metrics
        WHERE {clause}
          AND indicator_name = %s
        GROUP BY model_name, metric_name
    """, params + [indicator['metric_label']])
    rows = cursor.fetchall()

    metric_map = defaultdict(dict)
    samples = defaultdict(int)
    for row in rows:
        metric_map[row['model_name']][row['metric_name']] = float(row['avg_value']) if row['avg_value'] is not None else None
        samples[row['model_name']] = int(row['sample_count'] or 0)

    cards = []
    for model_name in ['ARIMA', 'LSTM']:
        mse = metric_map.get(model_name, {}).get('MSE')
        cards.append({
            'model_name': model_name,
            'mae': _to_number(metric_map.get(model_name, {}).get('MAE')),
            'mse': _to_number(mse),
            'rmse': round(math.sqrt(mse), 4) if mse is not None else None,
            'sample_count': samples.get(model_name, 0),
        })
    return cards


def _scatter_panel(cursor, provinces, indicator, days):
    line = _line_panel(cursor, provinces, indicator, 'history', days, 'COMPARE')
    arima_points = []
    lstm_points = []

    for idx, date in enumerate(line['dates']):
        actual = line['actual'][idx]
        if actual is None:
            continue
        if line['arima'][idx] is not None:
            arima_points.append({'date': date, 'x': actual, 'y': round(line['arima'][idx] - actual, 4)})
        if line['lstm'][idx] is not None:
            lstm_points.append({'date': date, 'x': actual, 'y': round(line['lstm'][idx] - actual, 4)})

    return {
        'title': '预测误差散点图',
        'subtitle': '横轴为真实监测值，纵轴为预测残差（预测值 - 真实值）',
        'unit': indicator['unit'],
        'arima': arima_points,
        'lstm': lstm_points,
    }


def _read_source_csv(province):
    path = PROVINCE_SOURCE_CSV.get(province, PROVINCE_SOURCE_CSV['河北省'])
    if not os.path.isfile(path):
        raise FileNotFoundError(path)
    try:
        df = pd.read_csv(path, encoding='utf-8-sig')
    except UnicodeDecodeError:
        df = pd.read_csv(path)
    # 兼容旧脚本列名
    df = df.rename(columns={
        '高锰酸盐指数': '高锰酸钾指数',
        'pH': 'PH',
    })
    return df, path


@lru_cache(maxsize=128)
def _feature_panel(radar_province, target_field):
    indicator = _normalize_indicator(target_field)
    target_column = indicator['metric_label']

    try:
        df, path = _read_source_csv(radar_province)
    except FileNotFoundError:
        return {
            'title': '特征重要性双模型对比',
            'subtitle': '未找到对应省份的 6 小时均值 CSV 文件。',
            'province': radar_province,
            'target_column': target_column,
            'available': False,
            'table': [],
        }

    feature_columns = [item['metric_label'] for item in INDICATORS if item['metric_label'] in df.columns]
    if target_column not in feature_columns:
        return {
            'title': '特征重要性双模型对比',
            'subtitle': f'源文件中缺少目标列 {target_column}。',
            'province': radar_province,
            'target_column': target_column,
            'available': False,
            'table': [],
        }

    predictors = [column for column in feature_columns if column != target_column]
    if len(predictors) < 2:
        return {
            'title': '特征重要性双模型对比',
            'subtitle': '有效特征列不足，无法完成权重计算。',
            'province': radar_province,
            'target_column': target_column,
            'available': False,
            'table': [],
        }

    data = df[predictors + [target_column]].apply(pd.to_numeric, errors='coerce')
    data = data.replace([np.inf, -np.inf], np.nan).dropna()
    if len(data) < 36:
        return {
            'title': '特征重要性双模型对比',
            'subtitle': '清洗后样本量不足，暂不展示特征重要性。',
            'province': radar_province,
            'target_column': target_column,
            'available': False,
            'table': [],
        }

    X = data[predictors]
    y = data[target_column]

    rf = RandomForestRegressor(n_estimators=240, random_state=42)
    rf.fit(X, y)
    rf_importances = rf.feature_importances_

    xgb_importances = None
    if HAS_XGBOOST:
        xgb = XGBRegressor(
            n_estimators=240,
            max_depth=4,
            learning_rate=0.05,
            subsample=0.9,
            colsample_bytree=0.9,
            random_state=42,
            verbosity=0,
            objective='reg:squarederror',
        )
        xgb.fit(X, y)
        xgb_importances = xgb.feature_importances_

    average_importance = rf_importances.copy()
    if xgb_importances is not None:
        average_importance = (rf_importances + xgb_importances) / 2.0

    sorted_indices = np.argsort(average_importance)[::-1]
    features = []
    rf_values = []
    xgb_values = []
    table = []

    for index in sorted_indices:
        feature_name = predictors[index]
        rf_value = round(float(rf_importances[index]) * 100, 2)
        xgb_value = round(float(xgb_importances[index]) * 100, 2) if xgb_importances is not None else None
        average_value = round(float(average_importance[index]) * 100, 2)

        features.append(feature_name)
        rf_values.append(rf_value)
        xgb_values.append(xgb_value)
        table.append({
            'feature': feature_name,
            'rf': rf_value,
            'xgb': xgb_value,
            'avg': average_value,
        })

    return {
        'title': '特征重要性双模型对比',
        'subtitle': f"基于 {os.path.basename(path)}，按 随机森林.py / XGBoost 对比分析.py 思路实时重算。",
        'province': radar_province,
        'indicator_label': indicator['label'],
        'target_column': target_column,
        'available': True,
        'sample_count': int(len(data)),
        'data_source': os.path.basename(path),
        'xgb_available': xgb_importances is not None,
        'features': features,
        'rf': rf_values,
        'xgb': xgb_values,
        'table': table[:6],
        'top_feature': table[0]['feature'] if table else None,
        'note': '单位：重要性占比 %。当前展示为实时数值图，不再直接贴 PNG。',
    }


def get_grid_image_path(indicator_label):
    indicator = _normalize_indicator(indicator_label)
    return os.path.join(GRID_IMAGE_DIR, f"对比_{indicator['file_label']}_六省市网格图.png")


def get_feature_importance_path(province):
    safe_province = province if province in SIX_PROVINCES else '河北省'
    return os.path.join(DATA_ROOT, f"{safe_province}_特征重要性.png")


def get_export_file_path(province, model_type):
    province = province if province in SIX_PROVINCES else '河北省'
    prefix = PROVINCE_FILE_PREFIX[province]
    if model_type == 'LSTM':
        return os.path.join(LSTM_EXPORT_DIR, f"{prefix}_全指标预测数据.xlsx")
    return os.path.join(ARIMA_EXPORT_DIR, f"{prefix}_预测数据_带波动.xlsx")


def get_export_preview(province='河北省', model_type='ARIMA', limit=12):
    path = get_export_file_path(province, model_type)
    if not os.path.isfile(path):
        return {
            'province': province,
            'model_type': model_type,
            'available': False,
            'message': '未找到对应导出文件',
        }

    df = pd.read_excel(path)
    df = df.head(limit).copy()
    for column in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[column]):
            df[column] = df[column].dt.strftime('%Y-%m-%d %H:%M:%S')
        else:
            df[column] = df[column].where(pd.notna(df[column]), None)

    return {
        'province': province,
        'model_type': model_type,
        'available': True,
        'file_name': os.path.basename(path),
        'columns': [str(column) for column in df.columns],
        'rows': df.to_dict(orient='records'),
        'total_rows': int(pd.read_excel(path, usecols=[0]).shape[0]),
        'download_url': f"/api/dashboard/validation-export-file?province={province}&model_type={model_type}",
    }


def get_validation_overview(raw_provinces='all', raw_indicator='ammonia_nitrogen', raw_time_mode='history', raw_model_mode='COMPARE', radar_province=None, days=90):
    provinces = _normalize_provinces(raw_provinces)
    indicator = _normalize_indicator(raw_indicator)
    time_mode = _normalize_time_mode(raw_time_mode)
    model_mode = _normalize_model_mode(raw_model_mode)
    radar_province = radar_province if radar_province in provinces else provinces[0]

    conn = _get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT MIN(DATE(monitor_time)) AS min_date, MAX(DATE(monitor_time)) AS max_date FROM fact_water_quality_history")
            history_range = cursor.fetchone()
            cursor.execute("SELECT MIN(DATE(predict_time)) AS min_date, MAX(DATE(predict_time)) AS max_date FROM fact_water_quality_predict")
            predict_range = cursor.fetchone()

            time_panel = _line_panel(cursor, provinces, indicator, time_mode, days, model_mode)
            spatial_panel = _spatial_panel(cursor, indicator)
            radar_panel = _radar_panel(cursor, radar_province, days)
            accuracy_cards = _metric_summary(cursor, provinces, indicator)
            scatter_panel = _scatter_panel(cursor, provinces, indicator, days)
            feature_panel = _feature_panel(radar_province, indicator['field'])
    finally:
        conn.close()

    export_preview = get_export_preview(radar_province, 'ARIMA' if model_mode == 'ARIMA' else 'LSTM' if model_mode == 'LSTM' else 'ARIMA')

    return {
        'controls': {
            'provinces': SIX_PROVINCES,
            'indicators': [{'field': item['field'], 'label': item['label'], 'unit': item['unit']} for item in INDICATORS],
            'time_modes': TIME_MODES,
            'model_modes': MODEL_MODES,
            'history_range': {'start': _to_date(history_range['min_date']), 'end': _to_date(history_range['max_date'])},
            'prediction_range': {'start': _to_date(predict_range['min_date']), 'end': _to_date(predict_range['max_date'])},
        },
        'selection': {
            'provinces': provinces,
            'scope_label': _scope_label(provinces),
            'indicator': {'field': indicator['field'], 'label': indicator['label'], 'unit': indicator['unit']},
            'time_mode': time_mode,
            'model_mode': model_mode,
            'radar_province': radar_province,
            'days': days,
        },
        'headline': {
            'title': '微观预测・多维对比验证',
            'subtitle': '时间序列预测、六省市横向网格图、误差检验和特征重要性均来自本地真实成果与 MySQL 数据。',
        },
        'time_panel': time_panel,
        'spatial_panel': spatial_panel,
        'radar_panel': radar_panel,
        'accuracy_panel': {
            'title': '模型精度校验',
            'indicator_label': indicator['label'],
            'cards': accuracy_cards,
            'scatter': scatter_panel,
            'feature_importance': feature_panel,
        },
        'export_panel': {
            'title': '预测数据导出区',
            'subtitle': '展示分省市预测 Excel 预览，支持一键导出原始文件。',
            'available_models': ['ARIMA', 'LSTM'],
            'preview': export_preview,
        }
    }
