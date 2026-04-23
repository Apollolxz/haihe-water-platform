"""
水质数据相关的API路由
"""

from flask import Blueprint, request, jsonify
from models.water_quality import WaterQuality
from utils.token_helper import verify_token
import functools

# 创建蓝图
water_quality_bp = Blueprint('water_quality', __name__)

def auth_required(func):
    """
    认证装饰器
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        # 从请求头获取token
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"success": False, "error": "缺少Authorization头"}), 401
        
        # 提取token
        token = auth_header.split(' ')[1] if len(auth_header.split(' ')) > 1 else auth_header
        
        # 验证token
        payload = verify_token(token)
        if not payload:
            return jsonify({"success": False, "error": "无效的token"}), 401
        
        return func(*args, **kwargs)
    return wrapper

@water_quality_bp.route('/stations', methods=['GET'])
def get_stations():
    """
    获取站点列表API
    地址: GET /api/water-quality/stations
    查询参数: location - 可选，按地区筛选
    返回: 站点列表
    """
    try:
        # 获取查询参数
        location = request.args.get('location')
        
        # 获取站点列表
        stations = WaterQuality.get_stations(location)
        
        return jsonify({
            "success": True,
            "data": stations
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@water_quality_bp.route('/latest', methods=['GET'])
def get_latest_data():
    """
    获取最新水质数据API
    地址: GET /api/water-quality/latest
    查询参数: station_id - 可选，按站点ID筛选
    返回: 最新水质数据
    """
    try:
        # 获取查询参数
        station_id = request.args.get('station_id')
        
        # 获取最新水质数据
        data = WaterQuality.get_latest_data(station_id)
        
        return jsonify({
            "success": True,
            "data": data
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@water_quality_bp.route('/historical', methods=['GET'])
def get_historical_data():
    """
    获取历史水质数据API
    地址: GET /api/water-quality/historical
    查询参数: station_id - 必需，站点ID; days - 可选，天数，默认7天
    返回: 历史水质数据
    """
    try:
        # 获取查询参数
        station_id = request.args.get('station_id')
        days = request.args.get('days', 7, type=int)
        
        if not station_id:
            return jsonify({"success": False, "error": "缺少station_id参数"}), 400
        
        # 获取历史水质数据
        data = WaterQuality.get_historical_data(station_id, days)
        
        return jsonify({
            "success": True,
            "data": data
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@water_quality_bp.route('/tianjin', methods=['GET'])
def get_tianjin_data():
    """
    获取天津水质数据API
    地址: GET /api/water-quality/tianjin
    返回: 天津地区的水质数据
    """
    try:
        # 获取天津地区的站点
        stations = WaterQuality.get_stations('天津市')
        
        # 获取每个站点的最新水质数据
        data = WaterQuality.get_latest_data()
        
        # 过滤天津地区的数据
        tianjin_data = [item for item in data if item['location'] == '天津市']
        
        return jsonify({
            "success": True,
            "data": tianjin_data
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@water_quality_bp.route('/sync', methods=['POST'])
def sync_data():
    """
    同步水质数据API
    地址: POST /api/water-quality/sync
    返回: 同步结果
    """
    try:
        from utils.data_generator import DataGenerator
        
        # 初始化数据生成器
        generator = DataGenerator()
        
        # 生成天津水质数据（基于国家标准）
        parsed_data = generator.generate_all_data()
        
        # 保存数据到数据库
        synced_count = 0
        for station_data, water_quality_data in parsed_data:
            WaterQuality.sync_from_api(station_data, water_quality_data)
            synced_count += 1
        
        return jsonify({
            "success": True,
            "message": f"成功同步 {synced_count} 条数据",
            "count": synced_count,
            "data_source": "基于国家水质标准生成的模拟数据"
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@water_quality_bp.route('/quarterly', methods=['GET'])
def get_quarterly_data():
    """
    获取季度水质类别比例数据API
    地址: GET /api/water-quality/quarterly
    查询参数: year - 可选，年份，默认2025
    返回: 季度水质类别比例数据
    """
    try:
        # 获取查询参数
        year = request.args.get('year', 2025, type=int)
        
        # 获取季度水质数据
        data = WaterQuality.get_quarterly_data(year)
        
        return jsonify({
            "success": True,
            "data": data
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@water_quality_bp.route('/district', methods=['GET'])
def get_district_data():
    """
    获取各区水质排名数据API
    地址: GET /api/water-quality/district
    查询参数: year - 可选，年份，默认2025
    返回: 各区水质排名数据
    """
    try:
        # 获取查询参数
        year = request.args.get('year', 2025, type=int)
        
        # 获取各区水质数据
        data = WaterQuality.get_district_data(year)
        
        return jsonify({
            "success": True,
            "data": data
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@water_quality_bp.route('/pollutants', methods=['GET'])
def get_pollutants_data():
    """
    获取主要污染指标数据API
    地址: GET /api/water-quality/pollutants
    查询参数: year - 可选，年份，默认2025
    返回: 主要污染指标数据
    """
    try:
        # 获取查询参数
        year = request.args.get('year', 2025, type=int)
        
        # 获取主要污染指标数据
        data = WaterQuality.get_pollutants_data(year)
        
        return jsonify({
            "success": True,
            "data": data
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500