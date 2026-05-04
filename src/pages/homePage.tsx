import { useState, useEffect } from "react";
import { CurrentWeather } from "../components/CurrentWeather";
import { ForecastCarousel } from "../components/ForecastCarousel";
import { Header } from "../components/Header";
import { WeatherAlert } from "../components/WeatherAlert";
import { WeatherEffects } from "../components/WeatherEffects";
import { ErrorPopup } from "../components/ErrorPopup";
import { climaService } from "../services/climaService";
import type { WeatherData, ForecastData } from "../types";
import { getWeatherIcon } from "../utils/weatherUtils";

const mapearCondicao = (
  descricaoApi: string | undefined,
): WeatherData["condition"] => {
  if (!descricaoApi) return "sunny";
  const desc = descricaoApi.toLowerCase();

  if (desc.includes("chuva leve") || desc.includes("garoa") || desc.includes("drizzle") || desc.includes("light rain")) return "light-rain";
  if (desc.includes("chuva") || desc.includes("tempestade") || desc.includes("rain") || desc.includes("thunderstorm")) return "rain";
  if (desc.includes("nublado") || desc.includes("overcast") || desc.includes("broken clouds")) return "cloudy";
  if (desc.includes("algumas nuvens") || desc.includes("scattered") || desc.includes("few clouds")) return "partly-cloudy";

  return "sunny";
};

export function HomePage() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [cidadeBusca, setCidadeBusca] = useState("Recife");
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const climaDaApi: any = await climaService.buscarClimaAtual(cidadeBusca);

        if (!climaDaApi || climaDaApi.status === 404 || climaDaApi.cod === "404" || climaDaApi.message === "city not found") {
          throw new Error("Cidade não encontrada");
        }

        const previsaoDaApi: any = await climaService.buscarPrevisaoDaSemana(cidadeBusca);

        const nomeCidade = climaDaApi.name || climaDaApi.cidade;
        let tempBruta = climaDaApi.main?.temp ?? climaDaApi.temperatura ?? 0;

        if (tempBruta > 100) {
          tempBruta = tempBruta - 273.15;
        }

        const descricaoAtual = climaDaApi.weather?.[0]?.description ?? climaDaApi.descricao;

        setWeatherData({
          city: nomeCidade,
          temperature: Math.round(tempBruta),
          condition: mapearCondicao(descricaoAtual),
          icon: getWeatherIcon(descricaoAtual),
        });

        const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
        const datasVistas = new Set();
        const previsaoFiltrada = [];

        for (const item of previsaoDaApi) {
          const dataString = String(item.dataHora).substring(0, 10);

          if (!datasVistas.has(dataString)) {
            datasVistas.add(dataString);

            const dataTratada = dataString.replace(/-/g, "/");
            const dataObj = new Date(dataTratada);

            let diaFormatado = "";
            if (!isNaN(dataObj.getTime())) {
              diaFormatado = diasSemana[dataObj.getDay()];
            } else {
              diaFormatado = dataString.substring(8, 10) + "/" + dataString.substring(5, 7);
            }

            previsaoFiltrada.push({ ...item, diaFormatado });
          }
        }

        const previsaoParaTela: ForecastData[] = previsaoFiltrada.map(
          (item: any, index: number) => {
            let tempPrev = item.temperatura;
            if (tempPrev > 100) {
              tempPrev = tempPrev - 273.15;
            }

            return {
              day: item.diaFormatado,
              temperature: Math.round(tempPrev),
              condition: mapearCondicao(item.descricao),
              icon: getWeatherIcon(item.descricao),
              rainProbability: item.probabilidadeChuva || 0,
              isActive: index === 0,
            };
          },
        );

        setForecastData(previsaoParaTela.slice(0, 6));
        setShowErrorPopup(false);

      } catch (error) {
        console.error(error);
        setShowErrorPopup(true);
      }
    };

    carregarDados();
  }, [cidadeBusca]);

  const handleSearch = (novaCidade: string) => {
    if (novaCidade.trim() !== "") {
      setCidadeBusca(novaCidade);
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-linear-to-b from-[#1c1c1c] via-[#0a0a0a] to-black flex flex-col pt-12 font-sans overflow-x-hidden relative text-white">
      
      {/* Efeitos de Luz Ambiente (Glow) no Background */}
      <div className="absolute top-0 left-[-20%] w-[140%] h-100 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-screen"></div>
      <div className="absolute top-[20%] right-[-30%] w-75 h-75 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen"></div>

      {showErrorPopup && (
        <ErrorPopup cityName={cidadeBusca} onClose={() => setShowErrorPopup(false)} />
      )}

      <WeatherEffects condition={weatherData?.condition || 'sunny'} />

      {/* Adicionado mb-16 aqui para afastar a temperatura do painel inferior */}
      <div className="flex flex-col items-center w-full shrink-0 relative z-10 px-4 mb-16">
        {weatherData && (
          <>
            <Header city={weatherData.city} onSearch={handleSearch} />
            <CurrentWeather
              temperature={weatherData.temperature}
              condition={weatherData.condition}
              icon={weatherData.icon}
            />
          </>
        )}
      </div>
      
      {/* Área da previsão com design Glassmorphism */}
      <div className="rounded-t-[40px] bg-white/5 backdrop-blur-xl border-t border-white/10 mt-auto pt-8 pb-10 relative z-10 w-full shadow-[0_-15px_40px_rgba(0,0,0,0.5)] flex-1 flex flex-col">
        <div className="flex flex-col w-full px-6">
          <p className="text-gray-400 font-medium text-sm tracking-wide mb-6">
            Previsão para os próximos 5 dias
          </p>
          
          {weatherData?.alert && <WeatherAlert message={weatherData.alert} />}
          
          {forecastData.length > 0 && (
            <ForecastCarousel forecast={forecastData} />
          )}
        </div>
      </div>
      
    </div>
  );
}