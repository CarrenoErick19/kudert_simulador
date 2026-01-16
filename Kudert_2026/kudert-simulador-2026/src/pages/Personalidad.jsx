import { Link } from 'react-router-dom';

function Personalidad() {
  return (
    <div>
      <h2>Personalidad</h2>
      <p>Próximamente: ejercicios de personalidad</p>
      <Link to="/">
        <button>Volver al Menú Principal</button>
      </Link>
    </div>
  );
}

export default Personalidad;