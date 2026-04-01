import type { ForecastData } from '../types';
import ensolaradoIcon from '../assets/Ensolarado.png';
import nubladoIcon from '../assets/nublado.png';
import parcialmenteNubladoIcon from '../assets/Parcialmente nublado.png';
import chuvaIcon from '../assets/Chuva.png';
import chuvaLeveIcon from '../assets/Chuva leve.png';

export const ForecastCard = ({ day, condition, rainProbability, temperature, isActive }: ForecastData) => {
  const getIcon = (cond: ForecastData['condition']) => {
    switch(cond) {
      case 'sunny': return ensolaradoIcon;
      case 'cloudy': return nubladoIcon;
      case 'partly-cloudy': return parcialmenteNubladoIcon;
      case 'rain': return chuvaIcon;
      case 'light-rain': return chuvaLeveIcon;
      default: return parcialmenteNubladoIcon;
    }
  };

  const baseClasses = "flex flex-col items-center justify-between rounded-[32px] w-[72px] h-[140px] py-4 border shrink-0 transition-all";
  const activeClasses = isActive ? "bg-[#4B237D] border-[#6D3DB3]" : "bg-white/10 border-white/20";

  return (
    <div className={`${baseClasses} ${activeClasses}`}>
      <span className="text-white text-[11px] font-semibold">{day}</span>
      <div className="flex flex-col items-center mt-1">
        <img src={getIcon(condition)} alt={condition} className="w-8 h-8 object-contain" />
        <span className="text-[#00E0FF] text-[10px] font-semibold mt-1">{rainProbability}%</span>
      </div>
      <span className="text-white text-lg font-normal">{temperature}°</span>
    </div>
  );
};