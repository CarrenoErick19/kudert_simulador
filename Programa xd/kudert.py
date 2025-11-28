from gtts import gTTS
import os

# Nombre de la carpeta donde se guardarán los audios
carpeta_audios = "audios_spanish"

# Crea la carpeta si no existe
if not os.path.exists(carpeta_audios):
    os.makedirs(carpeta_audios)

def texto_a_voz(texto, archivo="audio.mp3"):
    tts = gTTS(texto, lang="es")  # Cambiado a español
    tts.save(archivo)
    
    # Reproduce el archivo dependiendo del sistema operativo
    if os.name == "nt":  # Windows
        os.system(f"start {archivo}")
    elif os.name == "posix":  # Linux o Mac
        os.system(f"xdg-open {archivo}")  # En Linux, puedes usar 'mpg321' o 'aplay' si esto no funciona

while True:
    texto = input("Escribe el texto a leer (o 'salir' para terminar): ")
    if texto.lower() == "salir":
        break
    nombre_archivo = input("Escribe el nombre del archivo de audio (sin .mp3): ").strip()
    if not nombre_archivo:
        nombre_archivo = "audio"  # Nombre predeterminado
    archivo_completo = os.path.join(carpeta_audios, f"{nombre_archivo}.mp3")
    texto_a_voz(texto, archivo_completo)
    print(f"Audio guardado como '{archivo_completo}'")
