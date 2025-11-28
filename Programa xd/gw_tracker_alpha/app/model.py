import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import CountVectorizer

# Función para obtener recomendaciones basadas en los héroes utilizados
def get_recommendations(heroes_used):
    # Cargar los datos históricos de batallas
    df = pd.read_csv('data/gw_data.csv')

    # Preprocesamiento: asegurarse de que 'heroes_used' sea una lista de héroes
    df['heroes_used'] = df['heroes_used'].apply(eval).apply(lambda x: ','.join(sorted(x)))
    
    # Codificación de resultados: 0 = derrota, 1 = victoria
    label_encoder = LabelEncoder()
    df['result'] = label_encoder.fit_transform(df['result'])  # 0 = derrota, 1 = victoria

    # Vectorización de las características
    # Convertir las listas de héroes a una cadena para usar CountVectorizer
    vectorizer = CountVectorizer(tokenizer=lambda x: x.split(','))
    
    # Vectorizar los héroes utilizados
    X = vectorizer.fit_transform(df['heroes_used']).toarray()
    y = df['result']

    # Dividir los datos en conjuntos de entrenamiento y prueba
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Entrenamiento del modelo RandomForest
    model = RandomForestClassifier(random_state=42)
    model.fit(X_train, y_train)

    # Realizar la predicción con los héroes proporcionados
    heroes_used_vector = vectorizer.transform([','.join(sorted(heroes_used))]).toarray()
    prediction = model.predict(heroes_used_vector)
    
    # Convertir la predicción a texto
    recommended_result = 'victory' if prediction[0] == 1 else 'defeat'
    
    return {'recommended_result': recommended_result}
