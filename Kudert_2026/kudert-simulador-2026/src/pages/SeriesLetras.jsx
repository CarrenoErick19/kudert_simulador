import { Link } from 'react-router-dom';

function SeriesLetras() {
  return (
    <div>
      <h2>SeriesLetras</h2>
      <p>Próximamente: ejercicios de seriesletras</p>
      <Link to="/">
        <button>Volver al Menú Principal</button>
      </Link>
    </div>
  );
}

export default SeriesLetras;