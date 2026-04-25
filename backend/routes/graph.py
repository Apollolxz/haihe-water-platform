# -*- coding: utf-8 -*-
"""
知识图谱相关的API路由
提供海河流域水质知识图谱的查询接口
"""

from flask import Blueprint, request, jsonify
from utils.neo4j_helper import (
    get_graph_data, search_graph, trace_pollution_source,
    get_upstream_stations, get_exceedance_events,
    get_station_details, get_water_level_distribution
)

# 创建蓝图
graph_bp = Blueprint('graph', __name__)


@graph_bp.route('/', methods=['GET'])
def get_graph():
    """
    获取知识图谱全量数据
    地址: GET /api/graph
    返回: 节点、关系和类别数据
    """
    try:
        data = get_graph_data()
        return jsonify({
            "success": True,
            "data": data
        }), 200
    except Exception as e:
        import traceback
        print(f"[ERROR] get_graph: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@graph_bp.route('/search', methods=['GET'])
def search_graph_endpoint():
    """
    搜索知识图谱
    地址: GET /api/graph/search?q=关键词
    返回: 匹配的节点和关系数据
    """
    try:
        keyword = request.args.get('q', '')
        if not keyword:
            return jsonify({"success": False, "error": "缺少搜索关键词"}), 400
        
        data = search_graph(keyword)
        return jsonify({
            "success": True,
            "data": data
        }), 200
    except Exception as e:
        import traceback
        print(f"[ERROR] search_graph: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@graph_bp.route('/stats', methods=['GET'])
def get_graph_stats():
    """
    获取知识图谱统计数据
    地址: GET /api/graph/stats
    返回: 节点、关系和类别的统计数据
    """
    try:
        data = get_graph_data()
        stats = {
            "nodeCount": len(data['nodes']),
            "linkCount": len(data['links']),
            "categoryCount": len(data['categories']),
            "categories": [c['name'] for c in data['categories']]
        }
        return jsonify({
            "success": True,
            "data": stats
        }), 200
    except Exception as e:
        import traceback
        print(f"[ERROR] get_graph_stats: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@graph_bp.route('/trace', methods=['GET'])
def trace_pollution():
    """
    污染溯源查询
    地址: GET /api/graph/trace?station=站点名&pollutant=污染物名&date=日期
    返回: 上游超标站点列表和路径
    """
    try:
        station_name = request.args.get('station', '')
        pollutant_name = request.args.get('pollutant', '氨氮')
        date = request.args.get('date', '')
        
        if not station_name:
            return jsonify({"success": False, "error": "缺少站点名称参数"}), 400
        if not date:
            return jsonify({"success": False, "error": "缺少日期参数"}), 400
        
        data = trace_pollution_source(station_name, pollutant_name, date)
        return jsonify({
            "success": True,
            "data": data
        }), 200
    except Exception as e:
        import traceback
        print(f"[ERROR] trace_pollution: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@graph_bp.route('/upstream', methods=['GET'])
def upstream_stations():
    """
    获取某站点的直接上游站点
    地址: GET /api/graph/upstream?station=站点名
    返回: 上游站点列表
    """
    try:
        station_name = request.args.get('station', '')
        if not station_name:
            return jsonify({"success": False, "error": "缺少站点名称参数"}), 400
        
        data = get_upstream_stations(station_name)
        return jsonify({
            "success": True,
            "data": data
        }), 200
    except Exception as e:
        import traceback
        print(f"[ERROR] upstream_stations: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@graph_bp.route('/exceedance', methods=['GET'])
def exceedance_events():
    """
    查询超标事件
    地址: GET /api/graph/exceedance?province=省份&start=开始日期&end=结束日期
    返回: 超标事件列表
    """
    try:
        province = request.args.get('province', '')
        start_date = request.args.get('start', '')
        end_date = request.args.get('end', '')
        
        if not province:
            return jsonify({"success": False, "error": "缺少省份参数"}), 400
        if not start_date or not end_date:
            return jsonify({"success": False, "error": "缺少日期范围参数"}), 400
        
        data = get_exceedance_events(province, start_date, end_date)
        return jsonify({
            "success": True,
            "data": data
        }), 200
    except Exception as e:
        import traceback
        print(f"[ERROR] exceedance_events: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@graph_bp.route('/station', methods=['GET'])
def station_details():
    """
    获取站点详情
    地址: GET /api/graph/station?name=站点名
    返回: 站点详细信息
    """
    try:
        station_name = request.args.get('name', '')
        if not station_name:
            return jsonify({"success": False, "error": "缺少站点名称参数"}), 400
        
        data = get_station_details(station_name)
        if not data:
            return jsonify({"success": False, "error": "站点不存在"}), 404
        
        return jsonify({
            "success": True,
            "data": data
        }), 200
    except Exception as e:
        import traceback
        print(f"[ERROR] station_details: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@graph_bp.route('/water-level-distribution', methods=['GET'])
def water_level_distribution():
    """
    获取某日期流域水质等级分布
    地址: GET /api/graph/water-level-distribution?date=日期
    返回: 各等级站点数量
    """
    try:
        date = request.args.get('date', '')
        if not date:
            return jsonify({"success": False, "error": "缺少日期参数"}), 400
        
        data = get_water_level_distribution(date)
        return jsonify({
            "success": True,
            "data": data
        }), 200
    except Exception as e:
        import traceback
        print(f"[ERROR] water_level_distribution: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500
