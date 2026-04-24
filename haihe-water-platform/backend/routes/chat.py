"""
智能问答相关的API路由
"""

from flask import Blueprint, request, jsonify
from utils.token_helper import verify_token
import functools
import requests
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv(override=False)

# 创建蓝图
chat_bp = Blueprint('chat', __name__)

# DeepSeek API配置
DEEPSEEK_API_KEY = os.getenv('DEEPSEEK_API_KEY')
DEEPSEEK_MODEL = os.getenv('DEEPSEEK_MODEL', 'deepseek-v4-flash')
DEEPSEEK_API_URL = os.getenv('DEEPSEEK_API_URL', 'https://api.deepseek.com/chat/completions')

@chat_bp.route('/test-deepseek', methods=['POST'])
def test_deepseek():
    """
    智能问答API
    地址: POST /api/chat/test-deepseek
    请求体: {
        "question": "问题内容"
    }
    返回: 回答内容
    """
    try:
        # 获取请求数据
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "请求数据不能为空"}), 400
        
        # 验证必要字段
        if 'question' not in data:
            return jsonify({"success": False, "error": "缺少问题内容"}), 400
        
        question = data['question']
        
        # 匹配答案
        answer = get_answer(question)
        
        return jsonify({
            "success": True,
            "data": {
                "question": question,
                "answer": answer
            }
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

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

# 问答知识库
knowledge_base = {
    "COD": "COD（化学需氧量）是指在一定条件下，用强氧化剂氧化水中有机物所消耗的氧量，是衡量水体中有机物污染程度的重要指标。COD值越高，说明水体受有机物污染越严重。",
    "氨氮": "氨氮是指水中以游离氨（NH3）和铵离子（NH4+）形式存在的氮。氨氮是水体中的营养素，可导致水体富营养化现象产生，是水体中的主要耗氧污染物，对鱼类及某些水生生物有毒害。",
    "总磷": "总磷是水样经消解后将各种形态的磷转变成正磷酸盐后测定的结果，以每升水样含磷毫克数计量。总磷是衡量水体富营养化的重要指标之一。",
    "活性污泥法": "活性污泥法是一种污水的好氧生物处理法，由Edward Ardern和William Lockett于1914年首先在英国发明。该方法是利用微生物（主要是细菌）分解水中的有机物，通过曝气提供氧气，使微生物在有氧条件下分解有机物，形成活性污泥，然后通过沉淀分离污泥和清水。",
    "膜分离技术": "膜分离技术是利用膜的选择性分离实现料液的不同组分的分离、纯化、浓缩的过程。在污水处理中，膜分离技术主要包括微滤（MF）、超滤（UF）、纳滤（NF）和反渗透（RO）等，可有效去除水中的悬浮物、胶体、有机物和盐分等。",
    "A²O工艺": "A²O工艺是厌氧-缺氧-好氧组合工艺的简称，是一种常用的污水处理工艺。该工艺能同时去除污水中的有机物、氮和磷，具有处理效果好、运行稳定等优点。",
    "SBR工艺": "SBR工艺是序批式活性污泥法的简称，是一种按间歇曝气方式来运行的活性污泥污水处理技术。它的主要特征是在运行上的有序和间歇操作，SBR技术的核心是SBR反应池，该池集均化、初沉、生物降解、二沉等功能于一池，无污泥回流系统。",
    "MBR工艺": "MBR工艺是膜生物反应器的简称，是将膜分离技术与生物处理技术相结合的一种新型污水处理工艺。MBR工艺具有出水水质好、占地面积小、剩余污泥少等优点。",
    "pH值": "pH值是衡量水体酸碱度的重要指标。对于污水处理来说，适宜的pH值范围一般为6.5-8.5，在此范围内微生物的活性最高。",
    "溶解氧": "溶解氧是指溶解在水中的分子态氧，是衡量水体自净能力的重要指标。对于好氧生物处理工艺，溶解氧一般应保持在2-4mg/L之间。",
    "污水处理": "污水处理是指为使污水达到排入某一水体或再次使用的水质要求对其进行净化的过程。污水处理的目的是去除水中的污染物，使其达到排放标准或回用标准。",
    "水质监测": "水质监测是监视和测定水体中污染物的种类、各类污染物的浓度及变化趋势，评价水质状况的过程。主要监测项目可分为两大类：一类是反映水质状况的综合指标，如温度、色度、浊度、pH值、电导率、溶解氧、化学需氧量等；另一类是一些有毒物质，如酚、氰、砷、铅、铬、镉、汞等。",
    "海河": "海河是中国华北地区的最大水系，中国七大河流之一。海河干流，又称沽河，起自天津金钢桥，到大沽口入渤海湾。海河是天津的母亲河，近年来通过加强污染治理，水质得到显著改善。",
    "生物脱氮": "生物脱氮是利用微生物的代谢作用将水中的氮化合物转化为氮气的过程，主要包括氨化、硝化和反硝化三个阶段。生物脱氮是污水处理中去除氮的主要方法。",
    "生物除磷": "生物除磷是利用聚磷菌在厌氧条件下释放磷，在好氧条件下过量吸收磷的特性，通过排泥去除水中磷的过程。生物除磷与生物脱氮工艺常结合使用，以同时去除水中的氮和磷。"
}

def call_deepseek_api(question):
    """
    调用DeepSeek API获取回答
    
    Args:
        question: 问题内容
    
    Returns:
        回答内容
    """
    if not DEEPSEEK_API_KEY:
        return "DeepSeek API密钥未配置，请联系管理员。"
    
    try:
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {DEEPSEEK_API_KEY}'
        }
        
        data = {
            'model': DEEPSEEK_MODEL,
            'messages': [
                {
                    'role': 'system',
                    'content': '你是一个专业的污水处理和水质保护领域的智能助手，提供准确、专业的回答。'
                },
                {
                    'role': 'user',
                    'content': question
                }
            ],
            'temperature': 0.7,
            'max_tokens': 1000
        }
        
        response = requests.post(DEEPSEEK_API_URL, headers=headers, json=data)
        response.raise_for_status()
        
        result = response.json()
        return result['choices'][0]['message']['content']
    except Exception as e:
        print(f"调用DeepSeek API失败: {str(e)}")
        return "抱歉，暂时无法获取回答，请稍后再试。"

@chat_bp.route('/query', methods=['POST'])
def chat_query():
    """
    智能问答API
    地址: POST /api/chat/query
    请求体: {
        "question": "问题内容"
    }
    返回: 回答内容
    """
    try:
        # 获取请求数据
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "请求数据不能为空"}), 400
        
        # 验证必要字段
        if 'question' not in data:
            return jsonify({"success": False, "error": "缺少问题内容"}), 400
        
        question = data['question']
        
        # 匹配答案
        answer = get_answer(question)
        
        return jsonify({
            "success": True,
            "data": {
                "question": question,
                "answer": answer
            }
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

def get_answer(question):
    """
    根据问题获取答案
    
    Args:
        question: 问题内容
    
    Returns:
        回答内容
    """
    # 转换为小写进行匹配
    normalized_question = question.strip().lower()
    
    # 关键词匹配
    for keyword, answer in knowledge_base.items():
        if keyword.strip().lower() == normalized_question:
            return answer
    
    # 调用DeepSeek API获取回答
    return call_deepseek_api(question)


@chat_bp.route('/sandbox-decision', methods=['POST'])
def sandbox_decision():
    """
    基于流域时空推演沙盘数据生成AI辅助决策报告
    请求体: {
        "province": "全部" | "北京市" | ...,
        "date": "2022-07-09",
        "risk_data": { ... }   // 当前日期各省市风险数据
    }
    """
    try:
        data = request.get_json() or {}
        province = data.get('province', '全部')
        date = data.get('date', '')
        risk_data = data.get('risk_data', {})
        
        # 构造系统提示词
        system_prompt = """你是一位资深的水环境治理与流域管理专家，擅长基于水质监测与预测数据制定精准的辅助决策方案。
请根据用户提供的海河流域六省市水质风险推演数据，生成一份结构化的《AI辅助决策报告》。报告要求如下：
1. 执行摘要：概述当前整体风险态势（用1-2句话）。
2. 重点区域研判：指出风险最高的1-2个省市，说明关键超标指标及可能成因。
3. 分省精准管控建议：对每个中高风险省市给出具体、可执行的治理措施（如工业源管控、农业面源治理、污水处理厂提标、应急增氧等）。
4. 跨区域协同建议：基于流域上下游关系，给出省际联防联控建议。
5. 监测与响应计划：建议未来7天的监测频次与应急响应级别。
要求语言专业、简洁、具有决策参考价值，避免泛泛而谈。"""

        # 构造用户输入
        user_content = f"分析日期: {date}\n关注范围: {province}\n\n当前风险数据:\n{str(risk_data)}\n\n请生成AI辅助决策报告。"
        
        if not DEEPSEEK_API_KEY:
            return jsonify({"success": False, "error": "DeepSeek API密钥未配置"}), 500
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {DEEPSEEK_API_KEY}'
        }
        payload = {
            'model': DEEPSEEK_MODEL,
            'messages': [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_content}
            ],
            'temperature': 0.5,
            'max_tokens': 2000
        }
        
        resp = requests.post(DEEPSEEK_API_URL, headers=headers, json=payload)
        resp.raise_for_status()
        result = resp.json()
        answer = result['choices'][0]['message']['content']
        
        return jsonify({
            "success": True,
            "data": {
                "province": province,
                "date": date,
                "report": answer
            }
        }), 200
        
    except Exception as e:
        import traceback
        print(f"[ERROR] sandbox-decision error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500
