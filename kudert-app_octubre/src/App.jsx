import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Sumas from './pages/Sumas';
import SeriesLetras from './pages/SeriesLetras';
import SeriesNumeros from './pages/SeriesNumeros';
import Razonamiento from './pages/Razonamiento';
import Personalidad from './pages/Personalidad';
import Entrenamiento from './pages/Entrenamiento';
import PruebaEducar2026 from './pages/prueba-educar-2026'; // 👈 Nuevo import

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sumas" element={<Sumas />} />
      <Route path="/series-letras" element={<SeriesLetras />} />
      <Route path="/series-numeros" element={<SeriesNumeros />} />
      <Route path="/razonamiento" element={<Razonamiento />} />
      <Route path="/personalidad" element={<Personalidad />} />
      <Route path="/entrenamiento" element={<Entrenamiento />} />
      <Route path="/prueba-educar-2026" element={<PruebaEducar2026 />} /> {/* 👈 Nueva ruta */}
    </Routes>
  );
}