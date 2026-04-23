# 这个文件是登录验证中间件
# 用来保护需要登录才能访问的API

from flask import request, jsonify
from utils.token_helper import verify_token

def auth_required(func):
    """
    装饰器函数：保护需要登录的API
    使用方式：在路由函数上加 @auth_required
    """
    def wrapper(*args, **kwargs):
        # 从请求头获取令牌
        token = request.headers.get('Authorization')
        
        # 如果没有令牌，返回错误
        if not token:
            return jsonify({
                "success": False, 
                "error": "请先登录"
            }), 401
        
        # 移除"Bearer "前缀
        token = token.replace('Bearer ', '')
        
        # 验证令牌
        user_info = verify_token(token)
        if not user_info:
            return jsonify({
                "success": False, 
                "error": "登录已过期，请重新登录"
            }), 401
        
        # 将用户ID保存到请求对象，供后续使用
        request.user_id = user_info['user_id']
        
        # 执行被装饰的函数
        return func(*args, **kwargs)
    
    # 返回包装后的函数
    return wrapper