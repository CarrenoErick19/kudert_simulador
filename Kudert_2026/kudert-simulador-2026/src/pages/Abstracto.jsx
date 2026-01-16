import { Link } from 'react-router-dom';

function Abstracto() {
  return (
    <div>
      <h2>Sección Abstracto</h2>
      <p>Aquí practicarás los 35 ejercicios de figuras (matrices, rotaciones, etc.)</p>
      <Link to="/">
        <button>Volver al Menú Principal</button>
      </Link>
    </div>
  );
}

export default Abstracto;