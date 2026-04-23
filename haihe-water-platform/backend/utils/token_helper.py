"""
JWT令牌生成和验证工具
"""

import jwt
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

# 加载环境变量
load_dotenv(override=True)

SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key')

def generate_token(username, role):
    """
    生成JWT令牌
    
    Args:
        username: 用户名
        role: 用户角色
    
    Returns:
        生成的JWT令牌
    """
    # 设置令牌过期时间（24小时）
    expiration = datetime.utcnow() + timedelta(hours=24)
    
    # 令牌载荷
    payload = {
        'username': username,
        'role': role,
        'exp': expiration
    }
    
    # 生成令牌
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token

def verify_token(token):
    """
    验证JWT令牌
    
    Args:
        token: JWT令牌
    
    Returns:
        令牌有效返回载荷，无效返回None
    """
    try:
        # 解码令牌
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        # 令牌过期
        return None
    except jwt.InvalidTokenError:
        # 令牌无效
        return None