import json
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Inicialización de Flask y SQLAlchemy
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///instance/heroes.db'  # Cambia esto a tu URI de base de datos
db = SQLAlchemy(app)

# Aquí va tu código de definición de modelos
class Hero(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    icon = db.Column(db.String(100))
    image = db.Column(db.String(100))

# Función para cargar los datos desde el archivo JSON
def load_heroes_from_json(file_path):
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)  # Cargar el archivo JSON en un objeto de Python
            return data
    except Exception as e:
        print(f"Error al cargar el archivo JSON: {e}")
        return []

# El resto de tu código para cargar y procesar los datos JSON
if __name__ == "__main__":
    heroes = load_heroes_from_json('app/hero.json')  # Cargar los héroes desde el archivo hero.json

    with app.app_context():  # Asegúrate de que las operaciones de base de datos estén dentro del contexto de la app
        # Crear las tablas si no existen
        db.create_all()

        for hero in heroes:
            try:
                name = hero['name']
                icon = hero.get('icon', 'default_icon')  # Valor por defecto si 'icon' no existe
                image = hero.get('image', 'default_image')  # Valor por defecto si 'image' no existe

                # Crear una instancia de Hero y añadirla a la base de datos
                hero_entry = Hero(name=name, icon=icon, image=image)
                db.session.add(hero_entry)
            except KeyError as e:
                print(f"Advertencia: Falta la clave {e} en uno de los héroes.")
        
        # Guardar los cambios en la base de datos
        db.session.commit()
        print("Los héroes han sido añadidos a la base de datos.")
