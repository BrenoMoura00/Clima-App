export interface WeatherData {
  city: string;
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'partly-cloudy' | 'rain' | 'light-rain';
  icon: string;
  alert?: string;
}

export interface ForecastData {
  day: string;
  condition: 'sunny' | 'cloudy' | 'partly-cloudy' | 'rain' | 'light-rain';
  icon: string;
  rainProbability: number;
  temperature: number;
  isActive?: boolean;
}

export interface ClimaAtual {
  cidade: string;
  temperatura: number;
  sensacaoTermica: number;
  descricao: string;
  pais: string;
}

export interface PrevisaoItem {
  dataHora: string;
  temperatura: number;
  descricao: string;
  pais: string;
}