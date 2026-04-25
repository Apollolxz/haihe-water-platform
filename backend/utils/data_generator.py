"""
水质数据生成工具
用于生成符合国家标准的水质监测数据
"""

import random
from datetime import datetime, timedelta

class DataGenerator:
    """
    水质数据生成类
    """
    
    def __init__(self):
        """
        初始化数据生成器
        """
        # 天津主要监测站点（8个真实监测点）
        self.stations = [
            {'name': '三岔河口', 'longitude': 117.189417, 'latitude': 39.139583, 'river': '海河干流'},
            {'name': '北洋桥', 'longitude': 117.178687, 'latitude': 39.177685, 'river': '北运河'},
            {'name': '曹庄子泵站', 'longitude': 117.145238, 'latitude': 39.148861, 'river': '南水北调'},
            {'name': '尔王庄泵站', 'longitude': 117.364817, 'latitude': 39.399788, 'river': '尔王庄水库'},
            {'name': '塘汉公路桥', 'longitude': 117.656499, 'latitude': 39.057732, 'river': '永定新河'},
            {'name': '万家码头', 'longitude': 117.333946, 'latitude': 38.838882, 'river': '滨海新区'},
            {'name': '于桥水库出口', 'longitude': 117.613633, 'latitude': 40.038984, 'river': '于桥水库'},
            {'name': '果河桥', 'longitude': 117.315525, 'latitude': 39.821491, 'river': '果河'}
        ]
        
        # 水质类别标准
        self.quality_levels = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', '劣Ⅴ']
        
    def generate_station_data(self):
        """
        生成站点数据
        """
        stations = []
        for station in self.stations:
            stations.append({
                'name': station['name'],
                'location': '天津市',
                'river': station['river'],
                'longitude': station['longitude'],
                'latitude': station['latitude']
            })
        return stations
    
    def generate_water_quality_data(self, station_name):
        """
        生成水质数据
        根据国家标准生成合理的数值范围
        """
        # 随机确定水质类别（大部分为Ⅲ类水）
        quality_index = random.choices(
            self.quality_levels,
            weights=[5, 15, 50, 20, 8, 2]  # Ⅲ类水占比最高
        )[0]
        
        # 根据水质类别生成相应的指标
        if quality_index == 'Ⅰ':  # 优
            cod = random.uniform(10, 15)
            ammonia_nitrogen = random.uniform(0.1, 0.3)
            total_phosphorus = random.uniform(0.01, 0.05)
            total_nitrogen = random.uniform(0.2, 0.5)
            ph = random.uniform(6.5, 8.5)
            water_temperature = random.uniform(12, 18)
            dissolved_oxygen = random.uniform(7.5, 9.0)
            conductivity = random.uniform(300, 400)
            turbidity = random.uniform(5, 15)
        elif quality_index == 'Ⅱ':  # 良
            cod = random.uniform(15, 20)
            ammonia_nitrogen = random.uniform(0.3, 0.5)
            total_phosphorus = random.uniform(0.05, 0.1)
            total_nitrogen = random.uniform(0.5, 1.0)
            ph = random.uniform(6.5, 8.5)
            water_temperature = random.uniform(12, 18)
            dissolved_oxygen = random.uniform(6.0, 7.5)
            conductivity = random.uniform(350, 450)
            turbidity = random.uniform(10, 20)
        elif quality_index == 'Ⅲ':  # 一般
            cod = random.uniform(20, 30)
            ammonia_nitrogen = random.uniform(0.5, 1.0)
            total_phosphorus = random.uniform(0.1, 0.2)
            total_nitrogen = random.uniform(1.0, 1.5)
            ph = random.uniform(6.0, 9.0)
            water_temperature = random.uniform(10, 20)
            dissolved_oxygen = random.uniform(5.0, 6.0)
            conductivity = random.uniform(400, 500)
            turbidity = random.uniform(15, 30)
        elif quality_index == 'Ⅳ':  # 较差
            cod = random.uniform(30, 40)
            ammonia_nitrogen = random.uniform(1.0, 1.5)
            total_phosphorus = random.uniform(0.2, 0.3)
            total_nitrogen = random.uniform(1.5, 2.0)
            ph = random.uniform(6.0, 9.0)
            water_temperature = random.uniform(10, 22)
            dissolved_oxygen = random.uniform(3.0, 5.0)
            conductivity = random.uniform(450, 600)
            turbidity = random.uniform(25, 50)
        elif quality_index == 'Ⅴ':  # 差
            cod = random.uniform(40, 50)
            ammonia_nitrogen = random.uniform(1.5, 2.0)
            total_phosphorus = random.uniform(0.3, 0.4)
            total_nitrogen = random.uniform(2.0, 2.5)
            ph = random.uniform(5.5, 9.5)
            water_temperature = random.uniform(8, 25)
            dissolved_oxygen = random.uniform(2.0, 3.0)
            conductivity = random.uniform(500, 700)
            turbidity = random.uniform(40, 80)
        else:  # 劣Ⅴ - 极差
            cod = random.uniform(50, 80)
            ammonia_nitrogen = random.uniform(2.0, 5.0)
            total_phosphorus = random.uniform(0.4, 0.8)
            total_nitrogen = random.uniform(2.5, 5.0)
            ph = random.uniform(5.0, 10.0)
            water_temperature = random.uniform(5, 30)
            dissolved_oxygen = random.uniform(0.5, 2.0)
            conductivity = random.uniform(600, 1000)
            turbidity = random.uniform(70, 150)
        
        return {
            'station_id': None,  # 会在保存时赋值
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'cod': round(cod, 2),
            'ammonia_nitrogen': round(ammonia_nitrogen, 3),
            'total_phosphorus': round(total_phosphorus, 3),
            'total_nitrogen': round(total_nitrogen, 2),
            'ph': round(ph, 2),
            'water_quality_index': quality_index,
            'water_temperature': round(water_temperature, 2),
            'dissolved_oxygen': round(dissolved_oxygen, 2),
            'conductivity': round(conductivity, 2),
            'turbidity': round(turbidity, 2)
        }
    
    def generate_all_data(self):
        """
        生成所有站点的数据
        """
        parsed_data = []
        
        for station in self.stations:
            station_data = {
                'name': station['name'],
                'location': '天津市',
                'river': station['river'],
                'longitude': station['longitude'],
                'latitude': station['latitude']
            }
            
            water_quality_data = self.generate_water_quality_data(station['name'])
            parsed_data.append((station_data, water_quality_data))
        
        return parsed_data
    
    def generate_historical_data(self, station_name, days=7):
        """
        生成历史数据
        """
        historical_data = []
        base_time = datetime.now()
        
        for i in range(days * 24):  # 每小时一条数据
            timestamp = base_time - timedelta(hours=i)
            
            # 生成数据，添加一些随机波动
            quality_data = self.generate_water_quality_data(station_name)
            quality_data['timestamp'] = timestamp.strftime('%Y-%m-%d %H:%M:%S')
            
            historical_data.append(quality_data)
        
        return historical_data


# 测试代码
if __name__ == '__main__':
    generator = DataGenerator()
    
    # 生成所有站点数据
    all_data = generator.generate_all_data()
    
    print("生成的站点数据：")
    for station_data, water_quality_data in all_data[:3]:  # 只显示前3个
        print(f"\n站点: {station_data['name']}")
        print(f"  水质类别: {water_quality_data['water_quality_index']}")
        print(f"  COD: {water_quality_data['cod']} mg/L")
        print(f"  氨氮: {water_quality_data['ammonia_nitrogen']} mg/L")
        print(f"  水温: {water_quality_data['water_temperature']} ℃")
        print(f"  PH: {water_quality_data['ph']}")
        print(f"  溶解氧: {water_quality_data['dissolved_oxygen']} mg/L")
        print(f"  电导率: {water_quality_data['conductivity']} μS/cm")
        print(f"  浊度: {water_quality_data['turbidity']} NTU")