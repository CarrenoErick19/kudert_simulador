from app import app, db
from flask import request, jsonify
from app.models import Hero, Battle
from app.model import get_recommendations

# Ruta para registrar los resultados de una batalla
@app.route('/record_battle', methods=['POST'])
def record_battle():
    try:
        # Recibimos los datos JSON de la solicitud
        data = request.get_json()

        # Validar que los datos necesarios estén presentes
        if 'battle_id' not in data or 'heroes_used' not in data or 'result' not in data or 'date' not in data or 'opponent_heroes' not in data:
            return jsonify({'error': 'Missing required fields'}), 400

        # Extraemos los valores del JSON
        battle_id = data['battle_id']
        heroes_used = data['heroes_used']
        result = data['result']
        date = data['date']
        opponent_heroes = data['opponent_heroes']

        # Crear una nueva batalla en la base de datos
        new_battle = Battle(battle_id=battle_id, heroes_used=str(heroes_used), result=result, date=date, opponent_heroes=str(opponent_heroes))

        # Añadir a la base de datos
        db.session.add(new_battle)
        db.session.commit()

        return jsonify({'message': 'Battle recorded successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Ruta para obtener recomendaciones de ataque
@app.route('/get_recommendations', methods=['POST'])
def get_recommendations_route():
    heroes_used = request.json['heroes_used']
    recommendations = get_recommendations(heroes_used)
    return jsonify(recommendations)
