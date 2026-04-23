"""
用户模型
"""

import pymysql
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv(override=True)

class User:
    """
    用户模型类
    """
    
    def __init__(self, username, password, email, tag, role='用户', id=None):
        """
        初始化用户对象
        """
        self.id = id
        self.username = username
        self.password = password  # 已加密的密码
        self.email = email
        self.tag = tag
        self.role = role
        self.created_at = None
    
    @classmethod
    def get_db(cls):
        """
        获取数据库连接
        """
        connection = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            port=int(os.getenv('MYSQL_PORT', '3306')),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'haihe_river_basin'),
            cursorclass=pymysql.cursors.DictCursor
        )
        return connection
    
    @classmethod
    def init_db(cls):
        """
        初始化数据库表
        """
        connection = cls.get_db()
        try:
            with connection.cursor() as cursor:
                # 创建用户表
                sql = """
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    tag VARCHAR(255) NOT NULL,
                    role VARCHAR(255) NOT NULL DEFAULT '用户',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
                cursor.execute(sql)
            connection.commit()
        finally:
            connection.close()
    
    def save(self):
        """
        保存用户到数据库
        """
        connection = self.get_db()
        try:
            with connection.cursor() as cursor:
                # 检查用户名是否已存在
                sql = "SELECT * FROM users WHERE username = %s"
                cursor.execute(sql, (self.username,))
                if cursor.fetchone():
                    raise Exception('用户名已存在')
                
                # 检查邮箱是否已存在
                sql = "SELECT * FROM users WHERE email = %s"
                cursor.execute(sql, (self.email,))
                if cursor.fetchone():
                    raise Exception('邮箱已被注册')
                
                # 插入用户数据
                sql = """
                INSERT INTO users (username, password, email, tag, role)
                VALUES (%s, %s, %s, %s, %s)
                """
                cursor.execute(sql, (
                    self.username,
                    self.password,
                    self.email,
                    self.tag,
                    self.role
                ))
                connection.commit()
                self.id = cursor.lastrowid
                return self
        finally:
            connection.close()
    
    @classmethod
    def find_by_username(cls, username):
        """
        通过用户名查找用户
        """
        connection = cls.get_db()
        try:
            with connection.cursor() as cursor:
                sql = "SELECT * FROM users WHERE username = %s"
                cursor.execute(sql, (username,))
                user_data = cursor.fetchone()
                
                if user_data:
                    user = cls(
                        id=user_data['id'],
                        username=user_data['username'],
                        password=user_data['password'],
                        email=user_data['email'],
                        tag=user_data['tag'],
                        role=user_data['role']
                    )
                    return user
                return None
        finally:
            connection.close()
    
    @classmethod
    def find_by_email(cls, email):
        """
        通过邮箱查找用户
        """
        connection = cls.get_db()
        try:
            with connection.cursor() as cursor:
                sql = "SELECT * FROM users WHERE email = %s"
                cursor.execute(sql, (email,))
                user_data = cursor.fetchone()
                
                if user_data:
                    user = cls(
                        id=user_data['id'],
                        username=user_data['username'],
                        password=user_data['password'],
                        email=user_data['email'],
                        tag=user_data['tag'],
                        role=user_data['role']
                    )
                    return user
                return None
        finally:
            connection.close()
    
    @classmethod
    def find_all(cls):
        """
        获取所有用户
        """
        connection = cls.get_db()
        try:
            with connection.cursor() as cursor:
                sql = "SELECT * FROM users"
                cursor.execute(sql)
                user_list = []
                
                for user_data in cursor.fetchall():
                    user = cls(
                        id=user_data['id'],
                        username=user_data['username'],
                        password=user_data['password'],
                        email=user_data['email'],
                        tag=user_data['tag'],
                        role=user_data['role']
                    )
                    user_list.append(user)
                
                return user_list
        finally:
            connection.close()