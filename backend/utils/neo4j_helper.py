# -*- coding: utf-8 -*-
"""
Neo4j 海河流域水质知识图谱查询工具
"""

from datetime import date, datetime, timedelta
from functools import lru_cache
import math
import os
from typing import Any

import pymysql
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv(override=False)

# 节点类别颜色映射
CATEGORY_COLORS = {
    'Region': '#5470c6',
    'River': '#3ba272',
    'Station': '#fc8452',
    'Pollutant': '#ee6666',
    'WaterLevel': '#9a60b4',
}

CATEGORY_NAMES = {
    'Region': '行政区划',
    'River': '水系河流',
    'Station': '监测站点',
    'Pollutant': '污染物指标',
    'WaterLevel': '水质等级',
}

MYSQL_CONFIG = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'port': int(os.getenv('MYSQL_PORT', '3306')),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', '123456'),
    'database': os.getenv('MYSQL_DATABASE', 'haihe_river_basin'),
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor,
}

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

POLLUTANT_ALIASES = {
    'CODMn': '高锰酸盐指数',
    '高锰酸钾指数': '高锰酸盐指数',
}

POLLUTANT_META = {
    '水温': {'field': 'water_temp', 'direction': 'high'},
    'pH': {'field': 'ph', 'direction': 'range', 'min': 6.0, 'max': 9.0},
    '溶解氧': {'field': 'dissolved_oxygen', 'direction': 'low', 'limit': 5.0},
    '电导率': {'field': 'conductivity', 'direction': 'high'},
    '浊度': {'field': 'turbidity', 'direction': 'high'},
    '高锰酸盐指数': {'field': 'permanganate_index', 'direction': 'high', 'limit': 6.0},
    '氨氮': {'field': 'ammonia_nitrogen', 'direction': 'high', 'limit': 1.0},
    '总磷': {'field': 'total_phosphorus', 'direction': 'high', 'limit': 0.2},
    '总氮': {'field': 'total_nitrogen', 'direction': 'high'},
    '叶绿素': {'field': 'chlorophyll', 'direction': 'high'},
    '藻密度': {'field': 'algae_density', 'direction': 'high'},
}

FLOW_SPEED_KM_PER_DAY = 120.0
MAX_TRACE_CANDIDATES = 10
MAX_UPSTREAM_CANDIDATES = 8
DEFAULT_TRACE_WINDOW_DAYS = 5
SAME_PROVINCE_DIRECTION_GAP = 0.03


def _get_env_first(*names, default=''):
    for name in names:
        value = os.getenv(name)
        if value is None:
            continue
        text = str(value).strip()
        if text:
            return text
    return default


def _running_on_railway():
    return bool(
        os.getenv('RAILWAY_ENVIRONMENT')
        or os.getenv('RAILWAY_ENVIRONMENT_ID')
        or os.getenv('RAILWAY_PROJECT_ID')
    )


def get_neo4j_config():
    load_dotenv(override=False)
    database = _get_env_first('NEO4J_DATABASE', 'AURA_INSTANCEID')
    uri = _get_env_first('NEO4J_URI')
    if (not uri or uri.startswith('bolt://localhost')) and database and '://' not in database and '.' not in database:
        uri = f'neo4j+s://{database}.databases.neo4j.io'
    if not uri:
        uri = 'bolt://localhost:7687'
    user = _get_env_first('NEO4J_USERNAME', 'NEO4J_USER', default='neo4j')
    password = _get_env_first('NEO4J_PASSWORD', default='12345678')
    database = database or None
    if _running_on_railway() and uri.startswith('bolt://localhost'):
        raise RuntimeError(
            'Railway 未配置 AuraDB 环境变量，请在后端服务中设置 '
            'NEO4J_URI、NEO4J_USER/NEO4J_USERNAME、NEO4J_PASSWORD、NEO4J_DATABASE'
        )
    return {
        'uri': uri,
        'user': user,
        'password': password,
        'database': database,
    }


def get_neo4j_driver():
    config = get_neo4j_config()
    return GraphDatabase.driver(config['uri'], auth=(config['user'], config['password']))


def get_mysql_conn():
    return pymysql.connect(**MYSQL_CONFIG)


def get_neo4j_session(driver):
    config = get_neo4j_config()
    if config['database']:
        return driver.session(database=config['database'])
    return driver.session()


def get_active_database_name(session):
    try:
        record = session.run("CALL db.info() YIELD name RETURN name").single()
        if record and record.get('name'):
            return record['name']
    except Exception:
        pass
    return get_neo4j_config()['database'] or 'neo4j'


def get_graph_data():
    """获取全量知识图谱数据"""
    driver = get_neo4j_driver()
    try:
        with get_neo4j_session(driver) as session:
            config = get_neo4j_config()
            active_database = get_active_database_name(session)
            # 查询所有节点
            nodes_result = session.run("""
                MATCH (n) 
                RETURN elementId(n) as id, labels(n) as labels, properties(n) as props
            """)
            
            nodes = []
            category_set = set()
            node_records = []
            
            for record in nodes_result:
                node_records.append(record)
                labels = record.get("labels", [])
                category = labels[0] if labels else '其他'
                category_set.add(category)
                
                props = record.get("props", {})
                
                # 确定节点显示名称
                name = props.get('name') or props.get('station_name') or ''
                if not name and 'level' in props:
                    name = props.get('name', '')
                if not name:
                    name = category + str(record['id'])
                
                # 构建描述信息
                desc_parts = []
                for k, v in sorted(props.items()):
                    if k not in ('name', 'station_name') and v is not None:
                        desc_parts.append(f"{k}: {v}")
                description = ' | '.join(desc_parts[:5])
                
                node = {
                    "id": str(record["id"]),
                    "name": name,
                    "category": category,
                    "description": description,
                    "symbolSize": _get_node_size(category),
                }
                nodes.append(node)
            
            # 生成类别列表
            category_list = []
            for cat in sorted(category_set):
                category_list.append({
                    "name": CATEGORY_NAMES.get(cat, cat),
                    "itemStyle": {"color": CATEGORY_COLORS.get(cat, '#909399')}
                })
            
            # 更新节点类别索引
            for i, node in enumerate(nodes):
                record = node_records[i]
                labels = record.get("labels", [])
                category = labels[0] if labels else '其他'
                for idx, cat in enumerate(category_list):
                    if cat['name'] == CATEGORY_NAMES.get(category, category):
                        node['category'] = idx
                        break
            
            # 查询所有关系
            links_result = session.run("""
                MATCH (a)-[r]->(b) 
                RETURN elementId(a) as source, elementId(b) as target, type(r) as relation, properties(r) as rel_props
            """)
            
            links = []
            for record in links_result:
                rel_type = record["relation"]
                rel_props = record.get("rel_props", {})
                
                # 为关系构建标签
                label = rel_type
                if 'date' in rel_props:
                    label += f" ({rel_props['date']})"
                
                link = {
                    "source": str(record["source"]),
                    "target": str(record["target"]),
                    "relation": rel_type,
                    "label": label,
                }
                links.append(link)
            
            return {
                "nodes": nodes,
                "links": links,
                "categories": category_list,
                "meta": {
                    "uri": config['uri'],
                    "user": config['user'],
                    "database": active_database,
                    "configured_database": config['database'],
                }
            }
    finally:
        driver.close()


def _get_node_size(category):
    """根据节点类别返回大小"""
    sizes = {
        'Region': 30,
        'River': 25,
        'Station': 18,
        'Pollutant': 15,
        'WaterLevel': 20,
    }
    return sizes.get(category, 15)


def search_graph(keyword):
    """搜索知识图谱"""
    driver = get_neo4j_driver()
    try:
        with get_neo4j_session(driver) as session:
            search_result = session.run("""
                MATCH (n) 
                WHERE n.name CONTAINS $keyword OR n.province CONTAINS $keyword
                OPTIONAL MATCH (n)-[r]->(m)
                OPTIONAL MATCH (p)-[r2]->(n)
                RETURN n, r, m, p, r2
                LIMIT 100
            """, keyword=keyword)
            
            nodes = []
            links = []
            node_ids = set()
            categories = []
            category_map = {}
            
            for record in search_result:
                # 中心节点
                if record["n"]:
                    node_id = str(record["n"].id)
                    if node_id not in node_ids:
                        node_ids.add(node_id)
                        labels = list(record["n"].labels)
                        category = labels[0] if labels else '其他'
                        
                        props = dict(record["n"])
                        name = props.get('name') or props.get('station_name') or category
                        
                        node = {
                            "id": node_id,
                            "name": name,
                            "category": category,
                            "description": f"类型: {CATEGORY_NAMES.get(category, category)}",
                            "symbolSize": _get_node_size(category),
                        }
                        nodes.append(node)
                        
                        if category not in category_map:
                            category_map[category] = len(categories)
                            categories.append({
                                "name": CATEGORY_NAMES.get(category, category),
                                "itemStyle": {"color": CATEGORY_COLORS.get(category, '#909399')}
                            })
                        node['category'] = category_map[category]
                
                # 出向关系
                if record["r"] and record["m"]:
                    target_id = str(record["m"].id)
                    if target_id not in node_ids:
                        node_ids.add(target_id)
                        labels = list(record["m"].labels)
                        category = labels[0] if labels else '其他'
                        props = dict(record["m"])
                        name = props.get('name') or props.get('station_name') or category
                        node = {
                            "id": target_id,
                            "name": name,
                            "category": category,
                            "description": f"类型: {CATEGORY_NAMES.get(category, category)}",
                            "symbolSize": _get_node_size(category),
                        }
                        nodes.append(node)
                        if category not in category_map:
                            category_map[category] = len(categories)
                            categories.append({
                                "name": CATEGORY_NAMES.get(category, category),
                                "itemStyle": {"color": CATEGORY_COLORS.get(category, '#909399')}
                            })
                        node['category'] = category_map[category]
                    
                    links.append({
                        "source": str(record["n"].id),
                        "target": target_id,
                        "relation": record["r"].type,
                    })
                
                # 入向关系
                if record["r2"] and record["p"]:
                    source_id = str(record["p"].id)
                    if source_id not in node_ids:
                        node_ids.add(source_id)
                        labels = list(record["p"].labels)
                        category = labels[0] if labels else '其他'
                        props = dict(record["p"])
                        name = props.get('name') or props.get('station_name') or category
                        node = {
                            "id": source_id,
                            "name": name,
                            "category": category,
                            "description": f"类型: {CATEGORY_NAMES.get(category, category)}",
                            "symbolSize": _get_node_size(category),
                        }
                        nodes.append(node)
                        if category not in category_map:
                            category_map[category] = len(categories)
                            categories.append({
                                "name": CATEGORY_NAMES.get(category, category),
                                "itemStyle": {"color": CATEGORY_COLORS.get(category, '#909399')}
                            })
                        node['category'] = category_map[category]
                    
                    links.append({
                        "source": source_id,
                        "target": str(record["n"].id),
                        "relation": record["r2"].type,
                    })
            
            return {
                "nodes": nodes,
                "links": links,
                "categories": categories
            }
    finally:
        driver.close()


@lru_cache(maxsize=1)
def _load_station_coordinate_fallbacks():
    conn = get_mysql_conn()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT station_name, province, longitude_gcj02, latitude_gcj02, data_source
                FROM station_coordinates
            """)
            rows = cursor.fetchall()
    finally:
        conn.close()

    fallback = {}
    for row in rows:
        lon = _to_float(row.get('longitude_gcj02'))
        lat = _to_float(row.get('latitude_gcj02'))
        fallback[(row.get('station_name') or '', row.get('province') or '')] = {
            'lon': lon,
            'lat': lat,
            'source': row.get('data_source') or '',
        }
    return fallback


def _to_float(value):
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _normalize_pollutant_name(pollutant_name):
    if not pollutant_name:
        return '氨氮'
    return POLLUTANT_ALIASES.get(pollutant_name, pollutant_name)


def _parse_date(value):
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    text = str(value or '').strip()
    if not text:
        return None
    return datetime.strptime(text[:10], '%Y-%m-%d').date()


def _date_text(value):
    parsed = _parse_date(value)
    return parsed.isoformat() if parsed else ''


def _percentile(values, ratio):
    if not values:
        return None
    if len(values) == 1:
        return values[0]
    idx = (len(values) - 1) * ratio
    lower = int(math.floor(idx))
    upper = int(math.ceil(idx))
    if lower == upper:
        return values[lower]
    weight = idx - lower
    return values[lower] * (1 - weight) + values[upper] * weight


@lru_cache(maxsize=256)
def _get_historical_baseline(province, field, direction):
    conn = get_mysql_conn()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                f"""
                SELECT `{field}` AS value
                FROM fact_water_quality_history
                WHERE region_name = %s
                  AND `{field}` IS NOT NULL
                ORDER BY `{field}`
                """,
                (province,),
            )
            values = [float(row['value']) for row in cursor.fetchall() if row.get('value') is not None]
    finally:
        conn.close()

    if not values:
        return {'reference': None, 'median': None, 'note': '缺少历史基线'}

    median = _percentile(values, 0.5)
    if direction == 'low':
        reference = _percentile(values, 0.1)
        note = '该省历史P10基线'
    else:
        reference = _percentile(values, 0.9)
        note = '该省历史P90基线'
    return {'reference': reference, 'median': median, 'note': note}


def _fetch_history_window(province, field, start_date, end_date):
    conn = get_mysql_conn()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                f"""
                SELECT DATE(monitor_time) AS monitor_date, `{field}` AS value
                FROM fact_water_quality_history
                WHERE region_name = %s
                  AND DATE(monitor_time) BETWEEN %s AND %s
                  AND `{field}` IS NOT NULL
                ORDER BY monitor_time DESC
                """,
                (province, start_date.isoformat(), end_date.isoformat()),
            )
            return cursor.fetchall()
    finally:
        conn.close()


def _downstream_index(lon, lat):
    if lon is None or lat is None:
        return None
    return lon - lat


def _haversine_km(lon1, lat1, lon2, lat2):
    if None in (lon1, lat1, lon2, lat2):
        return None
    radius = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return radius * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _score_label(score):
    if score >= 80:
        return '高'
    if score >= 60:
        return '较高'
    if score >= 40:
        return '中'
    return '低'


@lru_cache(maxsize=128)
def _province_path(river, source_province, target_province):
    if not river:
        return None
    if source_province == target_province:
        return []

    adjacency = {}
    for up_province, down_province, topo_river, distance_km, flow_days in UPSTREAM_TOPOLOGY:
        if topo_river != river:
            continue
        adjacency.setdefault(up_province, []).append({
            'next': down_province,
            'distance_km': distance_km,
            'flow_days': flow_days,
        })

    queue = [(source_province, [])]
    visited = {source_province}
    while queue:
        current, path = queue.pop(0)
        for edge in adjacency.get(current, []):
            next_province = edge['next']
            next_path = path + [{
                'source': current,
                'target': next_province,
                'distance_km': edge['distance_km'],
                'flow_days': edge['flow_days'],
            }]
            if next_province == target_province:
                return next_path
            if next_province in visited:
                continue
            visited.add(next_province)
            queue.append((next_province, next_path))
    return None


def _graph_upstream_rows(session, station_name):
    result = session.run("""
        MATCH (upstream:Station)-[r:UPSTREAM_OF]->(target:Station {name: $station_name})
        OPTIONAL MATCH (upstream)-[:ON_RIVER]->(rv:River)
        RETURN upstream.name AS name,
               upstream.province AS province,
               COALESCE(r.river, rv.name, '') AS river,
               COALESCE(r.distance_km, 0) AS distance_km,
               COALESCE(r.flow_days, 0) AS flow_days
    """, station_name=station_name)
    return [dict(row) for row in result]


def _load_station_catalog(session):
    fallback = _load_station_coordinate_fallbacks()
    result = session.run("""
        MATCH (s:Station)
        OPTIONAL MATCH (s)-[:ON_RIVER]->(rv:River)
        RETURN s.station_id AS station_id,
               s.name AS name,
               s.province AS province,
               s.city AS city,
               s.lon AS lon,
               s.lat AS lat,
               COALESCE(rv.name, '') AS river
        ORDER BY s.name
    """)
    stations = []
    for row in result:
        name = row.get('name') or ''
        province = row.get('province') or ''
        coords = fallback.get((name, province), {})
        lon = _to_float(row.get('lon'))
        lat = _to_float(row.get('lat'))
        if lon is None or lat is None:
            lon = lon if lon is not None else coords.get('lon')
            lat = lat if lat is not None else coords.get('lat')
        stations.append({
            'station_id': row.get('station_id'),
            'name': name,
            'province': province,
            'city': row.get('city') or '',
            'lon': lon,
            'lat': lat,
            'river': row.get('river') or '',
            'coord_source': coords.get('source') or ('Neo4j' if lon is not None and lat is not None else ''),
        })
    return stations


def _topology_score(explicit, hops, same_river):
    if explicit:
        return 1.0
    if hops == 0:
        return 0.72 if same_river else 0.55
    if hops == 1:
        return 0.92
    if hops == 2:
        return 0.82
    return max(0.55, 0.9 - (hops - 1) * 0.12)


def _direction_score(candidate, target, explicit, same_river):
    if explicit:
        return 0.96
    if candidate['province'] != target['province']:
        return 0.86 if same_river else 0.68
    candidate_index = _downstream_index(candidate.get('lon'), candidate.get('lat'))
    target_index = _downstream_index(target.get('lon'), target.get('lat'))
    if candidate_index is None or target_index is None:
        return 0.42
    delta = target_index - candidate_index
    if delta <= 0:
        return 0.0
    return min(1.0, 0.42 + delta * 2.4)


def _distance_score(distance_km):
    if distance_km is None:
        return 0.38
    return max(0.28, min(1.0, 1.02 - distance_km / 260.0))


def _estimate_flow_days(distance_km, topo_flow_days):
    days = topo_flow_days or 0
    if distance_km:
        days = max(days, int(round(distance_km / FLOW_SPEED_KM_PER_DAY)))
    return max(1, days or 1)


def _build_candidate_record(candidate, target, explicit_map):
    key = (candidate['name'], candidate['province'])
    explicit = explicit_map.get(key)
    river = explicit['river'] if explicit and explicit.get('river') else candidate.get('river') or target.get('river') or ''
    same_river = river and target.get('river') and river == target.get('river')
    province_path = [] if candidate['province'] == target['province'] else _province_path(river, candidate['province'], target['province'])
    if explicit:
        province_hops = 1
        topo_distance = _to_float(explicit.get('distance_km'))
        topo_flow_days = int(_to_float(explicit.get('flow_days')) or 0)
        mode = '图谱链路'
    else:
        if candidate['province'] == target['province']:
            candidate_index = _downstream_index(candidate.get('lon'), candidate.get('lat'))
            target_index = _downstream_index(target.get('lon'), target.get('lat'))
            if not same_river or candidate_index is None or target_index is None or candidate_index >= target_index - SAME_PROVINCE_DIRECTION_GAP:
                return None
            province_hops = 0
            topo_distance = None
            topo_flow_days = 0
            mode = '同河道坐标推断'
        else:
            if province_path is None:
                return None
            province_hops = len(province_path)
            topo_distance = sum(item['distance_km'] for item in province_path)
            topo_flow_days = sum(item['flow_days'] for item in province_path)
            mode = '跨省拓扑推断'

    straight_distance = _haversine_km(
        candidate.get('lon'), candidate.get('lat'),
        target.get('lon'), target.get('lat'),
    )
    distance_km = topo_distance or straight_distance
    flow_days = _estimate_flow_days(distance_km, topo_flow_days)
    topology_score = _topology_score(bool(explicit), province_hops, same_river)
    direction_score = _direction_score(candidate, target, bool(explicit), same_river)
    distance_score = _distance_score(distance_km)
    base_score = 0.44 * topology_score + 0.24 * direction_score + 0.32 * distance_score

    return {
        'station': candidate['name'],
        'province': candidate['province'],
        'river': river,
        'distance_km': round(distance_km, 1) if distance_km is not None else None,
        'flow_days': flow_days,
        'path_score_raw': base_score,
        'path_score': round(base_score * 100, 1),
        'path_confidence': _score_label(base_score * 100),
        'topology_mode': mode,
        'coord_source': candidate.get('coord_source') or '',
        'path_preview': f"{candidate['name']} → {target['name']}",
        'explicit': bool(explicit),
        'province_hops': province_hops,
    }


def _infer_upstream_candidates(session, station_name, limit=MAX_TRACE_CANDIDATES):
    stations = _load_station_catalog(session)
    target = next((item for item in stations if item['name'] == station_name), None)
    if not target:
        return None, []

    graph_rows = _graph_upstream_rows(session, station_name)
    explicit_map = {(row['name'], row['province']): row for row in graph_rows}
    candidate_rivers = {target.get('river') or ''}
    candidate_rivers.update(row.get('river') or '' for row in graph_rows)
    candidate_rivers.discard('')

    candidates = []
    for station in stations:
        if station['name'] == target['name'] and station['province'] == target['province']:
            continue
        if candidate_rivers and station.get('river') and station.get('river') not in candidate_rivers and (station['name'], station['province']) not in explicit_map:
            continue
        record = _build_candidate_record(station, target, explicit_map)
        if record is None:
            continue
        candidates.append(record)

    candidates.sort(
        key=lambda item: (
            0 if item['explicit'] else 1,
            -item['path_score_raw'],
            item['distance_km'] if item['distance_km'] is not None else 10 ** 6,
            item['station'],
        )
    )
    return target, candidates[:limit]


def _risk_ratio(value, meta, baseline):
    direction = meta.get('direction')
    limit = meta.get('limit')
    reference = None
    reference_note = None

    if direction == 'high':
        reference = limit if limit is not None else baseline.get('reference')
        reference_note = 'GB 3838-2002 III类限值' if limit is not None else baseline.get('note')
        ratio = value / reference if reference else 0
        evidence_type = '标准超限' if limit is not None else '历史异常'
        return ratio, reference, reference_note, evidence_type

    if direction == 'low':
        reference = limit if limit is not None else baseline.get('reference')
        reference_note = 'GB 3838-2002 III类限值' if limit is not None else baseline.get('note')
        ratio = reference / value if reference and value else 0
        evidence_type = '标准偏低' if limit is not None else '历史偏低'
        return ratio, reference, reference_note, evidence_type

    if direction == 'range':
        min_value = meta.get('min')
        max_value = meta.get('max')
        if min_value is not None and value < min_value:
            ratio = min_value / value if value else 0
            return ratio, min_value, 'GB 3838-2002 III类下限', '范围偏离'
        if max_value is not None and value > max_value:
            ratio = value / max_value if max_value else 0
            return ratio, max_value, 'GB 3838-2002 III类上限', '范围偏离'
        median = baseline.get('median')
        if median:
            ratio = 0.8 + abs(value - median) / max(abs(median), 1e-6)
        else:
            ratio = 0.8
        return ratio, median, baseline.get('note'), '波动偏离'

    reference = baseline.get('reference')
    ratio = value / reference if reference else 0
    return ratio, reference, baseline.get('note'), '历史异常'


def _pick_evidence_for_candidate(candidate, pollutant_name, target_date):
    canonical_name = _normalize_pollutant_name(pollutant_name)
    meta = POLLUTANT_META.get(canonical_name)
    if not meta:
        return {
            'pollutant': canonical_name,
            'evidence_date': '',
            'evidence_value': None,
            'reference_value': None,
            'ratio': None,
            'evidence_type': '未配置指标规则',
            'evidence_score_raw': 0.12,
            'evidence_score': 12.0,
            'value': None,
            'limit': None,
        }

    expected_gap = max(1, int(candidate.get('flow_days') or 1))
    window_days = max(DEFAULT_TRACE_WINDOW_DAYS, expected_gap + 2)
    start_date = target_date - timedelta(days=window_days)
    rows = _fetch_history_window(candidate['province'], meta['field'], start_date, target_date)
    baseline = _get_historical_baseline(candidate['province'], meta['field'], meta.get('direction', 'high'))

    best = None
    for row in rows:
        value = _to_float(row.get('value'))
        if value is None:
            continue
        risk_ratio, reference_value, reference_note, evidence_type = _risk_ratio(value, meta, baseline)
        monitor_date = _parse_date(row.get('monitor_date'))
        if not monitor_date:
            continue
        day_gap = (target_date - monitor_date).days
        timing_score = 1.0 - min(1.0, abs(day_gap - expected_gap) / max(expected_gap + 2, 3))
        risk_score = min(1.0, max(0.0, (risk_ratio - 0.82) / 0.68))
        combined_score = 0.52 * risk_score + 0.48 * timing_score
        candidate_evidence = {
            'pollutant': canonical_name,
            'evidence_date': monitor_date.isoformat(),
            'evidence_value': round(value, 4),
            'reference_value': round(reference_value, 4) if reference_value is not None else None,
            'ratio': round(risk_ratio, 3),
            'evidence_type': evidence_type,
            'evidence_note': reference_note,
            'evidence_score_raw': combined_score,
            'evidence_score': round(combined_score * 100, 1),
            'value': round(value, 4),
            'limit': round(reference_value, 4) if reference_value is not None else None,
        }
        if best is None or candidate_evidence['evidence_score_raw'] > best['evidence_score_raw']:
            best = candidate_evidence

    if best:
        return best

    return {
        'pollutant': canonical_name,
        'evidence_date': '',
        'evidence_value': None,
        'reference_value': baseline.get('reference'),
        'ratio': None,
        'evidence_type': '时间窗内未发现明显异常',
        'evidence_note': baseline.get('note'),
        'evidence_score_raw': 0.15,
        'evidence_score': 15.0,
        'value': None,
        'limit': round(baseline['reference'], 4) if baseline.get('reference') is not None else None,
    }


def _compose_trace_result(target, candidates, pollutant_name, trace_date):
    if not target:
        return {
            'target_station': '',
            'pollutant': _normalize_pollutant_name(pollutant_name),
            'date': trace_date,
            'summary': '未找到目标站点。',
            'source_candidates': [],
            'upstream_exceedances': [],
            'upstream_paths': [],
            'trace_mode': 'candidate-hydrology-v1',
        }

    analysis_date = _parse_date(trace_date)
    if not analysis_date:
        raise ValueError('日期格式错误，应为 YYYY-MM-DD')

    ranked = []
    for item in candidates:
        evidence = _pick_evidence_for_candidate(item, pollutant_name, analysis_date)
        total_score_raw = 0.58 * item['path_score_raw'] + 0.42 * evidence['evidence_score_raw']
        total_score = round(total_score_raw * 100, 1)
        merged = dict(item)
        merged.update(evidence)
        merged['source_score_raw'] = total_score_raw
        merged['source_score'] = total_score
        merged['confidence'] = _score_label(total_score)
        ranked.append(merged)

    ranked.sort(
        key=lambda item: (
            -item['source_score_raw'],
            -(item.get('ratio') or 0),
            item['distance_km'] if item['distance_km'] is not None else 10 ** 6,
            item['station'],
        )
    )
    ranked = ranked[:MAX_TRACE_CANDIDATES]

    upstream_paths = []
    for item in ranked:
        upstream_paths.append({
            'nodes': [
                {'name': item['station'], 'province': item['province']},
                {'name': target['name'], 'province': target['province']},
            ],
            'relationships': [{
                'distance': item['distance_km'],
                'flow_days': item['flow_days'],
                'river': item['river'],
                'mode': item['topology_mode'],
                'confidence': item['confidence'],
            }],
        })

    strong_candidates = [item for item in ranked if item['source_score'] >= 60]
    summary = f"识别到 {len(ranked)} 个上游风险站点，其中 {len(strong_candidates)} 个风险较高。"

    return {
        'target_station': target['name'],
        'target_province': target['province'],
        'target_river': target.get('river') or '',
        'pollutant': _normalize_pollutant_name(pollutant_name),
        'date': analysis_date.isoformat(),
        'summary': summary,
        'trace_mode': 'candidate-hydrology-v1',
        'source_candidates': ranked,
        'upstream_exceedances': ranked,
        'upstream_paths': upstream_paths,
        'candidate_count': len(ranked),
    }


def trace_pollution_source(station_name, pollutant_name, date):
    """
    污染溯源查询：
    基于图谱链路、同河道坐标关系和分省历史时间窗，
    输出疑似污染源候选及其证据评分。
    """
    driver = get_neo4j_driver()
    try:
        with get_neo4j_session(driver) as session:
            target, candidates = _infer_upstream_candidates(session, station_name, limit=MAX_TRACE_CANDIDATES)
            return _compose_trace_result(target, candidates, pollutant_name, date)
    finally:
        driver.close()


def get_upstream_stations(station_name):
    """获取某站点的直接上游或高置信候选上游站点"""
    driver = get_neo4j_driver()
    try:
        with get_neo4j_session(driver) as session:
            _target, candidates = _infer_upstream_candidates(session, station_name, limit=MAX_UPSTREAM_CANDIDATES)
            return [
                {
                    'name': item['station'],
                    'province': item['province'],
                    'distance_km': item['distance_km'],
                    'flow_days': item['flow_days'],
                    'river': item['river'],
                    'confidence': item['path_confidence'],
                    'path_score': item['path_score'],
                    'mode': item['topology_mode'],
                }
                for item in candidates
            ]
    finally:
        driver.close()


def get_exceedance_events(province, start_date, end_date):
    """查询某省份在日期范围内的超标事件"""
    driver = get_neo4j_driver()
    try:
        with get_neo4j_session(driver) as session:
            result = session.run("""
                MATCH (s:Station {province: $province})-[e:EXCEEDS]->(p:Pollutant)
                WHERE e.date >= $start_date AND e.date <= $end_date
                RETURN e.date AS date, s.name AS station, p.name AS pollutant,
                       e.val AS value, e.limit AS limit_val, e.ratio AS ratio,
                       COALESCE(e.basis, 'standard') AS basis
                ORDER BY e.date DESC, e.ratio DESC
                LIMIT 200
            """, province=province, start_date=start_date, end_date=end_date)
            
            records = []
            for row in result:
                records.append({
                    "date": row["date"],
                    "station": row["station"],
                    "pollutant": row["pollutant"],
                    "value": row["value"],
                    "limit": row["limit_val"],
                    "ratio": row["ratio"],
                    "basis": row["basis"],
                })
            return records
    finally:
        driver.close()


def get_station_details(station_name):
    """获取站点详细信息"""
    driver = get_neo4j_driver()
    try:
        with get_neo4j_session(driver) as session:
            result = session.run("""
                MATCH (s:Station {name: $station_name})
                OPTIONAL MATCH (s)-[:BELONGS_TO]->(r:Region)
                OPTIONAL MATCH (s)-[:ON_RIVER]->(rv:River)
                OPTIONAL MATCH (s)-[e:EXCEEDS]->(p:Pollutant)
                WITH s, r, rv, e, p
                ORDER BY e.date DESC
                RETURN s, r.name AS region, rv.name AS river,
                       collect(DISTINCT {pollutant: p.name, date: e.date, value: e.val, ratio: e.ratio, basis: COALESCE(e.basis, 'standard')})[0..5] AS recent_exceeds
            """, station_name=station_name)
            
            row = result.single()
            if not row:
                return None
            
            s = dict(row["s"])
            return {
                "station_id": s.get("station_id"),
                "name": s.get("name"),
                "province": s.get("province"),
                "city": s.get("city"),
                "lon": s.get("lon"),
                "lat": s.get("lat"),
                "type": s.get("type"),
                "region": row["region"],
                "river": row["river"],
                "recent_exceedances": row["recent_exceeds"],
            }
    finally:
        driver.close()


def get_water_level_distribution(date):
    """获取某日期流域水质等级分布"""
    driver = get_neo4j_driver()
    try:
        with get_neo4j_session(driver) as session:
            result = session.run("""
                MATCH (s:Station)-[h:HAS_LEVEL]->(w:WaterLevel)
                WHERE h.date = $date
                WITH w.name AS level, w.color AS color, w.level AS lvl, count(s) AS station_count
                RETURN level, color, station_count
                ORDER BY lvl
            """, date=date)
            
            records = []
            for row in result:
                records.append({
                    "level": row["level"],
                    "color": row["color"],
                    "count": row["station_count"],
                })
            return records
    finally:
        driver.close()
