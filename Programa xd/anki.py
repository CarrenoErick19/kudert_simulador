from gtts import gTTS
import os

# Crea la carpeta "audios" si no existe
if not os.path.exists("audios"):
    os.makedirs("audios")

def texto_a_voz(texto, archivo="audio.mp3"):
    tts = gTTS(texto, lang="en")  # Cambia "en" a otro idioma si lo necesitas
    tts.save(archivo)
    os.system(f"start {archivo}")  # En Windows usa 'start', en Linux usa 'mpg321' o 'aplay'

while True:
    texto = input("Escribe el texto a leer (o 'salir' para terminar): ")
    if texto.lower() == "salir":
        break
    nombre_archivo = input("Escribe el nombre del archivo de audio (sin .mp3): ")
    if not nombre_archivo:
        nombre_archivo = "audio"  # Si no se ingresa un nombre, se guarda como 'audio.mp3'
    archivo_completo = f"audios/{nombre_archivo}.mp3"  # Guardar en la carpeta 'audios'
    texto_a_voz(texto, archivo_completo)
    print(f"Audio guardado como '{archivo_completo}'")


