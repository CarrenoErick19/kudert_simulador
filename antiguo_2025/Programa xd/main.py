from PIL import Image
import os

def convertir_webp_a_jpg(carpeta_origen, carpeta_destino):
    # Crear la carpeta de destino si no existe
    if not os.path.exists(carpeta_destino):
        os.makedirs(carpeta_destino)

    # Iterar sobre todos los archivos en la carpeta origen
    for archivo in os.listdir(carpeta_origen):
        if archivo.endswith('.webp'):
            ruta_imagen = os.path.join(carpeta_origen, archivo)
            try:
                # Abrir la imagen en formato WebP
                with Image.open(ruta_imagen) as img:
                    # Convertir a RGB (necesario para JPG)
                    img = img.convert("RGB")
                    # Guardar la imagen como JPG en la carpeta de destino
                    nombre_archivo = os.path.splitext(archivo)[0] + '.jpg'
                    ruta_destino = os.path.join(carpeta_destino, nombre_archivo)
                    img.save(ruta_destino, "JPEG")
                    print(f"Imagen convertida y guardada: {ruta_destino}")
            except Exception as e:
                print(f"No se pudo convertir {archivo}: {e}")

# Especifica la carpeta de origen y destino
carpeta_origen = 'ruta/a/carpeta/origen'
carpeta_destino = 'ruta/a/carpeta/destino'
convertir_webp_a_jpg(carpeta_origen, carpeta_destino)
