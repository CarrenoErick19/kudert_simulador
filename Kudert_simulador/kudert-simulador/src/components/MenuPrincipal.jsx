// src/components/MenuPrincipal.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MenuPrincipal() {
  const navigate = useNavigate();

  // Función para abrir el simulador de Series de Letras
  const abrirSeriesLetras = () => {
    window.location.href = '/SeriesLetras.html'; // ← Apunta al simulador original en public/
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Simulador Kudert</h1>
        <p className="subtitle">Selecciona una sección para practicar:</p>
        <div className="flex flex-col gap-4">
          <button className="option-button" onClick={() => navigate('/sumas')}>
            Sumas
          </button>

          {/* Botón que abre el simulador original */}
          <button className="option-button" onClick={abrirSeriesLetras}>
            Series de Letras
          </button>

          <button className="option-button" onClick={() => navigate('/series-numeros')}>
            Series de Números
          </button>
          <button className="option-button" onClick={() => navigate('/abstracto')}>
            Razonamiento Abstracto
          </button>
          <button className="option-button" onClick={() => navigate('/personalidad')}>
            Test de Personalidad
          </button>
        </div>
      </div>
    </div>
  );
}