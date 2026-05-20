interface ErrorPopupProps {
  cityName: string;
  onClose: () => void;
}

export function ErrorPopup({ cityName, onClose }: ErrorPopupProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-200">
        <div className="bg-red-100 p-3 rounded-full mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Cidade não encontrada</h2>
        <p className="text-gray-500 text-sm mb-6">
          Não conseguimos encontrar os dados para "{cityName}". Verifique se o nome está correto e tente novamente.
        </p>
        <button
          onClick={onClose}
          className="bg-[#6488DA] text-white px-6 py-3 rounded-full font-semibold w-full hover:bg-[#5271b8] transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}