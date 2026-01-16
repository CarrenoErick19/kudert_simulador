from app import db

# Modelo de Héroes
class Hero(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    attribute = db.Column(db.String(50))
    role = db.Column(db.String(50))
    rarity = db.Column(db.Integer)
    zodiac = db.Column(db.String(50))
    icon = db.Column(db.String(200))
    image = db.Column(db.String(200))

# Modelo de Batallas
class Battle(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    battle_id = db.Column(db.String(100), nullable=False)
    heroes_used = db.Column(db.String(255))
    result = db.Column(db.String(50))
    date = db.Column(db.String(50))
    opponent_heroes = db.Column(db.String(255))
