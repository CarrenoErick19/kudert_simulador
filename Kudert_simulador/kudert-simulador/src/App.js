import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MenuPrincipal from './components/MenuPrincipal';
import Sumas from './components/Sumas';
import SeriesLetras from './components/SeriesLetras';
import SeriesNumeros from './components/SeriesNumeros';
import Abstracto from './components/Abstracto';
import Personalidad from './components/Personalidad';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MenuPrincipal />} />
        <Route path="/sumas" element={<Sumas />} />
        <Route path="/series-letras" element={<SeriesLetras />} />
        <Route path="/series-numeros" element={<SeriesNumeros />} />
        <Route path="/abstracto" element={<Abstracto />} />
        <Route path="/personalidad" element={<Personalidad />} />
      </Routes>
    </Router>
  );
}

export default App;
