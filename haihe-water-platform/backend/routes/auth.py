"""
认证相关的API路由
"""

from flask import Blueprint, request, jsonify
from models.user import User
from utils.token_helper import generate_token, verify_token
import bcrypt

# 创建蓝图
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    用户注册API
    地址: POST /api/auth/register
    请求体: {
        "username": "用户名",
        "password": "密码",
        "email": "邮箱",
        "tag": "标签" (学生/科研人员/环保工作者/教育工作者/企业人员/其他)
    }
    返回: 注册结果
    """
    try:
        # 获取请求数据
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "请求数据不能为空"}), 400
        
        # 验证必要字段
        required_fields = ['username', 'password', 'email', 'tag']
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "error": f"缺少字段: {field}"}), 400
        
        # 检查用户名是否已存在
        existing_user = User.find_by_username(data['username'])
        if existing_user:
            return jsonify({"success": False, "error": "用户名已存在"}), 400
        
        # 检查邮箱是否已存在
        existing_email = User.find_by_email(data['email'])
        if existing_email:
            return jsonify({"success": False, "error": "邮箱已被注册"}), 400
        
        # 加密密码
        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        
        # 创建用户
        user = User(
            username=data['username'],
            password=hashed_password.decode('utf-8'),
            email=data['email'],
            tag=data['tag'],
            role='用户'  # 默认角色
        )
        
        # 保存用户
        user.save()
        
        # 生成token
        token = generate_token(user.username, user.role)
        
        return jsonify({
            "success": True,
            "message": "注册成功",
            "data": {
                "token": token,
                "user": {
                    "username": user.username,
                    "email": user.email,
                    "tag": user.tag,
                    "role": user.role
                }
            }
        }), 201
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    用户登录API
    地址: POST /api/auth/login
    请求体: {
        "username": "用户名",
        "password": "密码"
    }
    返回: 登录结果和token
    """
    try:
        # 获取请求数据
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "请求数据不能为空"}), 400
        
        # 验证必要字段
        if 'username' not in data or 'password' not in data:
            return jsonify({"success": False, "error": "缺少用户名或密码"}), 400
        
        # 查找用户
        user = User.find_by_username(data['username'])
        if not user:
            return jsonify({"success": False, "error": "用户名或密码错误"}), 401
        
        # 验证密码
        try:
            # 尝试使用bcrypt验证（加密密码）
            if bcrypt.checkpw(data['password'].encode('utf-8'), user.password.encode('utf-8')):
                pass
            # 如果bcrypt验证失败，尝试直接比较明文密码
            elif data['password'] == user.password:
                # 密码是明文，更新为加密密码
                hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
                connection = User.get_db()
                try:
                    with connection.cursor() as cursor:
                        sql = "UPDATE users SET password = %s WHERE id = %s"
                        cursor.execute(sql, (hashed_password.decode('utf-8'), user.id))
                        connection.commit()
                finally:
                    connection.close()
            else:
                return jsonify({"success": False, "error": "用户名或密码错误"}), 401
        except Exception as e:
            # 如果bcrypt验证失败（可能是密码不是加密格式），尝试直接比较明文密码
            if data['password'] != user.password:
                return jsonify({"success": False, "error": "用户名或密码错误"}), 401
        
        # 生成token
        token = generate_token(user.username, user.role)
        
        return jsonify({
            "success": True,
            "message": "登录成功",
            "data": {
                "token": token,
                "user": {
                    "username": user.username,
                    "email": user.email,
                    "tag": user.tag,
                    "role": user.role
                }
            }
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    """
    获取用户信息API
    地址: GET /api/auth/profile
    请求头: Authorization: Bearer <token>
    返回: 用户信息
    """
    try:
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
        
        # 查找用户
        user = User.find_by_username(payload['username'])
        if not user:
            return jsonify({"success": False, "error": "用户不存在"}), 404
        
        return jsonify({
            "success": True,
            "data": {
                "username": user.username,
                "email": user.email,
                "tag": user.tag,
                "role": user.role
            }
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """
    重置密码API
    地址: POST /api/auth/reset-password
    请求体: {
        "email": "邮箱",
        "new_password": "新密码"
    }
    返回: 重置结果
    """
    try:
        # 获取请求数据
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "请求数据不能为空"}), 400
        
        # 验证必要字段
        if 'email' not in data or 'new_password' not in data:
            return jsonify({"success": False, "error": "缺少邮箱或新密码"}), 400
        
        # 查找用户
        user = User.find_by_email(data['email'])
        if not user:
            return jsonify({"success": False, "error": "该邮箱未注册"}), 404
        
        # 加密新密码
        hashed_password = bcrypt.hashpw(data['new_password'].encode('utf-8'), bcrypt.gensalt())
        
        # 更新密码
        connection = User.get_db()
        try:
            with connection.cursor() as cursor:
                sql = "UPDATE users SET password = %s WHERE email = %s"
                cursor.execute(sql, (hashed_password.decode('utf-8'), data['email']))
                connection.commit()
        finally:
            connection.close()
        
        return jsonify({
            "success": True,
            "message": "密码重置成功"
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500