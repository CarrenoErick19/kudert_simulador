import { Link } from 'react-router-dom';

function SeriesNumeros() {
  return (
    <div>
      <h2>SeriesNumeros</h2>
      <p>Próximamente: ejercicios de series numericas</p>
      <Link to="/">
        <button>Volver al Menú Principal</button>
      </Link>
    </div>
  );
}

export default SeriesNumeros;