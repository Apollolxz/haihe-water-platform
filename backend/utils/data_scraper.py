"""
数据抓取工具
用于从国家水质监测系统获取真实数据
"""

import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime

class DataScraper:
    """
    数据抓取类
    """
    
    def __init__(self):
        """
        初始化数据抓取器
        """
        self.base_url = "https://szzdjc.cnemc.cn:8070/GJZ/Business/Publish/Main.html"
    
    def fetch_tianjin_data(self):
        """
        获取天津地区的水质数据
        """
        try:
            # 发送请求获取页面内容
            response = requests.get(self.base_url, timeout=30)
            response.raise_for_status()
            
            # 解析HTML
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 查找天津相关的数据
            tianjin_data = []
            
            # 这里需要根据实际页面结构进行解析
            # 由于页面可能使用动态加载，我们需要找到包含数据的脚本或元素
            
            # 查找包含数据的脚本标签
            script_tags = soup.find_all('script')
            for script in script_tags:
                if script.string:
                    # 查找包含站点数据的脚本
                    if 'stationData' in script.string or 'waterQuality' in script.string:
                        # 提取数据
                        data_match = re.search(r'var\s+\w+\s*=\s*(\{[^}]+\})', script.string)
                        if data_match:
                            try:
                                data = json.loads(data_match.group(1))
                                tianjin_data.append(data)
                            except json.JSONDecodeError:
                                pass
            
            # 如果直接解析失败，尝试使用更通用的方法
            if not tianjin_data:
                # 查找表格数据
                tables = soup.find_all('table')
                for table in tables:
                    rows = table.find_all('tr')
                    for row in rows[1:]:  # 跳过表头
                        cells = row.find_all('td')
                        if len(cells) > 0:
                            # 检查是否包含天津相关信息
                            if '天津' in cells[0].text:
                                station_data = {
                                    'name': cells[0].text.strip(),
                                    'location': '天津市',
                                    'river': cells[1].text.strip() if len(cells) > 1 else '',
                                    'water_quality_index': cells[2].text.strip() if len(cells) > 2 else ''
                                }
                                tianjin_data.append(station_data)
            
            return tianjin_data
            
        except Exception as e:
            print(f"抓取数据时出错: {str(e)}")
            return []
    
    def parse_water_quality_data(self, raw_data):
        """
        解析水质数据
        """
        parsed_data = []
        
        for item in raw_data:
            try:
                # 提取站点信息
                station = {
                    'name': item.get('name', ''),
                    'location': item.get('location', '天津市'),
                    'river': item.get('river', ''),
                    'longitude': item.get('longitude', 117.2),  # 默认值
                    'latitude': item.get('latitude', 39.1)  # 默认值
                }
                
                # 提取水质数据
                water_quality = {
                    'station_id': None,  # 会在保存时赋值
                    'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                    'cod': item.get('cod', 0),
                    'ammonia_nitrogen': item.get('ammonia_nitrogen', 0),
                    'total_phosphorus': item.get('total_phosphorus', 0),
                    'total_nitrogen': item.get('total_nitrogen', 0),
                    'ph': item.get('ph', 7.0),
                    'water_quality_index': item.get('water_quality_index', 'Ⅲ'),
                    'water_temperature': item.get('water_temperature', 0),
                    'dissolved_oxygen': item.get('dissolved_oxygen', 0),
                    'conductivity': item.get('conductivity', 0),
                    'turbidity': item.get('turbidity', 0)
                }
                
                parsed_data.append((station, water_quality))
                
            except Exception as e:
                print(f"解析数据时出错: {str(e)}")
                continue
        
        return parsed_data