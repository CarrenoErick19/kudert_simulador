import json

# Ruta del archivo hero.json
file_path = 'app/hero.json'

# Función para corregir el formato de hero.json
def fix_hero_json(file_path):
    try:
        # Abrir el archivo JSON
        with open(file_path, 'r') as f:
            data = f.read()  # Leer el contenido como una cadena para poder inspeccionarlo
        
        # Intentar cargar el JSON
        try:
            data = json.loads(data)  # Convertir la cadena a un objeto JSON
        except json.JSONDecodeError as e:
            print(f"Error al leer el JSON: {e}")
            return
        
        # Si el contenido es un solo diccionario, lo convertimos a una lista de diccionarios
        if isinstance(data, dict):
            print("El archivo JSON contiene un diccionario único, convirtiéndolo a una lista de diccionarios.")
            data = [{'name': hero, **hero_data} for hero, hero_data in data.items()]  # Convertir el diccionario en una lista
        
        # Asegurarse de que cada héroe sea un diccionario válido
        corrected_data = []
        for hero in data:
            if isinstance(hero, dict):  # Si el héroe es un diccionario
                # Comprobamos si ya tiene la clave 'name', 'icon' y 'image'
                if 'name' not in hero:
                    hero['name'] = "Unknown"  # O el valor predeterminado que desees
                if 'icon' not in hero:
                    hero['icon'] = "default_icon"  # Añadimos un valor predeterminado para 'icon'
                if 'image' not in hero:
                    hero['image'] = "default_image"  # Añadimos un valor predeterminado para 'image'
                corrected_data.append(hero)
            else:
                print(f"Error: se esperaba un diccionario, pero se encontró un tipo diferente: {type(hero)}")
                return
        
        # Guardar el archivo corregido reemplazando el original
        with open(file_path, 'w') as f:
            json.dump(corrected_data, f, indent=4)
        
        print(f"El archivo ha sido corregido y guardado como '{file_path}'.")
    
    except Exception as e:
        print(f"Ocurrió un error al procesar el archivo: {e}")

# Llamar a la función para corregir el archivo
fix_hero_json(file_path)
