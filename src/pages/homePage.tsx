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
    <div className="min-h-screen max-w-md mx-auto bg-linear-to-b from-[#6488DA] to-[#3B2063] flex flex-col pt-12 font-sans overflow-hidden relative">
      
      {showErrorPopup && (
        <ErrorPopup cityName={cidadeBusca} onClose={() => setShowErrorPopup(false)} />
      )}

      <WeatherEffects condition={weatherData?.condition || 'sunny'} />

      <div className="flex flex-col items-center w-full shrink-0 relative z-10">
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
      
      <div className="rounded-4xl border-gray-400 border-t-2 mt-4 relative z-10">
        <div className="flex flex-col w-full mt-4 mb-6 ml-3">
          <p className="text-white font-bold text-sm">
            Previsão para os próximos 5 dias
          </p>
          {weatherData?.alert && <WeatherAlert message={weatherData.alert} />}
          {forecastData.length > 0 && (
            <ForecastCarousel forecast={forecastData} />
          )}
        </div>
      </div>
      
      <div className="border-gray-400 rounded-4xl border-t-2 h-34 relative z-10"></div>
      
      <div className="flex-1 w-full flex flex-col justify-end pb-6 mt-4 relative z-10"></div>
    </div>
  );
}