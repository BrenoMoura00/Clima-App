import { useState, type FormEvent } from 'react';
import loupeIcon from '../assets/loupe.png';

interface HeaderProps {
  city: string;
  onSearch: (city: string) => void;
}

export const Header = ({ city, onSearch }: HeaderProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue);
      setIsSearching(false);
      setInputValue('');
    }
  };

  return (
    <header className="flex justify-between items-center w-full px-6 py-4">
      <div className="w-6"></div>
      
      {isSearching ? (
        <form onSubmit={handleSubmit} className="flex-1 px-4">
          <input
            type="text"
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Buscar cidade..."
            className="bg-white/20 text-white outline-none w-full rounded-lg border-gray-300 border-[1px] px-4 py-1.5 placeholder-white/70 text-center"
          />
        </form>
      ) : (
        <h1 className="text-white text-3xl font-medium">{city}</h1>
      )}

      <button 
        type="button"
        className="w-6 h-6 flex items-center justify-center text-white"
        onClick={() => setIsSearching(!isSearching)}
      >
        {isSearching ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <img 
            src={loupeIcon} 
            alt="Buscar" 
            className="w-full h-full object-contain" 
          />
        )}
      </button>
    </header>
  );
};