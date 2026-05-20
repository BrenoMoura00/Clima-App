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
  // Propriedades da API OpenWeather
  status?: number;
  cod?: string | number;
  message?: string;
  name?: string;
  main?: {
    temp?: number;
    feels_like?: number;
    humidity?: number;
    pressure?: number;
  };
  weather?: Array<{
    description?: string;
    main?: string;
    icon?: string;
  }>;
  // Propriedades alternativas da API brasileira
  cidade?: string;
  temperatura?: number;
  sensacaoTermica?: number;
  descricao?: string;
  pais?: string;
}

export interface PrevisaoItem {
  // Propriedades da API
  dataHora?: string;
  temperatura?: number;
  descricao?: string;
  probabilidadeChuva?: number;
  pais?: string;
  // Propriedade adicionada dinamicamente no código
  diaFormatado?: string;
}