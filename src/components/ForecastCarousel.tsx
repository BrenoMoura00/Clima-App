import type { ForecastData } from '../types';
import { ForecastCard } from './ForecastCard';

interface ForecastCarouselProps {
  forecast: ForecastData[];
}

export const ForecastCarousel = ({ forecast }: ForecastCarouselProps) => {
  return (
    <div className="w-full mt-6">
      <div className="flex overflow-x-auto snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {forecast.map((item, index) => (
          <div 
            key={index} 
            className={`snap-start shrink-0 mr-3 ${index === 0 ? 'ml-6' : ''} ${index === forecast.length - 1 ? 'mr-6' : ''}`}
          >
            <ForecastCard {...item} />
          </div>
        ))}
      </div>
    </div>
  );
};