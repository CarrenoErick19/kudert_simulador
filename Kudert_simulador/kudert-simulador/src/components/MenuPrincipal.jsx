// src/components/MenuPrincipal.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MenuPrincipal() {
  const navigate = useNavigate();

  // Simuladores que abren archivos HTML desde /public
  const abrirSeriesLetras = () => {
    window.location.href = '/SeriesLetras.html';
  };

  const abrirAbstracto = () => {
    window.location.href = '/Abstracto.html';
  };

  const abrirPersonalidad = () => {
    window.location.href = '/Personalidad.html';
  };

  const abrirSeriesNumeros = () => {
    window.location.href = '/SeriesNumeros.html';
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

          <button className="option-button" onClick={abrirSeriesLetras}>
            Series de Letras
          </button>

          <button className="option-button" onClick={abrirSeriesNumeros}>
            Series de Números
          </button>

          <button className="option-button" onClick={abrirAbstracto}>
            Razonamiento Abstracto
          </button>

          <button className="option-button" onClick={abrirPersonalidad}>
            Test de Personalidad
          </button>
        </div>
      </div>
    </div>
  );
}
