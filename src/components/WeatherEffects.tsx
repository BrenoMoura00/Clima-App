import LottieBundle from "lottie-react";
import animacaoChuva from "../assets/chuva.json";

const Lottie = (LottieBundle as any).default || LottieBundle;

interface WeatherEffectsProps {
  condition: string;
}

export const WeatherEffects = ({ condition }: WeatherEffectsProps) => {
  const mostrarEfeito = condition === 'rain' || condition === 'light-rain' || condition === 'thunderstorm';

  if (!mostrarEfeito) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <Lottie 
        animationData={animacaoChuva} 
        loop={true} 
        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'opacity(0.6)' }}
      />
    </div>
  );
};