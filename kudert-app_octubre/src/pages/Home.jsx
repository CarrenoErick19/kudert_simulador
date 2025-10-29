import { useNavigate } from 'react-router-dom';
import MenuButton from '../components/MenuButton';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-8">Simulador Kudert</h1>
      <div className="w-full max-w-md space-y-4">
        <MenuButton text="Sumas" onClick={() => navigate('/sumas')} />
        <MenuButton text="Series Letras" onClick={() => navigate('/series-letras')} />
        <MenuButton text="Series Números" onClick={() => navigate('/series-numeros')} />
        <MenuButton text="Razonamiento" onClick={() => navigate('/razonamiento')} />
        <MenuButton text="Personalidad" onClick={() => navigate('/personalidad')} />
      </div>
    </div>
  );
}
