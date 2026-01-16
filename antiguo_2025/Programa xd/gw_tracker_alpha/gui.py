import tkinter as tk
from tkinter import ttk
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Configuración de la base de datos
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///instance/heroes.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Definir el modelo Hero
class Hero(db.Model):
    __tablename__ = 'hero'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    icon = db.Column(db.String(100), nullable=True)
    image = db.Column(db.String(100), nullable=True)

def cargar_heroes():
    # Asegúrate de cargar los héroes desde la base de datos
    heroes = Hero.query.all()
    return [hero.name for hero in heroes]  # Devuelve una lista de nombres de héroes

def crear_interfaz():
    # Crear la ventana principal
    root = tk.Tk()
    root.title("Seleccionar Héroes")

    # Cargar los héroes desde la base de datos
    heroes_list = cargar_heroes()

    # Crear el menú desplegable para los héroes
    combo_defensa = ttk.Combobox(root, values=heroes_list)
    combo_defensa.grid(row=0, column=0)

    combo_atacante = ttk.Combobox(root, values=heroes_list)
    combo_atacante.grid(row=0, column=1)

    # Añadir el resto de los elementos y botones necesarios

    root.mainloop()

if __name__ == "__main__":
    # Asegúrate de que la base de datos esté creada antes de ejecutar la interfaz
    with app.app_context():
        db.create_all()
    crear_interfaz()
