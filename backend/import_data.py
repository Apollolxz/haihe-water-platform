"""
数据导入脚本
将CSV水质数据导入MySQL数据库
"""

import pandas as pd
import pymysql
import os
from datetime import datetime
from dotenv import load_dotenv

# 加载环境变量
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'), override=True)

DEFAULT_IMPORT_DATA_DIR = r'D:\shuju'
DEFAULT_IMPORT_CSV_PATH = os.path.join(DEFAULT_IMPORT_DATA_DIR, '数据.csv')

def get_db_connection():
    """获取数据库连接"""
    return pymysql.connect(
        host=os.getenv('MYSQL_HOST', 'localhost'),
        port=int(os.getenv('MYSQL_PORT', '3306')),
        user=os.getenv('MYSQL_USER', 'root'),
        password=os.getenv('MYSQL_PASSWORD', ''),
        database=os.getenv('MYSQL_DATABASE', 'haihe_river_basin'),
        cursorclass=pymysql.cursors.DictCursor
    )

def init_dashboard_tables():
    """初始化大屏数据表"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # 创建原始数据表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS water_quality_raw (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    year_date VARCHAR(20) NOT NULL,
                    detect_time VARCHAR(20) NOT NULL,
                    province VARCHAR(50) NOT NULL,
                    river_basin VARCHAR(50) NOT NULL,
                    location VARCHAR(100) NOT NULL,
                    water_temp FLOAT,
                    ph FLOAT,
                    dissolved_oxygen FLOAT,
                    conductivity FLOAT,
                    turbidity FLOAT,
                    permanganate_index FLOAT,
                    ammonia_nitrogen FLOAT,
                    total_phosphorus FLOAT,
                    total_nitrogen FLOAT,
                    chlorophyll FLOAT,
                    algae_density FLOAT,
                    station_info VARCHAR(50),
                    INDEX idx_province (province),
                    INDEX idx_date (year_date),
                    INDEX idx_location (location)
                )
            """)
            print("[OK] water_quality_raw table created")
            
            # 创建省份统计表（用于分组柱状图）
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS province_stats (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    province VARCHAR(50) NOT NULL,
                    avg_dissolved_oxygen FLOAT,
                    avg_ammonia_nitrogen FLOAT,
                    avg_total_phosphorus FLOAT,
                    UNIQUE KEY unique_province (province)
                )
            """)
            print("[OK] province_stats table created")
            
        conn.commit()
    finally:
        conn.close()

def import_csv_data(csv_path):
    """导入CSV数据"""
    print(f"正在读取CSV文件: {csv_path}")
    df = pd.read_csv(csv_path, encoding='gbk')
    
    print(f"共读取 {len(df)} 条记录")
    print(f"省份分布: {df['省份'].value_counts().to_dict()}")
    
    # 清理数据
    df = df.fillna(0)
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # 清空旧数据
            cursor.execute("TRUNCATE TABLE water_quality_raw")
            print("Old data cleared")
            
            # 插入新数据
            sql = """
                INSERT INTO water_quality_raw 
                (year_date, detect_time, province, river_basin, location, water_temp, ph,
                 dissolved_oxygen, conductivity, turbidity, permanganate_index,
                 ammonia_nitrogen, total_phosphorus, total_nitrogen, chlorophyll,
                 algae_density, station_info)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            batch_size = 1000
            total = len(df)
            
            def safe_float(val):
                try:
                    if pd.isna(val) or val == '' or val == '--':
                        return 0
                    return float(val)
                except:
                    return 0
            
            for i in range(0, total, batch_size):
                batch = df.iloc[i:i+batch_size]
                values = []
                for _, row in batch.iterrows():
                    values.append((
                        str(row['年份']) if pd.notna(row['年份']) else '',
                        str(row['检测时间']) if pd.notna(row['检测时间']) else '',
                        str(row['省份']) if pd.notna(row['省份']) else '',
                        str(row['流域']) if pd.notna(row['流域']) else '',
                        str(row['地点']) if pd.notna(row['地点']) else '',
                        safe_float(row['水温']),
                        safe_float(row['PH']),
                        safe_float(row['溶解氧']),
                        safe_float(row['电导率']),
                        safe_float(row['浊度']),
                        safe_float(row['高锰酸钾指数']),
                        safe_float(row['氨氮']),
                        safe_float(row['总磷']),
                        safe_float(row['总氮']),
                        safe_float(row['叶绿素']),
                        safe_float(row['藻密度']),
                        str(row['站点信息']) if pd.notna(row['站点信息']) else ''
                    ))
                
                cursor.executemany(sql, values)
                conn.commit()
                print(f"  已导入 {min(i+batch_size, total)}/{total} 条")
            
            print(f"[OK] Imported {total} records")
    finally:
        conn.close()

def calculate_province_stats():
    """计算省份统计数据"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # 清空旧统计
            cursor.execute("TRUNCATE TABLE province_stats")
            
            # 计算各省平均值
            cursor.execute("""
                INSERT INTO province_stats (province, avg_dissolved_oxygen, avg_ammonia_nitrogen, avg_total_phosphorus)
                SELECT 
                    province,
                    AVG(dissolved_oxygen) as avg_do,
                    AVG(ammonia_nitrogen) as avg_nh3,
                    AVG(total_phosphorus) as avg_tp
                FROM water_quality_raw
                WHERE province IN ('北京市', '天津市', '河北省', '山西省', '山东省', '河南省')
                GROUP BY province
            """)
            conn.commit()
            print("[OK] Province stats calculated")
            
            # 显示统计结果
            cursor.execute("SELECT * FROM province_stats")
            stats = cursor.fetchall()
            print("\nProvince stats:")
            for s in stats:
                print(f"  {s['province']}: 溶解氧={s['avg_dissolved_oxygen']:.2f}, 氨氮={s['avg_ammonia_nitrogen']:.3f}, 总磷={s['avg_total_phosphorus']:.3f}")
    finally:
        conn.close()

def main():
    """主函数"""
    csv_path = os.getenv('IMPORT_CSV_PATH', DEFAULT_IMPORT_CSV_PATH)
    csv_dir = os.getenv('IMPORT_DATA_DIR', os.path.dirname(csv_path) or DEFAULT_IMPORT_DATA_DIR)
    
    print("="*50)
    print("Water Quality Data Import Tool")
    print("="*50)
    
    # 初始化表结构
    print("\n1. Initializing database tables...")
    init_dashboard_tables()
    
    # 导入数据
    print("\n2. Importing CSV data...")
    if os.path.exists(csv_path):
        import_csv_data(csv_path)
    else:
        # 尝试glob查找
        import glob
        csv_files = glob.glob(os.path.join(csv_dir, '*.csv'))
        if csv_files:
            import_csv_data(csv_files[0])
        else:
            print("Error: CSV file not found")
            return
    
    # 计算统计
    print("\n3. Calculating statistics...")
    calculate_province_stats()
    
    print("\n" + "="*50)
    print("Data import completed!")
    print("="*50)

if __name__ == '__main__':
    main()
