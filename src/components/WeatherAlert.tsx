interface WeatherAlertProps {
  message: string;
}

export const WeatherAlert = ({ message }: WeatherAlertProps) => {
  return (
    <div className="mt-8 px-2 w-full">
      <div className="flex items-center bg-white/10 border border-white/20 rounded-xl px-4 py-3 backdrop-blur-sm">
        <svg 
          className="w-5 h-5 text-white/80 mr-3 shrink-0" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
        <span className="text-white text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};