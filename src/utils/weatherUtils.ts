import moonClear from '../assets/moon-clear.png';
import moonCloudy from '../assets/moon-cloudy.png';
import moonRain from '../assets/night-raining.png';
import moonThunder from '../assets/moon-thunder.png';

import sunClear from '../assets/Ensolarado.png';
import sunCloudy from '../assets/nublado.png';
import sunPartlyCloudy from '../assets/Parcialmente nublado.png';
import sunRain from '../assets/Chuva.png';
import sunLightRain from '../assets/Chuva leve.png';

export const isNighttime = (): boolean => {
  const currentHour = new Date().getHours();
  return currentHour >= 18 || currentHour < 5;
};

export const getWeatherIcon = (descricaoApi: string | undefined): string => {
  const isNight = isNighttime();
  const desc = (descricaoApi || '').toLowerCase();

  const isThunder = desc.includes('trovão') || desc.includes('tempestade') || desc.includes('thunder') || desc.includes('storm');
  const isLightRain = desc.includes('chuva leve') || desc.includes('garoa') || desc.includes('light rain') || desc.includes('drizzle');
  const isRain = desc.includes('chuva') || desc.includes('rain');
  const isPartlyCloudy = desc.includes('algumas nuvens') || desc.includes('parcialmente') || desc.includes('scattered') || desc.includes('few clouds');
  const isCloudy = desc.includes('nuvem') || desc.includes('nuvens') || desc.includes('nublado') || desc.includes('clouds') || desc.includes('overcast');

  if (isNight) {
    if (isThunder) return moonThunder;
    if (isRain || isLightRain) return moonRain;
    if (isCloudy || isPartlyCloudy) return moonCloudy;
    return moonClear;
  }

  if (isThunder || (isRain && !isLightRain)) return sunRain;
  if (isLightRain) return sunLightRain;
  if (isPartlyCloudy) return sunPartlyCloudy;
  if (isCloudy) return sunCloudy;
  
  return sunClear;
};