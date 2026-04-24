# -*- coding: utf-8 -*-
"""
海河流域水质知识图谱数据导入脚本
从 MySQL 数据库导入维度数据和历史水质数据到 Neo4j

图模型：
- 节点：Region, River, Station, Pollutant, WaterLevel
- 关系：BELONGS_TO, ON_RIVER, UPSTREAM_OF, EXCEEDS, HAS_LEVEL, MONITORS
"""

import os
import pymysql
from neo4j import GraphDatabase
from dotenv import load_dotenv
from decimal import Decimal
from utils.neo4j_helper import get_neo4j_config

load_dotenv(override=False)

# Neo4j 配置
NEO4J_CONFIG = get_neo4j_config()
NEO4J_URI = NEO4J_CONFIG['uri']
NEO4J_USER = NEO4J_CONFIG['user']
NEO4J_PASSWORD = NEO4J_CONFIG['password']
NEO4J_DATABASE = NEO4J_CONFIG['database'] or ''

# MySQL 配置
MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
MYSQL_PORT = int(os.getenv('MYSQL_PORT', '3306'))
MYSQL_USER = os.getenv('MYSQL_USER', 'root')
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', '123456')
MYSQL_DATABASE = os.getenv('MYSQL_DATABASE', 'haihe_river_basin')

# GB 3838-2002 III类标准限值
STANDARD_LIMITS = {
    '溶解氧': 5.0,           # mg/L, >=
    '高锰酸盐指数': 6.0,      # mg/L, <=
    '氨氮': 1.0,             # mg/L, <=
    '总磷': 0.2,             # mg/L, <=
}

# 海河流域7大支流
RIVERS = [
    {'name': '永定河', 'basin': '海河流域', 'length_km': 747},
    {'name': '大清河', 'basin': '海河流域', 'length_km': 483},
    {'name': '子牙河', 'basin': '海河流域', 'length_km': 769},
    {'name': '漳卫南运河', 'basin': '海河流域', 'length_km': 914},
    {'name': '北运河', 'basin': '海河流域', 'length_km': 238},
    {'name': '潮白河', 'basin': '海河流域', 'length_km': 467},
    {'name': '徒骇马颊河', 'basin': '海河流域', 'length_km': 630},
]

# 11个污染物指标
POLLUTANTS = [
    {'name': '水温', 'symbol': 'WT', 'unit': '℃', 'category': '物理'},
    {'name': 'pH', 'symbol': 'pH', 'unit': '无量纲', 'category': '化学'},
    {'name': '溶解氧', 'symbol': 'DO', 'unit': 'mg/L', 'category': '化学'},
    {'name': '电导率', 'symbol': 'EC', 'unit': 'μS/cm', 'category': '物理'},
    {'name': '浊度', 'symbol': 'TURB', 'unit': 'NTU', 'category': '物理'},
    {'name': '高锰酸盐指数', 'symbol': 'CODMn', 'unit': 'mg/L', 'category': '有机污染'},
    {'name': '氨氮', 'symbol': 'NH3-N', 'unit': 'mg/L', 'category': '营养盐'},
    {'name': '总磷', 'symbol': 'TP', 'unit': 'mg/L', 'category': '营养盐'},
    {'name': '总氮', 'symbol': 'TN', 'unit': 'mg/L', 'category': '营养盐'},
    {'name': '叶绿素', 'symbol': 'Chl-a', 'unit': 'μg/L', 'category': '富营养化'},
    {'name': '藻密度', 'symbol': 'Algae', 'unit': 'cells/mL', 'category': '富营养化'},
]

# 水质等级 (GB 3838-2002)
WATER_LEVELS = [
    {'level': 1, 'name': 'Ⅰ类', 'desc': '源头水、国家自然保护区', 'color': '#22c55e'},
    {'level': 2, 'name': 'Ⅱ类', 'desc': '集中式生活饮用水地表水源地一级保护区', 'color': '#3b82f6'},
    {'level': 3, 'name': 'Ⅲ类', 'desc': '集中式生活饮用水地表水源地二级保护区', 'color': '#f59e0b'},
    {'level': 4, 'name': 'Ⅳ类', 'desc': '一般工业用水区及人体非直接接触的娱乐用水区', 'color': '#ef4444'},
    {'level': 5, 'name': 'Ⅴ类', 'desc': '农业用水区及一般景观要求水域', 'color': '#7f1d1d'},
    {'level': 6, 'name': '劣Ⅴ类', 'desc': '失去使用功能', 'color': '#581c87'},
]

# 6个省市
REGIONS = [
    {'name': '北京市', 'level': 'Province', 'province': '北京市'},
    {'name': '天津市', 'level': 'Province', 'province': '天津市'},
    {'name': '河北省', 'level': 'Province', 'province': '河北省'},
    {'name': '山西省', 'level': 'Province', 'province': '山西省'},
    {'name': '河南省', 'level': 'Province', 'province': '河南省'},
    {'name': '山东省', 'level': 'Province', 'province': '山东省'},
]

# 站点名称关键词到河流的映射规则
RIVER_KEYWORDS = {
    '永定河': ['永定', '官厅', '三家店', '卢沟桥'],
    '大清河': ['大清', '白洋淀', '保定', '任丘', '雄县'],
    '子牙河': ['子牙', '滏阳', '邢台', '邯郸', '衡水'],
    '漳卫南运河': ['漳卫', '南运河', '卫河', '漳河', '濮阳', '聊城'],
    '北运河': ['北运', '通州', '廊坊'],
    '潮白河': ['潮白', '密云', '怀柔'],
    '徒骇马颊河': ['徒骇', '马颊', '滨州', '德州'],
}

# 省份到默认河流的映射（当站点名称无法匹配时）
PROVINCE_DEFAULT_RIVER = {
    '北京市': '永定河',
    '天津市': '永定河',
    '河北省': '大清河',
    '山西省': '永定河',
    '河南省': '漳卫南运河',
    '山东省': '徒骇马颊河',
}

# UPSTREAM_OF 水网拓扑定义（省级间上下游关系）
# 格式: (上游省份, 下游省份, 河流系, 距离km, 水流天数)
UPSTREAM_TOPOLOGY = [
    ('山西省', '河北省', '子牙河', 180, 2),
    ('山西省', '北京市', '永定河', 350, 3),
    ('河北省', '天津市', '大清河', 120, 1),
    ('河北省', '天津市', '子牙河', 150, 2),
    ('北京市', '天津市', '永定河', 130, 1),
    ('北京市', '天津市', '北运河', 110, 1),
    ('北京市', '天津市', '潮白河', 140, 1),
    ('河南省', '山东省', '漳卫南运河', 200, 2),
    ('河南省', '河北省', '漳卫南运河', 250, 2),
    ('山东省', '天津市', '漳卫南运河', 280, 3),
    ('山东省', '河北省', '漳卫南运河', 180, 2),
]


def get_neo4j_driver():
    return GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))


def get_neo4j_session(driver):
    if NEO4J_DATABASE:
        return driver.session(database=NEO4J_DATABASE)
    return driver.session()


def get_mysql_conn():
    return pymysql.connect(
        host=MYSQL_HOST, port=MYSQL_PORT, user=MYSQL_USER,
        password=MYSQL_PASSWORD, database=MYSQL_DATABASE,
        charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor
    )


def clear_and_setup_neo4j(driver):
    """清空数据库并创建约束"""
    with get_neo4j_session(driver) as session:
        print("[1/7] 清空现有数据...")
        session.run("MATCH (n) DETACH DELETE n")
        
        print("[2/7] 创建约束和索引...")
        constraints = [
            "CREATE CONSTRAINT region_name IF NOT EXISTS FOR (r:Region) REQUIRE r.name IS UNIQUE",
            "CREATE CONSTRAINT river_name IF NOT EXISTS FOR (r:River) REQUIRE r.name IS UNIQUE",
            "CREATE CONSTRAINT station_id IF NOT EXISTS FOR (s:Station) REQUIRE s.station_id IS UNIQUE",
            "CREATE CONSTRAINT pollutant_name IF NOT EXISTS FOR (p:Pollutant) REQUIRE p.name IS UNIQUE",
            "CREATE CONSTRAINT waterlevel_level IF NOT EXISTS FOR (w:WaterLevel) REQUIRE w.level IS UNIQUE",
        ]
        for cql in constraints:
            try:
                session.run(cql)
            except Exception as e:
                print(f"  约束已存在或跳过: {e}")
        print("  约束创建完成")


def import_base_nodes(driver):
    """导入基础节点：Region, River, Pollutant, WaterLevel"""
    with get_neo4j_session(driver) as session:
        print("[3/7] 导入 Region 节点...")
        for r in REGIONS:
            session.run("""
                CREATE (:Region {name: $name, level: $level, province: $province})
            """, name=r['name'], level=r['level'], province=r['province'])
        print(f"  导入 {len(REGIONS)} 个 Region")

        print("[4/7] 导入 River 节点...")
        for r in RIVERS:
            session.run("""
                CREATE (:River {name: $name, basin: $basin, length_km: $length_km})
            """, name=r['name'], basin=r['basin'], length_km=r['length_km'])
        print(f"  导入 {len(RIVERS)} 个 River")

        print("[5/7] 导入 Pollutant 节点...")
        for p in POLLUTANTS:
            session.run("""
                CREATE (:Pollutant {name: $name, symbol: $symbol, unit: $unit, category: $category})
            """, name=p['name'], symbol=p['symbol'], unit=p['unit'], category=p['category'])
        print(f"  导入 {len(POLLUTANTS)} 个 Pollutant")

        print("[6/7] 导入 WaterLevel 节点...")
        for w in WATER_LEVELS:
            session.run("""
                CREATE (:WaterLevel {level: $level, name: $name, desc: $desc, color: $color})
            """, level=w['level'], name=w['name'], desc=w['desc'], color=w['color'])
        print(f"  导入 {len(WATER_LEVELS)} 个 WaterLevel")


def infer_river(station_name, province):
    """根据站点名称和省份推断所属河流"""
    for river_name, keywords in RIVER_KEYWORDS.items():
        for kw in keywords:
            if kw in station_name:
                return river_name
    return PROVINCE_DEFAULT_RIVER.get(province, '永定河')


def import_stations_and_relations(driver):
    """从 MySQL 导入 Station 节点，并创建 BELONGS_TO 和 ON_RIVER 关系"""
    conn = get_mysql_conn()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT station_id, station_name, province, city, longitude, latitude, section_type FROM dim_station")
            stations = cursor.fetchall()
    finally:
        conn.close()

    print(f"[7/7] 从 MySQL 导入 {len(stations)} 个 Station 节点...")
    
    with get_neo4j_session(driver) as session:
        for s in stations:
            station_id = int(s['station_id'])
            name = s['station_name']
            province = s['province'] or '未知'
            city = s['city'] or ''
            lon = float(s['longitude']) if s['longitude'] else None
            lat = float(s['latitude']) if s['latitude'] else None
            section_type = s['section_type'] or '常规断面'
            
            # 推断河流
            river_name = infer_river(name, province)
            
            # 创建 Station 节点
            session.run("""
                CREATE (s:Station {
                    station_id: $station_id, name: $name, 
                    province: $province, city: $city,
                    lon: $lon, lat: $lat, type: $section_type
                })
            """, station_id=station_id, name=name, province=province, city=city,
                 lon=lon, lat=lat, section_type=section_type)
            
            # 创建 BELONGS_TO 关系到 Region
            session.run("""
                MATCH (s:Station {station_id: $station_id})
                MATCH (r:Region {name: $province})
                CREATE (s)-[:BELONGS_TO]->(r)
            """, station_id=station_id, province=province)
            
            # 创建 ON_RIVER 关系到 River
            session.run("""
                MATCH (s:Station {station_id: $station_id})
                MATCH (rv:River {name: $river_name})
                CREATE (s)-[:ON_RIVER]->(rv)
            """, station_id=station_id, river_name=river_name)
    
    print(f"  导入完成，创建 {len(stations)} 个 Station + BELONGS_TO + ON_RIVER")
    return stations


def create_upstream_relations(driver):
    """创建 UPSTREAM_OF 水网拓扑关系"""
    print("[8/11] 创建 UPSTREAM_OF 水网拓扑关系...")
    
    with get_neo4j_session(driver) as session:
        created = 0
        for up_prov, down_prov, river_name, dist, flow_days in UPSTREAM_TOPOLOGY:
            # 找到上游省份的代表站点（优先匹配该河流，否则取任意站点）
            up_result = session.run("""
                MATCH (s:Station)-[:ON_RIVER]->(r:River {name: $river_name})
                WHERE s.province = $up_prov
                RETURN s.station_id as id, s.name as name
                LIMIT 1
            """, river_name=river_name, up_prov=up_prov)
            up_station = up_result.single()
            
            # 如果该河流没有匹配的站点，取该省份任意站点
            if not up_station:
                up_result = session.run("""
                    MATCH (s:Station)
                    WHERE s.province = $up_prov
                    RETURN s.station_id as id, s.name as name
                    LIMIT 1
                """, up_prov=up_prov)
                up_station = up_result.single()
            
            # 找到下游省份的代表站点（优先匹配该河流，否则取任意站点）
            down_result = session.run("""
                MATCH (s:Station)-[:ON_RIVER]->(r:River {name: $river_name})
                WHERE s.province = $down_prov
                RETURN s.station_id as id, s.name as name
                LIMIT 1
            """, river_name=river_name, down_prov=down_prov)
            down_station = down_result.single()
            
            if not down_station:
                down_result = session.run("""
                    MATCH (s:Station)
                    WHERE s.province = $down_prov
                    RETURN s.station_id as id, s.name as name
                    LIMIT 1
                """, down_prov=down_prov)
                down_station = down_result.single()
            
            if up_station and down_station:
                session.run("""
                    MATCH (up:Station {station_id: $up_id})
                    MATCH (down:Station {station_id: $down_id})
                    CREATE (up)-[:UPSTREAM_OF {distance_km: $dist, flow_days: $flow_days, river: $river_name}]->(down)
                """, up_id=up_station['id'], down_id=down_station['id'],
                     dist=dist, flow_days=flow_days, river_name=river_name)
                created += 1
                print(f"  {up_station['name']}({up_prov}) -> {down_station['name']}({down_prov}) [{river_name}]")
        
        print(f"  创建 {created} 条 UPSTREAM_OF 关系")


def create_monitors_relations(driver):
    """创建 Region MONITORS Pollutant 关系"""
    print("[9/11] 创建 MONITORS 关系...")
    with get_neo4j_session(driver) as session:
        session.run("""
            MATCH (r:Region), (p:Pollutant)
            CREATE (r)-[:MONITORS]->(p)
        """)
        result = session.run("MATCH ()-[m:MONITORS]->() RETURN count(m) as cnt")
        print(f"  创建 {result.single()['cnt']} 条 MONITORS 关系")


def classify_water_level(do, nh3, tp, codmn):
    """根据指标值判定水质等级 (1-6, 1=I类, 6=劣V类)"""
    max_level = 1
    
    # 溶解氧 (越高越好)
    if do is not None:
        if do < 2.0: max_level = max(max_level, 6)
        elif do < 3.0: max_level = max(max_level, 5)
        elif do < 5.0: max_level = max(max_level, 4)
        elif do < 6.0: max_level = max(max_level, 3)
        elif do < 7.5: max_level = max(max_level, 2)
    
    # 氨氮 (越低越好)
    if nh3 is not None:
        if nh3 > 2.0: max_level = max(max_level, 6)
        elif nh3 > 1.5: max_level = max(max_level, 5)
        elif nh3 > 1.0: max_level = max(max_level, 4)
        elif nh3 > 0.5: max_level = max(max_level, 3)
        elif nh3 > 0.15: max_level = max(max_level, 2)
    
    # 总磷 (越低越好)
    if tp is not None:
        if tp > 0.4: max_level = max(max_level, 6)
        elif tp > 0.3: max_level = max(max_level, 5)
        elif tp > 0.2: max_level = max(max_level, 4)
        elif tp > 0.1: max_level = max(max_level, 3)
        elif tp > 0.02: max_level = max(max_level, 2)
    
    # 高锰酸盐指数 (越低越好)
    if codmn is not None:
        if codmn > 15: max_level = max(max_level, 6)
        elif codmn > 10: max_level = max(max_level, 5)
        elif codmn > 6: max_level = max(max_level, 4)
        elif codmn > 4: max_level = max(max_level, 3)
        elif codmn > 2: max_level = max(max_level, 2)
    
    return max_level


def percentile(values, ratio):
    """计算分位数，ratio 取值 0~1"""
    if not values:
        return None
    if len(values) == 1:
        return values[0]
    idx = (len(values) - 1) * ratio
    lower = int(idx)
    upper = min(len(values) - 1, lower + 1)
    if lower == upper:
        return values[lower]
    weight = idx - lower
    return values[lower] * (1 - weight) + values[upper] * weight


def load_province_baselines():
    """为 EXCEEDS 构建分省历史异常阈值"""
    print("[10/11] 计算分省历史异常阈值...")
    baselines = {}
    field_rules = {
        'dissolved_oxygen': ('low', 0.1, '历史P10'),
        'ammonia_nitrogen': ('high', 0.9, '历史P90'),
        'total_phosphorus': ('high', 0.9, '历史P90'),
        'permanganate_index': ('high', 0.9, '历史P90'),
    }

    conn = get_mysql_conn()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT region_name,
                       dissolved_oxygen,
                       ammonia_nitrogen,
                       total_phosphorus,
                       permanganate_index
                FROM fact_water_quality_history
                WHERE region_name IN ('北京市', '天津市', '河北省', '山西省', '河南省', '山东省')
            """)
            rows = cursor.fetchall()
    finally:
        conn.close()

    grouped = {}
    for row in rows:
        province = row['region_name']
        bucket = grouped.setdefault(
            province,
            {
                'dissolved_oxygen': [],
                'ammonia_nitrogen': [],
                'total_phosphorus': [],
                'permanganate_index': [],
            }
        )
        for field in bucket.keys():
            value = row.get(field)
            if value is not None:
                bucket[field].append(float(value))

    for province, field_map in grouped.items():
        baselines[province] = {}
        for field, values in field_map.items():
            mode, ratio, label = field_rules[field]
            values.sort()
            ref = percentile(values, ratio)
            baselines[province][field] = {
                'value': ref,
                'mode': mode,
                'label': label,
            }

    print(f"  已为 {len(baselines)} 个省份计算历史阈值")
    return baselines


def create_exceeds_and_level_relations(driver):
    """从 MySQL 历史数据创建 EXCEEDS 和 HAS_LEVEL 关系"""
    print("[11/11] 从 MySQL 历史数据创建 EXCEEDS 和 HAS_LEVEL 关系...")
    
    baselines = load_province_baselines()
    conn = get_mysql_conn()
    try:
        with conn.cursor() as cursor:
            # 按日期+省份分组，取日均值（抽样：每月1号和15号，减少数据量）
            cursor.execute("""
                SELECT 
                    DATE(monitor_time) as date,
                    region_name,
                    AVG(dissolved_oxygen) as avg_do,
                    AVG(ammonia_nitrogen) as avg_nh3,
                    AVG(total_phosphorus) as avg_tp,
                    AVG(permanganate_index) as avg_codmn
                FROM fact_water_quality_history
                WHERE DAY(monitor_time) IN (1, 15)
                GROUP BY DATE(monitor_time), region_name
                ORDER BY date
            """)
            rows = cursor.fetchall()
    finally:
        conn.close()
    
    print(f"  获取 {len(rows)} 条抽样历史记录（每月1日、15日）")
    
    exceeds_count = 0
    level_count = 0
    
    with get_neo4j_session(driver) as session:
        for row in rows:
            date = str(row['date'])
            province = row['region_name']
            do = float(row['avg_do']) if row['avg_do'] is not None else None
            nh3 = float(row['avg_nh3']) if row['avg_nh3'] is not None else None
            tp = float(row['avg_tp']) if row['avg_tp'] is not None else None
            codmn = float(row['avg_codmn']) if row['avg_codmn'] is not None else None
            
            # 获取该省份下的所有站点
            stations_result = session.run("""
                MATCH (s:Station {province: $province}) RETURN s.station_id as id
            """, province=province)
            station_ids = [r['id'] for r in stations_result]
            
            if not station_ids:
                continue
            
            # 创建 EXCEEDS 关系
            for pollutant_name, limit_val in STANDARD_LIMITS.items():
                actual_val = None
                field_name = ''
                if pollutant_name == '溶解氧':
                    actual_val = do
                    field_name = 'dissolved_oxygen'
                elif pollutant_name == '氨氮':
                    actual_val = nh3
                    field_name = 'ammonia_nitrogen'
                elif pollutant_name == '总磷':
                    actual_val = tp
                    field_name = 'total_phosphorus'
                elif pollutant_name == '高锰酸盐指数':
                    actual_val = codmn
                    field_name = 'permanganate_index'
                
                if actual_val is None:
                    continue
                
                baseline = baselines.get(province, {}).get(field_name, {})
                baseline_val = baseline.get('value')
                baseline_label = baseline.get('label', '历史阈值')

                # 判断是否超阈
                is_standard_exceed = False
                is_baseline_exceed = False
                if pollutant_name == '溶解氧':
                    is_standard_exceed = actual_val < limit_val
                    is_baseline_exceed = baseline_val is not None and actual_val < baseline_val
                else:
                    is_standard_exceed = actual_val > limit_val
                    is_baseline_exceed = baseline_val is not None and actual_val > baseline_val
                
                if is_standard_exceed or is_baseline_exceed:
                    if is_standard_exceed:
                        ref_value = limit_val
                        ref_type = 'standard'
                        note = '基于省级聚合数据 · 国标III类'
                    else:
                        ref_value = baseline_val
                        ref_type = 'baseline'
                        note = f'基于省级聚合数据 · {baseline_label}'

                    if ref_value in (None, 0):
                        ratio = 0
                    elif pollutant_name == '溶解氧':
                        ratio = round(ref_value / actual_val, 3) if actual_val and actual_val > 0 else 0
                    else:
                        ratio = round(actual_val / ref_value, 3)

                    for sid in station_ids:
                        session.run("""
                            MATCH (s:Station {station_id: $sid})
                            MATCH (p:Pollutant {name: $pname})
                            CREATE (s)-[:EXCEEDS {
                                date: $date, val: $val, limit: $limit, ratio: $ratio,
                                basis: $basis, note: $note
                            }]->(p)
                        """, sid=sid, pname=pollutant_name, date=date,
                             val=round(actual_val, 4), limit=round(ref_value, 4), ratio=ratio,
                             basis=ref_type, note=note)
                        exceeds_count += 1
            
            # 创建 HAS_LEVEL 关系
            level = classify_water_level(do, nh3, tp, codmn)
            for sid in station_ids:
                session.run("""
                    MATCH (s:Station {station_id: $sid})
                    MATCH (w:WaterLevel {level: $level})
                    CREATE (s)-[:HAS_LEVEL {
                        date: $date, province: $province,
                        note: '基于省级聚合数据'
                    }]->(w)
                """, sid=sid, level=level, date=date, province=province)
                level_count += 1
    
    print(f"  创建 {exceeds_count} 条 EXCEEDS 关系")
    print(f"  创建 {level_count} 条 HAS_LEVEL 关系")


def print_stats(driver):
    """打印图数据库统计信息"""
    print("\n========== 图数据库统计 ==========")
    with get_neo4j_session(driver) as session:
        # 节点统计
        for label in ['Region', 'River', 'Station', 'Pollutant', 'WaterLevel']:
            result = session.run(f"MATCH (n:{label}) RETURN count(n) as cnt")
            print(f"  {label} 节点: {result.single()['cnt']}")
        
        # 关系统计
        for rel_type in ['BELONGS_TO', 'ON_RIVER', 'UPSTREAM_OF', 'EXCEEDS', 'HAS_LEVEL', 'MONITORS']:
            result = session.run(f"MATCH ()-[r:{rel_type}]->() RETURN count(r) as cnt")
            print(f"  {rel_type} 关系: {result.single()['cnt']}")
        
        total_nodes = session.run("MATCH (n) RETURN count(n) as cnt").single()['cnt']
        total_rels = session.run("MATCH ()-[r]->() RETURN count(r) as cnt").single()['cnt']
        print(f"\n  总计: {total_nodes} 个节点, {total_rels} 条关系")


def main():
    print("=" * 50)
    print("海河流域水质知识图谱 - Neo4j 数据导入")
    print("=" * 50)
    
    driver = get_neo4j_driver()
    
    try:
        clear_and_setup_neo4j(driver)
        import_base_nodes(driver)
        stations = import_stations_and_relations(driver)
        create_upstream_relations(driver)
        create_monitors_relations(driver)
        create_exceeds_and_level_relations(driver)
        print_stats(driver)
        print("\n[OK] 数据导入完成！")
    except Exception as e:
        import traceback
        print(f"\n❌ 导入失败: {str(e)}")
        traceback.print_exc()
    finally:
        driver.close()


if __name__ == '__main__':
    main()
