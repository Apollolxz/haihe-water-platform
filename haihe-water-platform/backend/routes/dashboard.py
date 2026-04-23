"""
数据大屏API路由
提供大屏所需的图表数据接口
"""

from flask import Blueprint, request, jsonify, send_file
import pymysql
import os
import math
import numpy as np
from models.water_quality import WaterQuality
from utils.sandbox_data import get_sandbox_summary, generate_risk_report, get_model_comparison_metrics
from utils.dashboard_screen import get_screen_overview_data
from utils.sandbox_validation import (
    get_validation_overview,
    get_export_preview,
    get_grid_image_path,
    get_feature_importance_path,
    get_export_file_path,
)

# 创建蓝图
dashboard_bp = Blueprint('dashboard', __name__)

def get_db():
    """获取数据库连接"""
    return WaterQuality.get_db()


@dashboard_bp.route('/screen-overview', methods=['GET'])
def get_screen_overview():
    """
    首页大屏聚合接口
    统一返回地图、指标卡、排行、模型评估、趋势等数据，全部来源于 MySQL。
    """
    try:
        province = request.args.get('province', 'all')
        data = get_screen_overview_data(province)
        return jsonify({"success": True, "data": data}), 200
    except Exception as e:
        import traceback
        print(f"[ERROR] screen-overview error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500


@dashboard_bp.route('/validation-overview', methods=['GET'])
def get_validation_overview_route():
    """
    微观预测与多维对比验证页面聚合接口
    """
    try:
        provinces = request.args.get('provinces', 'all')
        indicator = request.args.get('indicator', 'ammonia_nitrogen')
        time_mode = request.args.get('time_mode', 'history')
        model_mode = request.args.get('model_mode', 'COMPARE')
        radar_province = request.args.get('radar_province')
        days = request.args.get('days', 90, type=int)
        data = get_validation_overview(provinces, indicator, time_mode, model_mode, radar_province, days)
        return jsonify({"success": True, "data": data}), 200
    except Exception as e:
        import traceback
        print(f"[ERROR] validation-overview error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500


@dashboard_bp.route('/validation-export-preview', methods=['GET'])
def get_validation_export_preview():
    """
    预测结果 Excel 预览
    """
    try:
        province = request.args.get('province', '河北省')
        model_type = request.args.get('model_type', 'ARIMA')
        limit = request.args.get('limit', 12, type=int)
        data = get_export_preview(province, model_type, limit)
        return jsonify({"success": True, "data": data}), 200
    except Exception as e:
        import traceback
        print(f"[ERROR] validation-export-preview error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500


@dashboard_bp.route('/validation-export-file', methods=['GET'])
def download_validation_export_file():
    """
    下载预测结果 Excel 文件
    """
    try:
        province = request.args.get('province', '河北省')
        model_type = request.args.get('model_type', 'ARIMA')
        path = get_export_file_path(province, model_type)
        if not os.path.isfile(path):
            return jsonify({"success": False, "error": "文件不存在"}), 404
        return send_file(path, as_attachment=True, download_name=os.path.basename(path))
    except Exception as e:
        import traceback
        print(f"[ERROR] validation-export-file error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500


@dashboard_bp.route('/validation-asset', methods=['GET'])
def get_validation_asset():
    """
    代理本地成果图片资源
    kind=grid|feature
    """
    try:
        kind = request.args.get('kind', 'grid')
        if kind == 'feature':
            province = request.args.get('province', '河北省')
            path = get_feature_importance_path(province)
        else:
            indicator = request.args.get('indicator', '氨氮')
            path = get_grid_image_path(indicator)

        if not os.path.isfile(path):
            return jsonify({"success": False, "error": "资源不存在"}), 404
        return send_file(path, mimetype='image/png')
    except Exception as e:
        import traceback
        print(f"[ERROR] validation-asset error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500

@dashboard_bp.route('/correlation-heatmap', methods=['GET'])
def get_correlation_heatmap():
    """
    获取水质指标相关性热力图数据
    指标: 水温、PH、溶解氧、电导率、浊度、高锰酸盐指数、氨氮、总磷、总氮
    返回相关性矩阵、关键相关性分析和模型特征建议
    """
    try:
        indicators = ['水温', 'PH', '溶解氧', '电导率', '浊度', '高锰酸盐指数', '氨氮', '总磷', '总氮']
        keys = ['water_temp', 'ph', 'dissolved_oxygen', 'conductivity', 'turbidity',
                'permanganate_index', 'ammonia_nitrogen', 'total_phosphorus', 'total_nitrogen']

        def safe_float(value):
            if value is None:
                return None
            try:
                return float(value)
            except (TypeError, ValueError):
                return None

        def make_pair_key(name1, name2):
            return ' | '.join(sorted([name1, name2]))

        def calc_pearson(xs, ys):
            count = len(xs)
            if count < 2:
                return None

            mean_x = sum(xs) / count
            mean_y = sum(ys) / count
            diff_x = [x - mean_x for x in xs]
            diff_y = [y - mean_y for y in ys]
            denom_x = math.sqrt(sum(value * value for value in diff_x))
            denom_y = math.sqrt(sum(value * value for value in diff_y))
            if denom_x == 0 or denom_y == 0:
                return None

            numerator = sum(diff_x[idx] * diff_y[idx] for idx in range(count))
            return numerator / (denom_x * denom_y)

        def build_scatter_samples(xs, ys, max_points=80):
            if not xs or not ys:
                return []
            if len(xs) <= max_points:
                indices = range(len(xs))
            else:
                indices = []
                step = (len(xs) - 1) / (max_points - 1)
                for idx in range(max_points):
                    indices.append(round(idx * step))

            return [[round(xs[idx], 4), round(ys[idx], 4)] for idx in indices]

        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT water_temp, ph, dissolved_oxygen, conductivity, turbidity,
                       permanganate_index, ammonia_nitrogen, total_phosphorus, total_nitrogen
                FROM water_quality_raw
                WHERE water_temp IS NOT NULL
                   OR ph IS NOT NULL
                   OR dissolved_oxygen IS NOT NULL
                   OR conductivity IS NOT NULL
                   OR turbidity IS NOT NULL
                   OR permanganate_index IS NOT NULL
                   OR ammonia_nitrogen IS NOT NULL
                   OR total_phosphorus IS NOT NULL
                   OR total_nitrogen IS NOT NULL
                LIMIT 8000
            """)
            data = cursor.fetchall()

            heatmap_data = []
            pair_sample_counts = {}
            scatter_samples = {}
            strong_correlations = []
            avg_abs_scores = {name: [] for name in indicators}

            for i in range(len(indicators)):
                for j in range(len(indicators)):
                    values_x = []
                    values_y = []
                    for row in data:
                        x_value = safe_float(row[keys[i]])
                        y_value = safe_float(row[keys[j]])
                        if x_value is None or y_value is None:
                            continue
                        values_x.append(x_value)
                        values_y.append(y_value)

                    if i == j:
                        if values_x:
                            heatmap_data.append([i, j, 1.0])
                        continue

                    pair_key = make_pair_key(indicators[i], indicators[j])
                    sample_count = len(values_x)
                    pair_sample_counts[pair_key] = sample_count

                    corr_val = calc_pearson(values_x, values_y)
                    if corr_val is None:
                        continue

                    corr_val = round(float(corr_val), 3)
                    heatmap_data.append([i, j, corr_val])

                    if j > i:
                        avg_abs_scores[indicators[i]].append(abs(corr_val))
                        avg_abs_scores[indicators[j]].append(abs(corr_val))
                        scatter_samples[pair_key] = build_scatter_samples(values_x, values_y)

                    if j > i and abs(corr_val) >= 0.5:
                        strong_correlations.append({
                            'indicator1': indicators[i],
                            'indicator2': indicators[j],
                            'correlation': corr_val,
                            'sample_count': sample_count
                        })

            sorted_corr = sorted(strong_correlations, key=lambda item: abs(item['correlation']), reverse=True)

            indicator_strength = []
            for name in indicators:
                scores = avg_abs_scores.get(name, [])
                avg_score = round(sum(scores) / len(scores), 3) if scores else 0
                indicator_strength.append((name, avg_score))
            indicator_strength.sort(key=lambda item: item[1], reverse=True)

            core_features = [name for name, _ in indicator_strength[:3]]
            candidate_features = ['氨氮', '总磷', '总氮', '高锰酸盐指数', '电导率', '浊度']
            pollution_features = [name for name, _ in indicator_strength if name in candidate_features][:3]
            remaining_features = [
                name for name, _ in indicator_strength
                if name not in core_features and name not in pollution_features
            ]
            auxiliary_features = remaining_features[:2]

            redundant_pairs = []
            for item in sorted_corr:
                if item['correlation'] <= 0:
                    continue
                redundant_pairs.append({
                    'keep': item['indicator1'],
                    'remove': item['indicator2'],
                    'reason': f"真实样本相关系数为 {item['correlation']}，建议结合业务场景评估是否保留双指标监测"
                })
                if len(redundant_pairs) >= 2:
                    break

            feature_recommendations = {
                'core_features': core_features,
                'pollution_features': pollution_features,
                'auxiliary_features': auxiliary_features,
                'redundant_pairs': redundant_pairs
            }

            control_pairs = sorted_corr[:3]
            if not control_pairs:
                unique_pairs = []
                seen_pairs = set()
                for i, j, corr_val in heatmap_data:
                    if i >= j:
                        continue
                    pair_key = make_pair_key(indicators[i], indicators[j])
                    if pair_key in seen_pairs:
                        continue
                    seen_pairs.add(pair_key)
                    unique_pairs.append({
                        'indicator1': indicators[i],
                        'indicator2': indicators[j],
                        'correlation': corr_val,
                        'sample_count': pair_sample_counts.get(pair_key, 0)
                    })
                unique_pairs.sort(key=lambda item: abs(item['correlation']), reverse=True)
                control_pairs = unique_pairs[:3]

            pollution_control = {}
            for idx, item in enumerate(control_pairs, start=1):
                relation = '正相关' if item['correlation'] > 0 else '负相关'
                pollution_control[f'relation_{idx}'] = {
                    'title': f'重点联动关系{idx}',
                    'indicators': [item['indicator1'], item['indicator2']],
                    'correlation': item['correlation'],
                    'sample_count': item['sample_count'],
                    'suggestion': f"{item['indicator1']} 与 {item['indicator2']} 在真实样本中呈{relation}，建议联动监测并持续复核源头变化"
                }

            message = None
            if not data:
                message = "数据库中暂无可用于相关性分析的样本"
            elif not heatmap_data:
                message = "真实样本不足，暂无法计算有效相关系数"

            return jsonify({
                "success": True,
                "data": {
                    "indicators": indicators,
                    "values": heatmap_data,
                    "key_correlations": sorted_corr[:3],
                    "strong_correlations": strong_correlations,
                    "feature_recommendations": feature_recommendations,
                    "pollution_control": pollution_control,
                    "pair_sample_counts": pair_sample_counts,
                    "scatter_samples": scatter_samples,
                    "record_count": len(data),
                    "message": message
                }
            }), 200
            
    except Exception as e:
        import traceback
        print(f"[ERROR] Correlation heatmap error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        if 'conn' in locals():
            conn.close()


@dashboard_bp.route('/sandbox-data', methods=['GET'])
def get_sandbox_data():
    """
    流域时空推演沙盘数据
    返回6省市预测数据的时空推演数据（含风险等级、趋势、地图坐标）
    参数: model_type (ARIMA|LSTM, 默认ARIMA)
    """
    try:
        model_type = request.args.get('model_type', 'ARIMA')
        if model_type not in ('ARIMA', 'LSTM'):
            model_type = 'ARIMA'
        data = get_sandbox_summary(model_type=model_type)
        # 将 numpy 类型转为 Python 原生类型，以便 JSON 序列化
        for prov, info in data.get('latest', {}).items():
            for k, v in info.items():
                if hasattr(v, 'item'):
                    info[k] = v.item()
        for prov, records in data.get('time_series', {}).items():
            for r in records:
                for k, v in r.items():
                    if hasattr(v, 'item'):
                        r[k] = v.item()
        for prov, stat in data.get('stats', {}).items():
            for k, v in stat.items():
                if hasattr(v, 'item'):
                    stat[k] = v.item()
        return jsonify({"success": True, "data": data}), 200
    except Exception as e:
        import traceback
        print(f"[ERROR] sandbox-data error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500


@dashboard_bp.route('/sandbox-report', methods=['GET'])
def get_sandbox_report():
    """
    生成风险预警报告
    参数: province (可选，默认全部), date (可选), model_type (ARIMA|LSTM, 默认ARIMA)
    """
    try:
        province = request.args.get('province', '全部')
        date = request.args.get('date', '')
        model_type = request.args.get('model_type', 'ARIMA')
        if model_type not in ('ARIMA', 'LSTM'):
            model_type = 'ARIMA'
        html = generate_risk_report(province_filter=province, date_filter=date, model_type=model_type)
        return jsonify({"success": True, "data": {"html": html, "province": province, "date": date, "model_type": model_type}}), 200
    except Exception as e:
        import traceback
        print(f"[ERROR] sandbox-report error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500


@dashboard_bp.route('/model-comparison', methods=['GET'])
def get_model_comparison():
    """
    获取ARIMA与LSTM模型评估指标对比
    """
    try:
        data = get_model_comparison_metrics()
        return jsonify({"success": True, "data": data}), 200
    except Exception as e:
        import traceback
        print(f"[ERROR] model-comparison error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500

@dashboard_bp.route('/data-by-province', methods=['GET'])
def get_data_by_province():
    """
    根据省市获取数据
    用于省市筛选
    """
    try:
        province = request.args.get('province', 'all')
        date = request.args.get('date', '')
        
        conn = get_db()
        with conn.cursor() as cursor:
            # 构建查询条件
            where_clause = "WHERE 1=1"
            params = []
            
            if province != 'all':
                where_clause += " AND province = %s"
                params.append(province)
            
            if date:
                where_clause += " AND year_date = %s"
                params.append(date)
            
            # 获取统计数据
            cursor.execute(f"""
                SELECT COUNT(*) as count,
                       COUNT(DISTINCT location) as stations,
                       AVG(dissolved_oxygen) as avg_do,
                       AVG(ammonia_nitrogen) as avg_nh3,
                       AVG(ph) as avg_ph
                FROM water_quality_raw
                {where_clause}
            """, params)
            
            stats = cursor.fetchone()
            
            # 获取箱线图数据
            cursor.execute(f"""
                SELECT dissolved_oxygen, ammonia_nitrogen, total_phosphorus,
                       permanganate_index, ph
                FROM water_quality_raw
                {where_clause}
            """, params)
            
            boxplot_data = cursor.fetchall()
            
            # 获取地图数据（如果是特定省份）
            map_data = []
            if province != 'all':
                # 使用原有的地图数据逻辑，但筛选特定省份
                cursor.execute("""
                    SELECT station_name, province, longitude_gcj02, latitude_gcj02
                    FROM station_coordinates
                    WHERE province = %s AND longitude_gcj02 IS NOT NULL
                """, [province])
                coords = cursor.fetchall()
                
                # 获取该省份的水质数据（按省份聚合）
                cursor.execute("""
                    SELECT province,
                           AVG(dissolved_oxygen) as avg_do,
                           AVG(ammonia_nitrogen) as avg_nh3,
                           AVG(ph) as avg_ph,
                           COUNT(*) as sample_count
                    FROM water_quality_raw
                    WHERE province = %s
                    GROUP BY province
                """, [province])
                qual = cursor.fetchone()
                
                # 合并数据：该省份所有站点使用省份平均值
                if qual:
                    do = float(qual['avg_do']) if qual['avg_do'] else 0
                    nh3 = float(qual['avg_nh3']) if qual['avg_nh3'] else 0
                    ph_val = float(qual['avg_ph']) if qual['avg_ph'] else 0
                    
                    # 计算等级
                    if do >= 7.5 and nh3 <= 0.5:
                        level, color = '优', '#22c55e'
                    elif do >= 6.0 and nh3 <= 1.0:
                        level, color = '良', '#3b82f6'
                    elif do >= 5.0 and nh3 <= 1.5:
                        level, color = '一般', '#f59e0b'
                    else:
                        level, color = '差', '#ef4444'
                    
                    for coord in coords:
                        map_data.append({
                            "name": coord['station_name'],
                            "province": province,
                            "value": [float(coord['longitude_gcj02']), float(coord['latitude_gcj02']), round(do, 2)],
                            "dissolved_oxygen": round(do, 2),
                            "ammonia_nitrogen": round(nh3, 3),
                            "ph": round(ph_val, 2),
                            "level": level,
                            "color": color,
                            "sample_count": qual['sample_count']
                        })
            
            # 获取热力图数据
            cursor.execute(f"""
                SELECT water_temp, ph, dissolved_oxygen, conductivity, turbidity,
                       permanganate_index, ammonia_nitrogen, total_phosphorus, total_nitrogen
                FROM water_quality_raw
                {where_clause}
                LIMIT 500
            """, params)
            heatmap_raw = cursor.fetchall()
            
            # 获取时序数据（用于折线图）- 获取最近5个时间点的数据
            cursor.execute("""
                SELECT DISTINCT year_date as date
                FROM water_quality_raw
                WHERE year_date IS NOT NULL
                ORDER BY date DESC
                LIMIT 5
            """)
            recent_dates = [row['date'] for row in cursor.fetchall()]
            recent_dates.reverse()  # 按时间正序
            
            line_data = None
            if len(recent_dates) > 0:
                format_dates = ','.join([f"'{d}'" for d in recent_dates])
                province_clause = ""
                province_params = []
                
                if province != 'all':
                    province_clause = "AND province = %s"
                    province_params = [province]
                
                cursor.execute(f"""
                    SELECT 
                        year_date as date,
                        AVG(dissolved_oxygen) as avg_do,
                        AVG(ph) as avg_ph,
                        AVG(ammonia_nitrogen) as avg_nh3
                    FROM water_quality_raw
                    WHERE year_date IN ({format_dates}) {province_clause}
                    GROUP BY date
                    ORDER BY date
                """, province_params)
                
                line_rows = cursor.fetchall()
                if line_rows:
                    line_data = {
                        "dates": [str(row['date']) for row in line_rows],
                        "dissolved_oxygen": [round(float(row['avg_do'] or 0), 2) for row in line_rows],
                        "ph": [round(float(row['avg_ph'] or 0), 2) for row in line_rows],
                        "ammonia_nitrogen": [round(float(row['avg_nh3'] or 0), 3) for row in line_rows]
                    }
            
            # 获取柱状图数据（全部省份模式）
            bar_data = None
            if province == 'all':
                # 如果指定了日期，查询该日期的数据；否则查询所有数据的平均值
                if date:
                    cursor.execute("""
                        SELECT province,
                               AVG(dissolved_oxygen) as avg_do,
                               AVG(ammonia_nitrogen) as avg_nh3,
                               AVG(total_phosphorus) as avg_tp
                        FROM water_quality_raw
                        WHERE province IN ('北京市', '天津市', '河北省', '山西省', '山东省', '河南省')
                          AND year_date = %s
                        GROUP BY province
                        ORDER BY FIELD(province, '北京市', '天津市', '河北省', '山西省', '山东省', '河南省')
                    """, [date])
                else:
                    cursor.execute("""
                        SELECT province,
                               AVG(dissolved_oxygen) as avg_do,
                               AVG(ammonia_nitrogen) as avg_nh3,
                               AVG(total_phosphorus) as avg_tp
                        FROM water_quality_raw
                        WHERE province IN ('北京市', '天津市', '河北省', '山西省', '山东省', '河南省')
                        GROUP BY province
                        ORDER BY FIELD(province, '北京市', '天津市', '河北省', '山西省', '山东省', '河南省')
                    """)
                bar_rows = cursor.fetchall()
                if bar_rows:
                    bar_data = {
                        "provinces": [row['province'] for row in bar_rows],
                        "dissolved_oxygen": [round(float(row['avg_do'] or 0), 2) for row in bar_rows],
                        "ammonia_nitrogen": [round(float(row['avg_nh3'] or 0), 3) for row in bar_rows],
                        "total_phosphorus": [round(float(row['avg_tp'] or 0), 3) for row in bar_rows]
                    }
            
            # 构建返回数据
            result = {
                "success": True,
                "data": {
                    "overview": {
                        "total_records": stats['count'],
                        "monitoring_stations": stats['stations'],
                        "province": province
                    },
                    "boxplot": process_boxplot_data(boxplot_data) if boxplot_data else None,
                    "heatmap": process_heatmap_data(heatmap_raw) if len(heatmap_raw) >= 5 else None,
                    "line": line_data,
                    "bar": bar_data,
                    "map": map_data
                }
            }
            
            return jsonify(result), 200
            
    except Exception as e:
        import traceback
        print(f"[ERROR] data-by-province error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        if 'conn' in locals():
            conn.close()

# 辅助函数
def process_boxplot_data(data):
    """处理箱线图数据"""
    if not data:
        return None
    
    do_values = sorted([float(r['dissolved_oxygen']) for r in data if r['dissolved_oxygen']])
    nh3_values = sorted([float(r['ammonia_nitrogen']) for r in data if r['ammonia_nitrogen']])
    tp_values = sorted([float(r['total_phosphorus']) for r in data if r['total_phosphorus']])
    pm_values = sorted([float(r['permanganate_index']) for r in data if r['permanganate_index']])
    ph_values = sorted([float(r['ph']) for r in data if r['ph']])
    
    def calc_stats(values):
        if not values:
            return [0, 0, 0, 0, 0]
        n = len(values)
        return [
            round(values[0], 3),
            round(values[n // 4], 3),
            round(values[n // 2], 3),
            round(values[3 * n // 4], 3),
            round(values[-1], 3)
        ]
    
    return {
        "categories": ['溶解氧', '氨氮', '总磷', '高锰酸盐指数', 'PH'],
        "data": [
            calc_stats(do_values),
            calc_stats(nh3_values),
            calc_stats(tp_values),
            calc_stats(pm_values),
            calc_stats(ph_values)
        ]
    }

def process_bar_data(data):
    """处理柱状图数据"""
    if not data:
        return None
    
    return {
        "provinces": [row['province'] for row in data],
        "dissolved_oxygen": [round(float(row['avg_do']), 2) for row in data],
        "ammonia_nitrogen": [round(float(row['avg_nh3']), 3) for row in data],
        "total_phosphorus": [round(float(row['avg_tp']), 3) for row in data]
    }


def process_heatmap_data(data):
    """处理热力图相关性数据"""
    if not data or len(data) < 5:
        return None
    
    try:
        import numpy as np
        
        indicators = ['水温', 'PH', '溶解氧', '电导率', '浊度', '高锰酸盐指数', '氨氮', '总磷', '总氮']
        keys = ['water_temp', 'ph', 'dissolved_oxygen', 'conductivity', 'turbidity',
                'permanganate_index', 'ammonia_nitrogen', 'total_phosphorus', 'total_nitrogen']
        
        # 构建数据矩阵
        matrix = []
        for key in keys:
            values = [float(row[key]) if row[key] is not None else 0 for row in data]
            matrix.append(values)
        
        # 计算相关性矩阵
        matrix = np.array(matrix)
        corr_matrix = np.corrcoef(matrix)
        
        # 转换为前端需要的格式
        heatmap_data = []
        for i in range(len(indicators)):
            for j in range(len(indicators)):
                heatmap_data.append([i, j, round(float(corr_matrix[i][j]), 3)])
        
        return {
            "indicators": indicators,
            "values": heatmap_data
        }
    except Exception as e:
        print(f"[ERROR] process_heatmap_data error: {e}")
        return None

def get_default_heatmap_data():
    """默认热力图数据"""
    return {
        "indicators": ['水温', 'PH', '溶解氧', '电导率', '浊度', '高锰酸盐指数', '氨氮', '总磷', '总氮'],
        "values": [[i, j, 0] for i in range(9) for j in range(9)]
    }

def get_default_boxplot_data():
    """默认箱线图数据"""
    return {
        "categories": ['溶解氧', '氨氮', '总磷', '高锰酸盐指数', 'PH'],
        "data": [[0, 0, 0, 0, 0] for _ in range(5)]
    }

def get_default_bar_data():
    """默认柱状图数据"""
    return {
        "provinces": ['北京市', '天津市', '河北省', '山西省', '山东省', '河南省'],
        "dissolved_oxygen": [0, 0, 0, 0, 0, 0],
        "ammonia_nitrogen": [0, 0, 0, 0, 0, 0],
        "total_phosphorus": [0, 0, 0, 0, 0, 0]
    }

def get_default_line_data():
    """默认折线图数据"""
    return {
        "dates": [],
        "dissolved_oxygen": [],
        "ph": [],
        "ammonia_nitrogen": []
    }

@dashboard_bp.route('/boxplot-data', methods=['GET'])
def get_boxplot_data():
    """
    获取箱线图数据（增强版）
    展示溶解氧、氨氮、总磷、高锰酸盐指数、PH 5个核心指标分布
    包含：箱线图统计量、异常值检测、预警阈值、稳定性评分
    """
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            # 获取详细数据，包括时间、站点信息（用于异常值分析）
            cursor.execute("""
                SELECT dissolved_oxygen, ammonia_nitrogen, total_phosphorus, 
                       permanganate_index, ph, year_date, location, province
                FROM water_quality_raw
                WHERE dissolved_oxygen IS NOT NULL 
                  AND ammonia_nitrogen IS NOT NULL
                  AND total_phosphorus IS NOT NULL
                LIMIT 10000
            """)
            data = cursor.fetchall()
            
            # 定义指标配置（含国标限值）
            indicators_config = {
                '溶解氧': {
                    'field': 'dissolved_oxygen',
                    'unit': 'mg/L',
                    'level1': 7.5, 'level2': 6.0, 'level3': 5.0,
                    'higher_better': True
                },
                '氨氮': {
                    'field': 'ammonia_nitrogen',
                    'unit': 'mg/L',
                    'level1': 0.15, 'level2': 0.5, 'level3': 1.0,
                    'higher_better': False
                },
                '总磷': {
                    'field': 'total_phosphorus',
                    'unit': 'mg/L',
                    'level1': 0.02, 'level2': 0.1, 'level3': 0.2,
                    'higher_better': False
                },
                '高锰酸盐指数': {
                    'field': 'permanganate_index',
                    'unit': 'mg/L',
                    'level1': 2.0, 'level2': 4.0, 'level3': 6.0,
                    'higher_better': False
                },
                'PH': {
                    'field': 'ph',
                    'unit': '',
                    'level1_min': 6.0, 'level1_max': 9.0,
                    'higher_better': None
                }
            }
            
            results = []
            outliers_list = []
            stability_scores = []
            
            for idx, (name, config) in enumerate(indicators_config.items()):
                # 提取有效值
                values = []
                value_details = []
                
                for row in data:
                    val = row[config['field']]
                    if val is not None:
                        values.append(float(val))
                        value_details.append({
                            'value': float(val),
                            'date': row['year_date'],
                            'location': row['location'],
                            'province': row['province']
                        })
                
                if not values:
                    continue
                
                sorted_values = sorted(values)
                n = len(sorted_values)
                
                # 计算箱线图统计量
                min_val = sorted_values[0]
                max_val = sorted_values[-1]
                
                # 使用更精确的四分位数计算
                q1_idx = int(n * 0.25)
                q2_idx = int(n * 0.5)
                q3_idx = int(n * 0.75)
                
                q1 = sorted_values[q1_idx]
                median = sorted_values[q2_idx]
                q3 = sorted_values[q3_idx]
                
                iqr = q3 - q1
                
                # 异常值边界（1.5倍IQR规则）
                lower_fence = q1 - 1.5 * iqr
                upper_fence = q3 + 1.5 * iqr
                
                # 须线范围（非异常值的最小/最大值）
                whisker_lower = max(min_val, lower_fence)
                whisker_upper = min(max_val, upper_fence)
                
                # 检测异常值
                outliers = []
                for detail in value_details:
                    val = detail['value']
                    if val < lower_fence or val > upper_fence:
                        # 判断超标情况
                        exceeded_standard = None
                        if name == 'PH':
                            if val < 6 or val > 9:
                                exceeded_standard = '超标'
                        elif config.get('higher_better'):
                            if val < config['level3']:
                                exceeded_standard = 'Ⅲ类以下'
                        else:
                            if val > config['level3']:
                                exceeded_standard = 'Ⅲ类以下'
                        
                        outliers.append({
                            'value': round(val, 3),
                            'date': str(detail['date']) if detail['date'] else '未知',
                            'location': detail['location'] or '未知站点',
                            'province': detail['province'] or '未知省份',
                            'exceeded': exceeded_standard,
                            'type': 'low' if val < lower_fence else 'high'
                        })
                
                # 计算稳定性评分（基于变异系数CV，越低越稳定）
                mean_val = sum(sorted_values) / n
                variance = sum((x - mean_val) ** 2 for x in sorted_values) / n
                std_val = variance ** 0.5
                cv = std_val / mean_val if mean_val != 0 else 0
                
                # 转换为0-100的稳定性评分（CV越小，稳定性越高）
                stability_score = max(0, min(100, 100 - cv * 100))
                
                # 预警阈值（基于1.5倍IQR，可根据业务调整）
                warning_lower = round(lower_fence, 3)
                warning_upper = round(upper_fence, 3)
                
                # 国标对比
                if name == 'PH':
                    vs_standard = '符合国标' if 6 <= median <= 9 else '需关注'
                    standard_level = '6-9'
                elif config.get('higher_better'):
                    if median >= config['level1']:
                        vs_standard = 'Ⅰ类标准'
                    elif median >= config['level2']:
                        vs_standard = 'Ⅱ类标准'
                    else:
                        vs_standard = 'Ⅲ类标准'
                    standard_level = f"≥{config['level1']}"
                else:
                    if median <= config['level1']:
                        vs_standard = 'Ⅰ类标准'
                    elif median <= config['level2']:
                        vs_standard = 'Ⅱ类标准'
                    else:
                        vs_standard = 'Ⅲ类标准'
                    standard_level = f"≤{config['level1']}"
                
                results.append({
                    'name': name,
                    'unit': config['unit'],
                    'boxplot': [round(whisker_lower, 3), round(q1, 3), round(median, 3), round(q3, 3), round(whisker_upper, 3)],
                    'statistics': {
                        'min': round(min_val, 3),
                        'max': round(max_val, 3),
                        'q1': round(q1, 3),
                        'median': round(median, 3),
                        'q3': round(q3, 3),
                        'iqr': round(iqr, 3),
                        'mean': round(mean_val, 3),
                        'std': round(std_val, 3)
                    },
                    'warning_threshold': {
                        'lower': warning_lower,
                        'upper': warning_upper
                    },
                    'stability_score': round(stability_score, 1),
                    'vs_standard': vs_standard,
                    'standard_level': standard_level,
                    'outlier_count': len(outliers)
                })
                
                outliers_list.append({
                    'indicator': name,
                    'outliers': outliers[:20]  # 最多返回20个异常值
                })
                
                stability_scores.append(stability_score)
            
            # 计算综合稳定性评分
            overall_stability = round(sum(stability_scores) / len(stability_scores), 1) if stability_scores else 0
            
            return jsonify({
                "success": True,
                "data": {
                    "indicators": results,
                    "outliers": outliers_list,
                    "overall_stability": overall_stability,
                    "sample_count": len(data)
                }
            }), 200
            
    except Exception as e:
        import traceback
        print(f"[ERROR] Boxplot data error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        if 'conn' in locals():
            conn.close()

@dashboard_bp.route('/province-comparison', methods=['GET'])
def get_province_comparison():
    """
    获取分组柱状图数据
    海河流域6省份（北京、天津、河北、山西、山东、河南）对比溶解氧、氨氮、总磷均值
    """
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            # 首先检查表中有哪些省份
            cursor.execute("SELECT DISTINCT province FROM water_quality_raw LIMIT 20")
            available_provinces = cursor.fetchall()
            print(f"[DEBUG] Available provinces: {[p['province'] for p in available_provinces]}")
            
            # 按省份分组计算均值
            cursor.execute("""
                SELECT 
                    province,
                    AVG(dissolved_oxygen) as avg_do,
                    AVG(ammonia_nitrogen) as avg_nh3,
                    AVG(total_phosphorus) as avg_tp,
                    COUNT(*) as sample_count
                FROM water_quality_raw
                WHERE province IN ('北京市', '天津市', '河北省', '山西省', '山东省', '河南省')
                GROUP BY province
                ORDER BY FIELD(province, '北京市', '天津市', '河北省', '山西省', '山东省', '河南省')
            """)
            data = cursor.fetchall()
            
            print(f"[DEBUG] Province comparison query returned {len(data)} rows")
            
            if not data:
                return jsonify({
                    "success": True,
                    "data": {
                        "provinces": [],
                        "dissolved_oxygen": [],
                        "ammonia_nitrogen": [],
                        "total_phosphorus": [],
                        "message": "数据库中暂无六省市对比数据"
                    }
                }), 200
            
            provinces = [row['province'] for row in data]
            do_values = [round(float(row['avg_do'] or 0), 2) for row in data]
            nh3_values = [round(float(row['avg_nh3'] or 0), 3) for row in data]
            tp_values = [round(float(row['avg_tp'] or 0), 3) for row in data]
            
            print(f"[DEBUG] Returning data for provinces: {provinces}")
            
            return jsonify({
                "success": True,
                "data": {
                    "provinces": provinces,
                    "dissolved_oxygen": do_values,
                    "ammonia_nitrogen": nh3_values,
                    "total_phosphorus": tp_values
                }
            }), 200
            
    except Exception as e:
        import traceback
        print(f"[ERROR] Province comparison error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        if 'conn' in locals():
            conn.close()

@dashboard_bp.route('/timeseries-data', methods=['GET'])
def get_timeseries_data():
    """
    获取多折线时间序列图数据
    展示溶解氧、PH、氨氮随时间节点的波动趋势
    """
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            # 首先检查数据日期范围
            cursor.execute("""
                SELECT MIN(year_date) as min_date, MAX(year_date) as max_date, COUNT(DISTINCT year_date) as date_count
                FROM water_quality_raw
                WHERE year_date IS NOT NULL
            """)
            date_range = cursor.fetchone()
            print(f"[DEBUG] Date range: {date_range}")
            
            # 按日期分组计算均值（取前50个不同日期）
            cursor.execute("""
                SELECT 
                    year_date as date,
                    AVG(dissolved_oxygen) as avg_do,
                    AVG(ph) as avg_ph,
                    AVG(ammonia_nitrogen) as avg_nh3,
                    COUNT(*) as count
                FROM water_quality_raw
                WHERE year_date IS NOT NULL
                  AND dissolved_oxygen IS NOT NULL
                  AND ph IS NOT NULL
                  AND ammonia_nitrogen IS NOT NULL
                GROUP BY date
                ORDER BY date
                LIMIT 50
            """)
            data = cursor.fetchall()
            
            print(f"[DEBUG] Timeseries query returned {len(data)} rows")
            
            if not data:
                return jsonify({
                    "success": True,
                    "data": {
                        "dates": [],
                        "dissolved_oxygen": [],
                        "ph": [],
                        "ammonia_nitrogen": [],
                        "message": "数据库中暂无有效时序数据"
                    }
                }), 200
            
            dates = [str(row['date']) for row in data]
            do_values = [round(float(row['avg_do']), 2) for row in data]
            ph_values = [round(float(row['avg_ph']), 2) for row in data]
            nh3_values = [round(float(row['avg_nh3']), 3) for row in data]
            
            return jsonify({
                "success": True,
                "data": {
                    "dates": dates,
                    "dissolved_oxygen": do_values,
                    "ph": ph_values,
                    "ammonia_nitrogen": nh3_values
                }
            }), 200
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        if 'conn' in locals():
            conn.close()

@dashboard_bp.route('/map-data', methods=['GET'])
def get_map_data():
    """
    获取地图数据
    返回各监测点的位置信息和水质指标（使用真实经纬度）
    """
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            # 获取站点坐标数据
            cursor.execute("""
                SELECT station_name, province, river_basin, 
                       longitude_gcj02, latitude_gcj02
                FROM station_coordinates
                WHERE longitude_gcj02 IS NOT NULL AND latitude_gcj02 IS NOT NULL
            """)
            coord_data = cursor.fetchall()
            
            if not coord_data:
                return jsonify({"success": False, "error": "无坐标数据"}), 404
            
            # 获取各省份的水质数据（按省份聚合，因为新数据是省份级别）
            cursor.execute("""
                SELECT 
                    w.province,
                    AVG(w.dissolved_oxygen) as avg_do,
                    AVG(w.ammonia_nitrogen) as avg_nh3,
                    AVG(w.ph) as avg_ph,
                    COUNT(*) as sample_count
                FROM water_quality_raw w
                WHERE w.province IS NOT NULL
                  AND w.province IN ('北京市', '天津市', '河北省', '山西省', '山东省', '河南省')
                GROUP BY w.province
            """)
            quality_data = cursor.fetchall()
            
            # 创建水质数据字典（按省份索引）
            quality_dict = {}
            for row in quality_data:
                quality_dict[row['province']] = row
            
            # 合并坐标和水质数据
            map_data = []
            for coord in coord_data:
                station_name = coord['station_name']
                province = coord['province']
                lng = float(coord['longitude_gcj02'])
                lat = float(coord['latitude_gcj02'])
                
                # 使用该省份的平均水质数据
                quality = quality_dict.get(province)
                if not quality:
                    continue
                
                # 使用真实水质数据
                do = float(quality['avg_do']) if quality['avg_do'] else 0
                nh3 = float(quality['avg_nh3']) if quality['avg_nh3'] else 0
                ph = float(quality['avg_ph']) if quality['avg_ph'] else 0
                sample_count = quality['sample_count']
                
                # 计算水质等级
                if do >= 7.5 and nh3 <= 0.5:
                    level = '优'
                    color = '#22c55e'
                elif do >= 6.0 and nh3 <= 1.0:
                    level = '良'
                    color = '#3b82f6'
                elif do >= 5.0 and nh3 <= 1.5:
                    level = '一般'
                    color = '#f59e0b'
                else:
                    level = '差'
                    color = '#ef4444'
                
                map_data.append({
                    "name": station_name,
                    "province": province,
                    "value": [lng, lat, round(do, 2)],
                    "dissolved_oxygen": round(do, 2),
                    "ammonia_nitrogen": round(nh3, 3),
                    "ph": round(ph, 2),
                    "level": level,
                    "color": color,
                    "sample_count": sample_count
                })
            
            return jsonify({
                "success": True,
                "data": map_data
            }), 200
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        if 'conn' in locals():
            conn.close()

@dashboard_bp.route('/overview-stats', methods=['GET'])
def get_overview_stats():
    """
    获取概览统计数据
    """
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            # 总记录数
            cursor.execute("SELECT COUNT(*) as total FROM water_quality_raw")
            total = cursor.fetchone()['total']
            
            # 监测点数
            cursor.execute("SELECT COUNT(DISTINCT location) as stations FROM water_quality_raw")
            stations = cursor.fetchone()['stations']
            
            # 省份数
            cursor.execute("SELECT COUNT(DISTINCT province) as provinces FROM water_quality_raw")
            provinces = cursor.fetchone()['provinces']
            
            # 平均水质指标
            cursor.execute("""
                SELECT 
                    AVG(dissolved_oxygen) as avg_do,
                    AVG(ammonia_nitrogen) as avg_nh3,
                    AVG(ph) as avg_ph
                FROM water_quality_raw
            """)
            avg_data = cursor.fetchone()
            
            return jsonify({
                "success": True,
                "data": {
                    "total_records": total,
                    "monitoring_stations": stations,
                    "provinces": provinces,
                    "avg_dissolved_oxygen": round(float(avg_data['avg_do']), 2),
                    "avg_ammonia_nitrogen": round(float(avg_data['avg_nh3']), 3),
                    "avg_ph": round(float(avg_data['avg_ph']), 2)
                }
            }), 200
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        if 'conn' in locals():
            conn.close()
