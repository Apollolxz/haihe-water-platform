"""
水质数据模型
"""

import pymysql
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv(override=True)

class WaterQuality:
    """
    水质数据模型类
    """
    
    def __init__(self, station_id, timestamp, cod, ammonia_nitrogen, total_phosphorus, total_nitrogen, ph, water_quality_index, water_temperature=None, dissolved_oxygen=None, conductivity=None, turbidity=None, permanganate_index=None):
        """
        初始化水质数据对象
        """
        self.station_id = station_id
        self.timestamp = timestamp
        self.cod = cod
        self.ammonia_nitrogen = ammonia_nitrogen
        self.total_phosphorus = total_phosphorus
        self.total_nitrogen = total_nitrogen
        self.ph = ph
        self.water_quality_index = water_quality_index
        self.water_temperature = water_temperature
        self.dissolved_oxygen = dissolved_oxygen
        self.conductivity = conductivity
        self.turbidity = turbidity
        self.permanganate_index = permanganate_index
    
    @classmethod
    def get_db(cls):
        """
        获取数据库连接
        """
        connection = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            port=int(os.getenv('MYSQL_PORT', '3306')),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'haihe_river_basin'),
            cursorclass=pymysql.cursors.DictCursor
        )
        return connection
    
    @classmethod
    def init_db(cls):
        """
        初始化数据库表
        """
        connection = cls.get_db()
        try:
            with connection.cursor() as cursor:
                # 启动时只做幂等建表，避免因为旧表已存在而阻塞整个 Flask 服务
                sql = """
                CREATE TABLE IF NOT EXISTS stations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    location VARCHAR(255) NOT NULL,
                    longitude DOUBLE NOT NULL,
                    latitude DOUBLE NOT NULL,
                    river VARCHAR(255) NOT NULL
                )
                """
                cursor.execute(sql)
                
                sql = """
                CREATE TABLE IF NOT EXISTS water_quality (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    station_id INT NOT NULL,
                    timestamp DATETIME NOT NULL,
                    cod DOUBLE NOT NULL,
                    ammonia_nitrogen DOUBLE NOT NULL,
                    total_phosphorus DOUBLE NOT NULL,
                    total_nitrogen DOUBLE NOT NULL,
                    ph DOUBLE NOT NULL,
                    water_quality_index VARCHAR(50) NOT NULL,
                    water_temperature DOUBLE,
                    dissolved_oxygen DOUBLE,
                    conductivity DOUBLE,
                    turbidity DOUBLE,
                    permanganate_index DOUBLE,
                    FOREIGN KEY (station_id) REFERENCES stations(id)
                )
                """
                cursor.execute(sql)
            connection.commit()
        finally:
            connection.close()
    
    def save(self):
        """
        保存水质数据到数据库
        """
        connection = self.get_db()
        try:
            with connection.cursor() as cursor:
                # 插入水质数据
                sql = """
                INSERT INTO water_quality (station_id, timestamp, cod, ammonia_nitrogen, total_phosphorus, total_nitrogen, ph, water_quality_index, water_temperature, dissolved_oxygen, conductivity, turbidity, permanganate_index)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(sql, (
                    self.station_id,
                    self.timestamp,
                    self.cod,
                    self.ammonia_nitrogen,
                    self.total_phosphorus,
                    self.total_nitrogen,
                    self.ph,
                    self.water_quality_index,
                    self.water_temperature,
                    self.dissolved_oxygen,
                    self.conductivity,
                    self.turbidity,
                    self.permanganate_index
                ))
                connection.commit()
                self.id = cursor.lastrowid
                return self
        finally:
            connection.close()
    
    @classmethod
    def get_stations(cls, location=None):
        """
        获取站点列表
        """
        connection = cls.get_db()
        try:
            with connection.cursor() as cursor:
                if location:
                    sql = "SELECT * FROM stations WHERE location = %s"
                    cursor.execute(sql, (location,))
                else:
                    sql = "SELECT * FROM stations"
                    cursor.execute(sql)
                return cursor.fetchall()
        finally:
            connection.close()
    
    @classmethod
    def get_latest_data(cls, station_id=None):
        """
        获取最新水质数据
        """
        connection = cls.get_db()
        try:
            with connection.cursor() as cursor:
                if station_id:
                    sql = """
                    SELECT w.*, s.name, s.location, s.river, s.longitude, s.latitude
                    FROM water_quality w
                    JOIN stations s ON w.station_id = s.id
                    WHERE w.station_id = %s
                    ORDER BY w.timestamp DESC
                    LIMIT 1
                    """
                    cursor.execute(sql, (station_id,))
                else:
                    sql = """
                    SELECT w.*, s.name, s.location, s.river, s.longitude, s.latitude
                    FROM water_quality w
                    JOIN stations s ON w.station_id = s.id
                    WHERE w.timestamp = (
                        SELECT MAX(timestamp) 
                        FROM water_quality 
                        WHERE station_id = s.id
                    )
                    """
                    cursor.execute(sql)
                return cursor.fetchall()
        finally:
            connection.close()
    
    @classmethod
    def get_historical_data(cls, station_id, days=7):
        """
        获取历史水质数据
        """
        connection = cls.get_db()
        try:
            with connection.cursor() as cursor:
                sql = """
                SELECT * FROM water_quality
                WHERE station_id = %s
                AND timestamp >= DATE_SUB(NOW(), INTERVAL %s DAY)
                ORDER BY timestamp
                """
                cursor.execute(sql, (station_id, days))
                return cursor.fetchall()
        finally:
            connection.close()
    
    @classmethod
    def save_station(cls, station_data):
        """
        保存站点信息
        """
        connection = cls.get_db()
        try:
            with connection.cursor() as cursor:
                # 检查站点是否已存在
                sql = "SELECT id FROM stations WHERE name = %s"
                cursor.execute(sql, (station_data['name'],))
                existing_station = cursor.fetchone()
                
                if existing_station:
                    # 站点已存在，返回ID
                    return existing_station['id']
                else:
                    # 站点不存在，创建新站点
                    sql = """
                    INSERT INTO stations (name, location, longitude, latitude, river)
                    VALUES (%s, %s, %s, %s, %s)
                    """
                    cursor.execute(sql, (
                        station_data['name'],
                        station_data['location'],
                        station_data['longitude'],
                        station_data['latitude'],
                        station_data['river']
                    ))
                    connection.commit()
                    return cursor.lastrowid
        finally:
            connection.close()
    
    @classmethod
    def sync_from_api(cls, station_data, water_quality_data):
        """
        从API同步数据
        """
        # 保存站点信息
        station_id = cls.save_station(station_data)
        
        # 保存水质数据
        water_quality = cls(
            station_id=station_id,
            timestamp=water_quality_data['timestamp'],
            cod=water_quality_data['cod'],
            ammonia_nitrogen=water_quality_data['ammonia_nitrogen'],
            total_phosphorus=water_quality_data['total_phosphorus'],
            total_nitrogen=water_quality_data['total_nitrogen'],
            ph=water_quality_data['ph'],
            water_quality_index=water_quality_data['water_quality_index'],
            water_temperature=water_quality_data.get('water_temperature'),
            dissolved_oxygen=water_quality_data.get('dissolved_oxygen'),
            conductivity=water_quality_data.get('conductivity'),
            turbidity=water_quality_data.get('turbidity'),
            permanganate_index=water_quality_data.get('permanganate_index')
        )
        
        return water_quality.save()
    
    @classmethod
    def get_quarterly_data(cls, year=2025):
        """
        获取季度水质类别比例数据
        """
        connection = cls.get_db()
        try:
            with connection.cursor() as cursor:
                sql = "SELECT * FROM water_quality_quarterly WHERE year = %s ORDER BY id"
                cursor.execute(sql, (year,))
                return cursor.fetchall()
        finally:
            connection.close()
    
    @classmethod
    def get_district_data(cls, year=2025):
        """
        获取各区水质排名数据
        """
        connection = cls.get_db()
        try:
            with connection.cursor() as cursor:
                sql = "SELECT * FROM water_quality_district WHERE year = %s ORDER BY district_rank"
                cursor.execute(sql, (year,))
                return cursor.fetchall()
        finally:
            connection.close()
    
    @classmethod
    def get_pollutants_data(cls, year=2025):
        """
        获取主要污染指标数据
        """
        connection = cls.get_db()
        try:
            with connection.cursor() as cursor:
                sql = "SELECT * FROM water_quality_pollutants WHERE year = %s ORDER BY id"
                cursor.execute(sql, (year,))
                return cursor.fetchall()
        finally:
            connection.close()
