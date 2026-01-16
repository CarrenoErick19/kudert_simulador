from app import db, Hero  # Asegúrate de importar el modelo Hero desde tu aplicación

# Verifica qué héroes están en la base de datos
heroes = Hero.query.all()
for hero in heroes:
    print(f"Hero name: {hero.name}, Icon: {hero.icon}, Image: {hero.image}")
