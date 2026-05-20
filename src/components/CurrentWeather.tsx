interface CurrentWeatherProps {
  temperature: number;
  condition: string;
  icon: string;
}

export const CurrentWeather = ({ temperature, condition, icon }: CurrentWeatherProps) => {
  return (
    <div className="flex flex-col items-center mt-8">
      <img 
        src={icon} 
        alt={condition} 
        className="w-32 h-32 object-contain" 
      />
      <p className="text-white text-7xl font-light tracking-tight mt-4">
        {temperature}<span className="text-white/70">°C</span>
      </p>
    </div>
  );
};