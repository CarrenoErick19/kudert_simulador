import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Crear la instancia de Flask
app = Flask(__name__)

# Obtener el directorio base
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Configurar la URI de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(BASE_DIR, "db.sqlite3")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializar SQLAlchemy
db = SQLAlchemy(app)

from app import routes  # Importar las rutas después de la inicialización
