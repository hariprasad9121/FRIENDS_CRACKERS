from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.routes.admin import bp as admin_bp
from app.routes.categories import bp as categories_bp
from app.routes.health import bp as health_bp
from app.routes.offers import bp as offers_bp
from app.routes.orders import bp as orders_bp
from app.routes.products import bp as products_bp


def create_app() -> Flask:
    Config.validate()

    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": Config.CORS_ORIGINS}}, supports_credentials=True)

    app.register_blueprint(health_bp)
    app.register_blueprint(categories_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(offers_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(admin_bp)

    return app
