"""Flask entry point for the Haihe knowledge graph project."""

import os

from dotenv import load_dotenv
from flask import Flask, send_from_directory
from flask_cors import CORS

from models.user import User
from models.water_quality import WaterQuality
from routes import auth, chat, dashboard, decision, graph, water_quality

load_dotenv(override=True)

APP_HOST = os.getenv('FLASK_HOST', '0.0.0.0')
APP_PORT = int(os.getenv('FLASK_PORT', '5001'))
APP_DEBUG = os.getenv('FLASK_DEBUG', 'true').lower() in {'1', 'true', 'yes', 'on'}

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": ["*"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
        }
    },
)


def init_databases():
    print("正在初始化数据库...")
    User.init_db()
    WaterQuality.init_db()
    print("数据库初始化完成。")


def register_blueprints(flask_app):
    flask_app.register_blueprint(auth.auth_bp, url_prefix='/api/auth')
    flask_app.register_blueprint(graph.graph_bp, url_prefix='/api/graph')
    flask_app.register_blueprint(chat.chat_bp, url_prefix='/api/chat')
    flask_app.register_blueprint(water_quality.water_quality_bp, url_prefix='/api/water-quality')
    flask_app.register_blueprint(dashboard.dashboard_bp, url_prefix='/api/dashboard')
    flask_app.register_blueprint(decision.decision_bp, url_prefix='/api/decision')


def get_frontend_root():
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(backend_dir)
    return os.path.join(project_dir, 'frontend')


@app.route('/')
def index():
    return {
        "message": "海河六域后端服务运行中",
        "status": "ok",
        "frontend": "/frontend/pages/index.html",
        "apis": [
            "/api/auth/register",
            "/api/auth/login",
            "/api/graph",
            "/api/chat",
            "/api/dashboard/validation-overview",
        ],
    }


@app.route('/frontend/<path:path>')
def serve_frontend(path):
    return send_from_directory(get_frontend_root(), path)


@app.route('/frontend')
def frontend_index():
    return send_from_directory(get_frontend_root(), 'pages/index.html')


def print_startup_banner():
    print("=" * 52)
    print("海河六域后端服务")
    print("=" * 52)
    print(f"服务地址: http://127.0.0.1:{APP_PORT}")
    print(f"前端首页: http://127.0.0.1:{APP_PORT}/frontend/pages/index.html")
    print("核心接口:")
    print("  POST /api/auth/register")
    print("  POST /api/auth/login")
    print("  GET  /api/graph")
    print("  POST /api/chat")
    print("  GET  /api/dashboard/validation-overview")
    print("=" * 52)


init_databases()
register_blueprints(app)


if __name__ == '__main__':
    print_startup_banner()
    app.run(debug=APP_DEBUG, port=APP_PORT, host=APP_HOST)
