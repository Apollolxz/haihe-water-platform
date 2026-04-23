"""
导入监测站点经纬度数据到MySQL
"""
import pandas as pd
import pymysql
import os
from models.water_quality import WaterQuality

# 读取经纬度数据
csv_path = r'D:\经纬度信息\海河流域监测站点_完整坐标.csv'
print(f"Reading: {csv_path}")
df = pd.read_csv(csv_path, encoding='utf-8')

print(f"Total stations: {len(df)}")
print(f"Columns: {df.columns.tolist()}")
print("\nSample data:")
print(df.head(3))

# 连接数据库
conn = WaterQuality.get_db()

try:
    with conn.cursor() as cursor:
        # 创建站点坐标表
        cursor.execute("""
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
                UNIQUE KEY unique_station (station_name, province)
            )
        """)
        print("\nTable station_coordinates created")
        
        # 清空旧数据
        cursor.execute("TRUNCATE TABLE station_coordinates")
        print("Old data cleared")
        
        # 插入数据
        sql = """
            INSERT INTO station_coordinates 
            (station_name, province, river_basin, longitude_wgs84, latitude_wgs84, 
             longitude_gcj02, latitude_gcj02, data_source)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
            river_basin = VALUES(river_basin),
            longitude_wgs84 = VALUES(longitude_wgs84),
            latitude_wgs84 = VALUES(latitude_wgs84),
            longitude_gcj02 = VALUES(longitude_gcj02),
            latitude_gcj02 = VALUES(latitude_gcj02),
            data_source = VALUES(data_source)
        """
        
        count = 0
        # 使用列索引访问，避免编码问题
        cols = df.columns.tolist()
        for _, row in df.iterrows():
            # 处理NaN值 - 使用索引访问
            lon_wgs = float(row.iloc[3]) if pd.notna(row.iloc[3]) else None
            lat_wgs = float(row.iloc[4]) if pd.notna(row.iloc[4]) else None
            lon_gcj = float(row.iloc[5]) if pd.notna(row.iloc[5]) else None
            lat_gcj = float(row.iloc[6]) if pd.notna(row.iloc[6]) else None
            
            cursor.execute(sql, (
                str(row.iloc[0]),  # 站点名称
                str(row.iloc[1]),  # 省份
                str(row.iloc[2]) if pd.notna(row.iloc[2]) else None,  # 流域
                lon_wgs,
                lat_wgs,
                lon_gcj,
                lat_gcj,
                str(row.iloc[7]) if pd.notna(row.iloc[7]) else None  # 数据来源
            ))
            count += 1
        
        conn.commit()
        print(f"\nImported {count} stations successfully!")
        
        # 验证数据
        cursor.execute("SELECT COUNT(*) as c FROM station_coordinates")
        total = cursor.fetchone()['c']
        print(f"Total in database: {total}")
        
        # 显示样本
        cursor.execute("""
            SELECT province, station_name, longitude_gcj02, latitude_gcj02 
            FROM station_coordinates 
            LIMIT 5
        """)
        print("\nSample stations:")
        for row in cursor.fetchall():
            print(f"  {row['province']} - {row['station_name']}: ({row['longitude_gcj02']}, {row['latitude_gcj02']})")
            
finally:
    conn.close()
    print("\nDone!")
