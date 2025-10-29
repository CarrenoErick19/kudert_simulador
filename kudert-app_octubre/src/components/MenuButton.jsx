export default function MenuButton({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-blue-500 text-white py-3 rounded-2xl shadow-lg text-xl font-semibold hover:bg-blue-600 transition"
    >
      {text}
    </button>
  );
}
