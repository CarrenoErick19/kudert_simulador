import { Link } from 'react-router-dom';
import '../App.css'; // Importa tus estilos que sobreescriben

function Home() {
  return (
    <div className="App home-container">
      <h1>Simulador KUDERT 2026</h1>
      <p>Elige la sección para practicar</p>

      <div className="menu-buttons">
        <Link to="/sumas">
          <button className="menu-btn">Sumas</button>
        </Link>
        <Link to="/series-letras">
          <button className="menu-btn">Series Letras</button>
        </Link>
        <Link to="/series-numeros">
          <button className="menu-btn">Series Números</button>
        </Link>
        <Link to="/abstracto">
          <button className="menu-btn">Abstracto</button>
        </Link>
        <Link to="/personalidad">
          <button className="menu-btn">Personalidad</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;