# -*- coding: utf-8 -*-
"""
修复数据导入脚本
修正列名映射错误，重新导入历史数据和预测数据
"""

import os
import pandas as pd
import pymysql
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv('MYSQL_HOST', 'localhost')
DB_PORT = int(os.getenv('MYSQL_PORT', '3306'))
DB_USER = os.getenv('MYSQL_USER', 'root')
DB_PASSWORD = os.getenv('MYSQL_PASSWORD', '')
NEW_DB = 'haihe_river_basin'
DATA_DIR = r'D:\haihe\shuju预测\批量处理结果'

PROVINCE_MAP = {
    '北京': '北京市',
    '天津': '天津市',
    '河北': '河北省',
    '山西': '山西省',
    '山东': '山东省',
    '河南': '河南省',
}

# 修正后的中文指标名到英文字段名映射
INDICATOR_MAP = {
    '水温': 'water_temp',
    'PH': 'ph',
    '溶解氧': 'dissolved_oxygen',
    '电导率': 'conductivity',
    '浊度': 'turbidity',
    '高锰酸钾指数': 'permanganate_index',
    '氨氮': 'ammonia_nitrogen',
    '总磷': 'total_phosphorus',
    '总氮': 'total_nitrogen',
    '叶绿素': 'chlorophyll',
    '藻密度': 'algae_density',
}

# LSTM特殊列名映射
LSTM_COL_MAP = {
    '氨氮_预测': 'ammonia_nitrogen',
    '总磷_预测': 'total_phosphorus',
    '水质综合指数_预测': 'water_quality_index',
    '总氮_预测': 'total_nitrogen',
    '电导_预测': 'conductivity',
    '高锰酸盐_预测': 'permanganate_index',
    '浊度_预测': 'turbidity',
    'PH_预测': 'ph',
    '水温_预测': 'water_temp',
    '叶绿素_预测': 'chlorophyll',
    '藻密度_预测': 'algae_density',
}


def get_connection():
    return pymysql.connect(
        host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASSWORD,
        database=NEW_DB, charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor
    )


def clear_and_reimport_history():
    """清空并重新导入历史数据"""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("TRUNCATE TABLE fact_water_quality_history")
            conn.commit()
            print("[OK] fact_water_quality_history 已清空")
    finally:
        conn.close()

    if not os.path.isdir(DATA_DIR):
        print(f"[ERROR] 数据目录不存在: {DATA_DIR}")
        return

    csv_files = []
    for f in os.listdir(DATA_DIR):
        if f.endswith('.csv') and ('处理后' in f or '水质时间节点' in f):
            csv_files.append(f)

    conn = get_connection()
    total_inserted = 0

    try:
        with conn.cursor() as cursor:
            for csv_file in sorted(csv_files):
                full_path = os.path.join(DATA_DIR, csv_file)
                print(f"[INFO] 正在导入: {csv_file}")

                try:
                    df = pd.read_csv(full_path)
                except Exception as e:
                    print(f"[WARN] 读取失败 {csv_file}: {e}")
                    continue

                if df.empty:
                    continue

                # 确定省份
                province = None
                for prov_key, prov_name in PROVINCE_MAP.items():
                    if prov_key in csv_file:
                        province = prov_name
                        break
                if not province:
                    province = '海河流域'

                # 映射列名
                col_mapping = {}
                for col in df.columns:
                    col_stripped = str(col).strip()
                    if col_stripped in INDICATOR_MAP:
                        col_mapping[col_stripped] = INDICATOR_MAP[col_stripped]

                df = df.rename(columns=col_mapping)

                # 识别时间列
                time_col = None
                for c in df.columns:
                    if str(c).strip().lower() in ['datetime', '时间', '日期']:
                        time_col = c
                        break
                if not time_col and len(df.columns) > 0:
                    time_col = df.columns[0]

                if time_col:
                    df['monitor_time'] = pd.to_datetime(df[time_col], errors='coerce')
                else:
                    continue

                sql = """
                    INSERT INTO fact_water_quality_history
                    (region_name, monitor_time, water_temp, ph, dissolved_oxygen,
                     permanganate_index, conductivity, turbidity, ammonia_nitrogen,
                     total_phosphorus, total_nitrogen, chlorophyll, algae_density,
                     water_quality_index, data_source)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """

                batch = []
                for _, row in df.iterrows():
                    if pd.isna(row['monitor_time']):
                        continue
                    batch.append((
                        province,
                        row['monitor_time'],
                        float(row['water_temp']) if 'water_temp' in df.columns and pd.notna(row['water_temp']) else None,
                        float(row['ph']) if 'ph' in df.columns and pd.notna(row['ph']) else None,
                        float(row['dissolved_oxygen']) if 'dissolved_oxygen' in df.columns and pd.notna(row['dissolved_oxygen']) else None,
                        float(row['permanganate_index']) if 'permanganate_index' in df.columns and pd.notna(row['permanganate_index']) else None,
                        float(row['conductivity']) if 'conductivity' in df.columns and pd.notna(row['conductivity']) else None,
                        float(row['turbidity']) if 'turbidity' in df.columns and pd.notna(row['turbidity']) else None,
                        float(row['ammonia_nitrogen']) if 'ammonia_nitrogen' in df.columns and pd.notna(row['ammonia_nitrogen']) else None,
                        float(row['total_phosphorus']) if 'total_phosphorus' in df.columns and pd.notna(row['total_phosphorus']) else None,
                        float(row['total_nitrogen']) if 'total_nitrogen' in df.columns and pd.notna(row['total_nitrogen']) else None,
                        float(row['chlorophyll']) if 'chlorophyll' in df.columns and pd.notna(row['chlorophyll']) else None,
                        float(row['algae_density']) if 'algae_density' in df.columns and pd.notna(row['algae_density']) else None,
                        float(row['water_quality_index']) if 'water_quality_index' in df.columns and pd.notna(row['water_quality_index']) else None,
                        csv_file
                    ))

                if batch:
                    cursor.executemany(sql, batch)
                    conn.commit()
                    total_inserted += len(batch)
                    print(f"[OK] {csv_file} 导入完成，{len(batch)} 条记录")

    finally:
        conn.close()

    print(f"[OK] 历史数据重新导入完成，共 {total_inserted} 条记录")


def clear_and_reimport_predict():
    """清空并重新导入预测数据"""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("TRUNCATE TABLE fact_water_quality_predict")
            conn.commit()
            print("[OK] fact_water_quality_predict 已清空")
    finally:
        conn.close()

    if not os.path.isdir(DATA_DIR):
        return

    predict_dirs = []
    for d in os.listdir(DATA_DIR):
        path = os.path.join(DATA_DIR, d)
        if os.path.isdir(path) and d not in ['.venv', 'lstm预测结果图_单指标对比']:
            predict_dirs.append(d)

    conn = get_connection()
    total_inserted = 0

    try:
        with conn.cursor() as cursor:
            for pred_dir in predict_dirs:
                dir_path = os.path.join(DATA_DIR, pred_dir)

                model_type = None
                if 'arima' in pred_dir.lower():
                    model_type = 'ARIMA'
                elif 'lstm' in pred_dir.lower():
                    model_type = 'LSTM'
                else:
                    continue

                for f in os.listdir(dir_path):
                    if not f.endswith('.xlsx'):
                        continue

                    full_path = os.path.join(dir_path, f)

                    province = None
                    for prov_key, prov_name in PROVINCE_MAP.items():
                        if prov_key in f:
                            province = prov_name
                            break
                    if not province:
                        continue

                    try:
                        df = pd.read_excel(full_path)
                    except Exception as e:
                        print(f"[WARN] 读取失败 {f}: {e}")
                        continue

                    if df.empty:
                        continue

                    time_col = None
                    for c in df.columns:
                        if str(c).strip().lower() in ['datetime', '时间', '日期']:
                            time_col = c
                            break
                    if not time_col and len(df.columns) > 0:
                        time_col = df.columns[0]

                    if time_col:
                        df['predict_time'] = pd.to_datetime(df[time_col], errors='coerce')
                    else:
                        continue

                    sql = """
                        INSERT INTO fact_water_quality_predict
                        (region_name, predict_time, model_type, water_temp, ph,
                         dissolved_oxygen, permanganate_index, conductivity, turbidity, ammonia_nitrogen,
                         total_phosphorus, total_nitrogen, chlorophyll, algae_density,
                         water_quality_index)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """

                    batch = []
                    for _, row in df.iterrows():
                        if pd.isna(row['predict_time']):
                            continue

                        vals = {
                            'water_temp': None, 'ph': None, 'dissolved_oxygen': None,
                            'permanganate_index': None, 'conductivity': None, 'turbidity': None,
                            'ammonia_nitrogen': None, 'total_phosphorus': None, 'total_nitrogen': None,
                            'chlorophyll': None, 'algae_density': None,
                            'water_quality_index': None
                        }

                        for col in df.columns:
                            col_name = str(col).strip()
                            if col_name in INDICATOR_MAP:
                                field = INDICATOR_MAP[col_name]
                                if field in vals and pd.notna(row[col]):
                                    vals[field] = float(row[col])
                            elif col_name in LSTM_COL_MAP:
                                field = LSTM_COL_MAP[col_name]
                                if field in vals and pd.notna(row[col]):
                                    vals[field] = float(row[col])

                        batch.append((
                            province, row['predict_time'], model_type,
                            vals['water_temp'], vals['ph'], vals['dissolved_oxygen'],
                            vals['permanganate_index'], vals['conductivity'], vals['turbidity'],
                            vals['ammonia_nitrogen'], vals['total_phosphorus'], vals['total_nitrogen'],
                            vals['chlorophyll'], vals['algae_density'], vals['water_quality_index']
                        ))

                    if batch:
                        cursor.executemany(sql, batch)
                        conn.commit()
                        total_inserted += len(batch)
                        print(f"[OK] {f} ({model_type}) 导入完成，{len(batch)} 条")

    finally:
        conn.close()

    print(f"[OK] 预测数据重新导入完成，共 {total_inserted} 条记录")


def main():
    print("=" * 60)
    print("修复数据导入")
    print("=" * 60)

    print("\n[1/2] 重新导入历史数据...")
    clear_and_reimport_history()

    print("\n[2/2] 重新导入预测数据...")
    clear_and_reimport_predict()

    print("\n[OK] 修复完成！")


if __name__ == '__main__':
    main()
