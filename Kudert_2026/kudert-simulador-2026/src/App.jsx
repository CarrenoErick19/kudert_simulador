import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Sumas from './pages/Sumas';
import SeriesLetras from './pages/SeriesLetras';
import SeriesNumeros from './pages/SeriesNumeros';
import Abstracto from './pages/Abstracto';
import Personalidad from './pages/Personalidad';
import './App.css';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sumas" element={<Sumas />} />
        <Route path="/series-letras" element={<SeriesLetras />} />
        <Route path="/series-numeros" element={<SeriesNumeros />} />
        <Route path="/abstracto" element={<Abstracto />} />
        <Route path="/personalidad" element={<Personalidad />} />
      </Routes>
    </div>
  );
}

export default App;