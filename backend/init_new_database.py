# -*- coding: utf-8 -*-
"""
海河流域水质数据库初始化与数据迁移脚本
创建 haihe_river_basin 数据库，迁移保留表，导入新数据
"""

import os
import sys
import pandas as pd
import pymysql
from dotenv import load_dotenv
from datetime import datetime

# 加载环境变量
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'), override=True)

# 数据库连接配置
DB_HOST = os.getenv('MYSQL_HOST', 'localhost')
DB_PORT = int(os.getenv('MYSQL_PORT', '3306'))
DB_USER = os.getenv('MYSQL_USER', 'root')
DB_PASSWORD = os.getenv('MYSQL_PASSWORD', '')
OLD_DB = 'haihe_water'
NEW_DB = 'haihe_river_basin'

# 源数据目录
DATA_DIR = os.getenv('SANDBOX_DATA_ROOT', r'D:\haihe\shuju预测\批量处理结果')

# 省份映射（从文件名/数据中识别）
PROVINCE_MAP = {
    '北京': '北京市',
    '天津': '天津市',
    '河北': '河北省',
    '山西': '山西省',
    '山东': '山东省',
    '河南': '河南省',
}

# 中文指标名到英文字段名映射（与新数据CSV列名对应）
INDICATOR_MAP = {
    '水温': 'water_temp',
    'PH': 'ph',
    '总磷': 'total_phosphorus',
    '高锰酸盐': 'permanganate_index',
    '浊度': 'turbidity',
    '水质综合指数': 'water_quality_index',
    '氨氮': 'ammonia_nitrogen',
    '总氮': 'total_nitrogen',
    '电导': 'conductivity',
    '叶绿素': 'chlorophyll',
    '藻密度': 'algae_density',
}


def get_connection(database=None):
    """获取MySQL连接"""
    return pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=database,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )


def create_database():
    """创建新数据库"""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {NEW_DB} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print(f"[OK] 数据库 {NEW_DB} 创建成功")
    finally:
        conn.close()


def create_tables():
    """创建新表结构"""
    conn = get_connection(NEW_DB)
    try:
        with conn.cursor() as cursor:
            # 1. 区域维度表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sys_region (
                    region_id INT PRIMARY KEY AUTO_INCREMENT,
                    region_name VARCHAR(50) NOT NULL UNIQUE COMMENT '区域名称，如北京市',
                    region_code VARCHAR(20) COMMENT '区域代码',
                    parent_id INT DEFAULT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='区域维度表';
            """)
            print("[OK] sys_region 表创建成功")

            # 2. 监测站点维度表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS dim_station (
                    station_id INT PRIMARY KEY AUTO_INCREMENT,
                    station_name VARCHAR(100) NOT NULL COMMENT '站点名称',
                    province VARCHAR(50) NOT NULL COMMENT '所属省份',
                    city VARCHAR(50) COMMENT '城市',
                    longitude DECIMAL(10, 6) COMMENT '经度',
                    latitude DECIMAL(10, 6) COMMENT '纬度',
                    section_type VARCHAR(50) COMMENT '断面类型：省界、入海口等',
                    river_basin VARCHAR(50) COMMENT '所属流域',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_province (province)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='监测站点维度表';
            """)
            print("[OK] dim_station 表创建成功")

            # 3. 历史水质监测事实表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS fact_water_quality_history (
                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                    region_name VARCHAR(50) NOT NULL COMMENT '区域名称',
                    monitor_time DATETIME NOT NULL COMMENT '监测时间',
                    water_temp FLOAT COMMENT '水温',
                    ph FLOAT COMMENT 'PH值',
                    dissolved_oxygen FLOAT COMMENT '溶解氧（mg/L）',
                    permanganate_index FLOAT COMMENT '高锰酸盐指数',
                    conductivity FLOAT COMMENT '电导率',
                    turbidity FLOAT COMMENT '浊度',
                    ammonia_nitrogen FLOAT COMMENT '氨氮',
                    total_phosphorus FLOAT COMMENT '总磷',
                    total_nitrogen FLOAT COMMENT '总氮',
                    chlorophyll FLOAT COMMENT '叶绿素',
                    algae_density FLOAT COMMENT '藻密度',
                    water_quality_index FLOAT COMMENT '水质综合指数',
                    data_source VARCHAR(100) COMMENT '数据来源文件名',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_monitor_time (monitor_time),
                    INDEX idx_region (region_name),
                    INDEX idx_region_time (region_name, monitor_time)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='历史水质监测事实表';
            """)
            print("[OK] fact_water_quality_history 表创建成功")

            # 4. 预测水质事实表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS fact_water_quality_predict (
                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                    region_name VARCHAR(50) NOT NULL COMMENT '区域名称',
                    predict_time DATETIME NOT NULL COMMENT '预测时间点',
                    model_type VARCHAR(20) NOT NULL COMMENT '模型类型：LSTM, ARIMA, XGBoost',
                    water_temp FLOAT COMMENT '水温预测值',
                    ph FLOAT COMMENT 'PH预测值',
                    permanganate_index FLOAT COMMENT '高锰酸盐指数预测值',
                    conductivity FLOAT COMMENT '电导率预测值',
                    turbidity FLOAT COMMENT '浊度预测值',
                    ammonia_nitrogen FLOAT COMMENT '氨氮预测值',
                    total_phosphorus FLOAT COMMENT '总磷预测值',
                    total_nitrogen FLOAT COMMENT '总氮预测值',
                    chlorophyll FLOAT COMMENT '叶绿素预测值',
                    algae_density FLOAT COMMENT '藻密度预测值',
                    water_quality_index FLOAT COMMENT '水质综合指数预测值',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_predict_time (predict_time),
                    INDEX idx_region_model (region_name, model_type),
                    INDEX idx_region_predict_time (region_name, predict_time)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='时空推演预测事实表';
            """)
            print("[OK] fact_water_quality_predict 表创建成功")

            # 5. 模型评估指标表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS model_evaluation_metrics (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    model_name VARCHAR(20) NOT NULL COMMENT '模型名称：LSTM, ARIMA, XGBoost',
                    region_name VARCHAR(50) NOT NULL COMMENT '区域名称',
                    indicator_name VARCHAR(50) NOT NULL COMMENT '指标名称',
                    metric_name VARCHAR(20) NOT NULL COMMENT '指标类型：MAE, MSE, RMSE, R2',
                    metric_value FLOAT NOT NULL COMMENT '指标值',
                    sample_count INT COMMENT '有效样本数',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_model (model_name),
                    INDEX idx_region (region_name)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='模型验证评估表';
            """)
            print("[OK] model_evaluation_metrics 表创建成功")

            # 6. 智能决策报告表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS ai_governance_report (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    region_name VARCHAR(50) COMMENT '区域名称，为空表示全流域',
                    generate_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '生成时间',
                    context_prompt TEXT COMMENT '喂给LLM的上下文提示词',
                    report_content LONGTEXT COMMENT 'DeepSeek生成的自然语言报告',
                    model_type VARCHAR(20) DEFAULT 'DeepSeek' COMMENT '使用的模型',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_region (region_name),
                    INDEX idx_generate_time (generate_time)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='智能决策报告表';
            """)
            print("[OK] ai_governance_report 表创建成功")

            # 7. 兼容视图：water_quality_raw（供现有dashboard.py查询使用）
            cursor.execute(f"""
                CREATE OR REPLACE VIEW water_quality_raw AS
                SELECT
                    id,
                    DATE(monitor_time) AS year_date,
                    TIME(monitor_time) AS detect_time,
                    region_name AS province,
                    '海河流域' AS river_basin,
                    region_name AS location,
                    water_temp,
                    ph,
                    dissolved_oxygen,
                    conductivity,
                    turbidity,
                    permanganate_index,
                    ammonia_nitrogen,
                    total_phosphorus,
                    total_nitrogen,
                    chlorophyll,
                    algae_density,
                    data_source AS station_info
                FROM fact_water_quality_history;
            """)
            print("[OK] water_quality_raw 兼容视图创建成功")

            # 8. 兼容视图：province_stats
            cursor.execute("""
                CREATE OR REPLACE VIEW province_stats AS
                SELECT
                    region_name AS province,
                    AVG(dissolved_oxygen) AS avg_dissolved_oxygen,
                    AVG(ammonia_nitrogen) AS avg_ammonia_nitrogen,
                    AVG(total_phosphorus) AS avg_total_phosphorus
                FROM fact_water_quality_history
                WHERE region_name IN ('北京市', '天津市', '河北省', '山西省', '山东省', '河南省')
                GROUP BY region_name;
            """)
            print("[OK] province_stats 兼容视图创建成功")

        conn.commit()
    finally:
        conn.close()


def migrate_users_table():
    """迁移 users 表"""
    old_conn = get_connection(OLD_DB)
    new_conn = get_connection(NEW_DB)
    try:
        with old_conn.cursor() as old_cursor:
            old_cursor.execute("SELECT * FROM users")
            users = old_cursor.fetchall()
            print(f"[INFO] 从 {OLD_DB} 读取到 {len(users)} 条用户记录")

        with new_conn.cursor() as new_cursor:
            # 创建 users 表（完全保留原结构）
            new_cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    tag VARCHAR(255) NOT NULL,
                    role VARCHAR(255) NOT NULL DEFAULT '用户',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # 插入数据
            if users:
                sql = """
                    INSERT INTO users (id, username, password, email, tag, role, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                    username=VALUES(username), password=VALUES(password), email=VALUES(email),
                    tag=VALUES(tag), role=VALUES(role), created_at=VALUES(created_at)
                """
                for user in users:
                    new_cursor.execute(sql, (
                        user['id'], user['username'], user['password'],
                        user['email'], user['tag'], user['role'], user['created_at']
                    ))
                new_conn.commit()
                print(f"[OK] users 表迁移完成，共 {len(users)} 条记录")
            else:
                print("[INFO] users 表无数据需要迁移")
    finally:
        old_conn.close()
        new_conn.close()


def migrate_station_coordinates():
    """迁移 station_coordinates 表"""
    old_conn = get_connection(OLD_DB)
    new_conn = get_connection(NEW_DB)
    try:
        with old_conn.cursor() as old_cursor:
            old_cursor.execute("SELECT * FROM station_coordinates")
            stations = old_cursor.fetchall()
            print(f"[INFO] 从 {OLD_DB} 读取到 {len(stations)} 条站点坐标记录")

        with new_conn.cursor() as new_cursor:
            # 创建与原表结构一致的 station_coordinates 表
            new_cursor.execute("""
                CREATE TABLE IF NOT EXISTS station_coordinates (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    station_name VARCHAR(100) NOT NULL,
                    province VARCHAR(50) NOT NULL,
                    river_basin VARCHAR(50),
                    longitude_wgs84 DOUBLE,
                    latitude_wgs84 DOUBLE,
                    longitude_gcj02 DOUBLE,
                    latitude_gcj02 DOUBLE,
                    data_source VARCHAR(100),
                    INDEX idx_station (station_name),
                    INDEX idx_province (province)
                )
            """)

            if stations:
                sql = """
                    INSERT INTO station_coordinates
                    (id, station_name, province, river_basin, longitude_wgs84, latitude_wgs84,
                     longitude_gcj02, latitude_gcj02, data_source)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                    station_name=VALUES(station_name), province=VALUES(province),
                    river_basin=VALUES(river_basin), longitude_wgs84=VALUES(longitude_wgs84),
                    latitude_wgs84=VALUES(latitude_wgs84), longitude_gcj02=VALUES(longitude_gcj02),
                    latitude_gcj02=VALUES(latitude_gcj02), data_source=VALUES(data_source)
                """
                for station in stations:
                    new_cursor.execute(sql, (
                        station['id'], station['station_name'], station['province'],
                        station['river_basin'], station['longitude_wgs84'], station['latitude_wgs84'],
                        station['longitude_gcj02'], station['latitude_gcj02'], station['data_source']
                    ))
                new_conn.commit()
                print(f"[OK] station_coordinates 表迁移完成，共 {len(stations)} 条记录")
            else:
                print("[INFO] station_coordinates 表无数据需要迁移")

            # 同时填充 dim_station 表
            new_cursor.execute("TRUNCATE TABLE dim_station")
            new_cursor.execute("""
                INSERT INTO dim_station (station_name, province, longitude, latitude, river_basin)
                SELECT station_name, province, longitude_gcj02, latitude_gcj02, river_basin
                FROM station_coordinates
                WHERE longitude_gcj02 IS NOT NULL AND latitude_gcj02 IS NOT NULL
            """)
            new_conn.commit()
            print("[OK] dim_station 表已自动填充")

    finally:
        old_conn.close()
        new_conn.close()


def init_region_data():
    """初始化区域数据"""
    conn = get_connection(NEW_DB)
    try:
        with conn.cursor() as cursor:
            cursor.execute("TRUNCATE TABLE sys_region")
            regions = ['北京市', '天津市', '河北省', '山西省', '山东省', '河南省']
            for region in regions:
                cursor.execute(
                    "INSERT INTO sys_region (region_name) VALUES (%s)",
                    (region,)
                )
            conn.commit()
            print(f"[OK] sys_region 区域数据初始化完成，共 {len(regions)} 个区域")
    finally:
        conn.close()


def import_history_data():
    """导入历史水质监测数据"""
    if not os.path.isdir(DATA_DIR):
        print(f"[ERROR] 数据目录不存在: {DATA_DIR}")
        return

    # 扫描CSV文件
    csv_files = []
    for f in os.listdir(DATA_DIR):
        if f.endswith('.csv') and ('处理后' in f or '水质时间节点' in f):
            csv_files.append(f)

    if not csv_files:
        print(f"[WARN] 未找到历史数据CSV文件")
        return

    conn = get_connection(NEW_DB)
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
                    print(f"[WARN] 文件为空: {csv_file}")
                    continue

                # 确定省份
                province = None
                for prov_key, prov_name in PROVINCE_MAP.items():
                    if prov_key in csv_file:
                        province = prov_name
                        break
                if not province:
                    province = '海河流域'  # 全流域数据

                # 映射列名
                col_mapping = {}
                for col in df.columns:
                    col_stripped = str(col).strip()
                    if col_stripped in INDICATOR_MAP:
                        col_mapping[col_stripped] = INDICATOR_MAP[col_stripped]

                # 标准化列名
                df = df.rename(columns=col_mapping)

                # 确保 datetime 列存在
                time_col = None
                for c in df.columns:
                    if str(c).strip().lower() in ['datetime', '时间', '日期']:
                        time_col = c
                        break
                if not time_col and len(df.columns) > 0:
                    # 尝试第一列
                    time_col = df.columns[0]

                if time_col:
                    df['monitor_time'] = pd.to_datetime(df[time_col], errors='coerce')
                else:
                    print(f"[WARN] 无法识别时间列: {csv_file}")
                    continue

                # 批量插入
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
                        None,  # dissolved_oxygen 新数据中缺失
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

    print(f"[OK] 历史数据导入完成，共 {total_inserted} 条记录")


def import_predict_data():
    """导入ARIMA和LSTM预测数据"""
    if not os.path.isdir(DATA_DIR):
        return

    # 扫描预测数据目录
    predict_dirs = []
    for d in os.listdir(DATA_DIR):
        path = os.path.join(DATA_DIR, d)
        if os.path.isdir(path) and d not in ['.venv', 'lstm预测结果图_单指标对比']:
            predict_dirs.append(d)

    conn = get_connection(NEW_DB)
    total_inserted = 0

    try:
        with conn.cursor() as cursor:
            for pred_dir in predict_dirs:
                dir_path = os.path.join(DATA_DIR, pred_dir)

                # 判断模型类型
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

                    # 确定省份
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

                    # 识别时间列
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

                    # 构建插入数据
                    sql = """
                        INSERT INTO fact_water_quality_predict
                        (region_name, predict_time, model_type, water_temp, ph,
                         permanganate_index, conductivity, turbidity, ammonia_nitrogen,
                         total_phosphorus, total_nitrogen, chlorophyll, algae_density,
                         water_quality_index)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """

                    batch = []
                    for _, row in df.iterrows():
                        if pd.isna(row['predict_time']):
                            continue

                        # 根据模型类型解析列名
                        vals = {
                            'water_temp': None, 'ph': None, 'permanganate_index': None,
                            'conductivity': None, 'turbidity': None, 'ammonia_nitrogen': None,
                            'total_phosphorus': None, 'total_nitrogen': None,
                            'chlorophyll': None, 'algae_density': None,
                            'water_quality_index': None
                        }

                        for col in df.columns:
                            col_name = str(col).strip()
                            # ARIMA预测列：水温, PH, 总磷...
                            # LSTM预测列：氨氮_预测, 总磷_预测...
                            if col_name in INDICATOR_MAP:
                                field = INDICATOR_MAP[col_name]
                                if field in vals and pd.notna(row[col]):
                                    vals[field] = float(row[col])
                            elif '_预测' in col_name or '_Ԥ��' in col_name:
                                # 处理LSTM的_预测后缀
                                base_name = col_name.replace('_预测', '').replace('_Ԥ��', '')
                                if base_name in INDICATOR_MAP:
                                    field = INDICATOR_MAP[base_name]
                                    if field in vals and pd.notna(row[col]):
                                        vals[field] = float(row[col])

                        batch.append((
                            province, row['predict_time'], model_type,
                            vals['water_temp'], vals['ph'], vals['permanganate_index'],
                            vals['conductivity'], vals['turbidity'], vals['ammonia_nitrogen'],
                            vals['total_phosphorus'], vals['total_nitrogen'],
                            vals['chlorophyll'], vals['algae_density'], vals['water_quality_index']
                        ))

                    if batch:
                        cursor.executemany(sql, batch)
                        conn.commit()
                        total_inserted += len(batch)
                        print(f"[OK] {f} ({model_type}) 导入完成，{len(batch)} 条")

    finally:
        conn.close()

    print(f"[OK] 预测数据导入完成，共 {total_inserted} 条记录")


def import_evaluation_metrics():
    """导入模型评估指标（MAE/MSE）"""
    if not os.path.isdir(DATA_DIR):
        return

    conn = get_connection(NEW_DB)
    total_inserted = 0

    try:
        with conn.cursor() as cursor:
            for f in os.listdir(DATA_DIR):
                if not f.endswith('.csv') or 'MAE_MSE' not in f:
                    continue

                full_path = os.path.join(DATA_DIR, f)

                # 判断模型类型
                model_type = None
                if 'arima' in f.lower():
                    model_type = 'ARIMA'
                elif 'lstm' in f.lower():
                    model_type = 'LSTM'
                else:
                    continue

                try:
                    df = pd.read_csv(full_path)
                except Exception as e:
                    print(f"[WARN] 读取失败 {f}: {e}")
                    continue

                if df.empty or len(df.columns) < 5:
                    continue

                # 列名映射（第一列=省份，第二列=指标，第三列=MAE，第四列=MSE，第五列=样本数）
                cols = list(df.columns)
                prov_col = cols[0]
                indicator_col = cols[1]
                mae_col = cols[2]
                mse_col = cols[3]
                sample_col = cols[4]

                sql = """
                    INSERT INTO model_evaluation_metrics
                    (model_name, region_name, indicator_name, metric_name, metric_value, sample_count)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """

                batch = []
                for _, row in df.iterrows():
                    province = str(row[prov_col]).strip()
                    # 补全省份名
                    if province in PROVINCE_MAP:
                        province = PROVINCE_MAP[province]
                    elif province + '市' in PROVINCE_MAP.values():
                        province = province + '市'
                    elif province + '省' in PROVINCE_MAP.values():
                        province = province + '省'

                    indicator = str(row[indicator_col]).strip()
                    mae = float(row[mae_col]) if pd.notna(row[mae_col]) else 0
                    mse = float(row[mse_col]) if pd.notna(row[mse_col]) else 0
                    sample_count = int(row[sample_col]) if pd.notna(row[sample_col]) else None

                    batch.append((model_type, province, indicator, 'MAE', mae, sample_count))
                    batch.append((model_type, province, indicator, 'MSE', mse, sample_count))

                if batch:
                    cursor.executemany(sql, batch)
                    conn.commit()
                    total_inserted += len(batch)
                    print(f"[OK] {f} 导入完成，{len(batch)} 条评估记录")

    finally:
        conn.close()

    print(f"[OK] 模型评估指标导入完成，共 {total_inserted} 条记录")


def main():
    print("=" * 60)
    print("海河流域水质数据库初始化与数据迁移")
    print("=" * 60)

    print("\n[1/8] 创建新数据库...")
    create_database()

    print("\n[2/8] 创建表结构...")
    create_tables()

    print("\n[3/8] 迁移 users 表...")
    migrate_users_table()

    print("\n[4/8] 迁移 station_coordinates 表...")
    migrate_station_coordinates()

    print("\n[5/8] 初始化区域数据...")
    init_region_data()

    print("\n[6/8] 导入历史水质监测数据...")
    import_history_data()

    print("\n[7/8] 导入预测数据...")
    import_predict_data()

    print("\n[8/8] 导入模型评估指标...")
    import_evaluation_metrics()

    print("\n" + "=" * 60)
    print("全部完成！新数据库: haihe_river_basin")
    print("=" * 60)


if __name__ == '__main__':
    main()
