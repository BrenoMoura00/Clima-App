import { useState, useEffect } from "react";
import { CurrentWeather } from "../components/CurrentWeather";
import { ForecastCarousel } from "../components/ForecastCarousel";
import { Header } from "../components/Header";
import { WeatherAlert } from "../components/WeatherAlert";
import { WeatherEffects } from "../components/WeatherEffects";
import { ErrorPopup } from "../components/ErrorPopup";
import ChatInput from "../components/ChatInput";
import { climaService } from "../services/climaService";
import type { WeatherData, ForecastData, ClimaAtual, PrevisaoItem } from "../types";
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

const calcularProbabilidadeChuva = (descricao: string | undefined): number => {
  if (!descricao) return 0;
  const desc = descricao.toLowerCase();
  
  if (desc.includes("chuva moderada") || desc.includes("moderate rain")) return 80;
  if (desc.includes("chuva leve") || desc.includes("garoa") || desc.includes("light rain") || desc.includes("drizzle")) return 60;
  if (desc.includes("chuva") || desc.includes("rain") || desc.includes("tempestade") || desc.includes("thunderstorm")) return 75;
  if (desc.includes("nublado") || desc.includes("nuvens") || desc.includes("overcast") || desc.includes("clouds")) return 30;
  if (desc.includes("parcialmente nublado") || desc.includes("algumas nuvens") || desc.includes("scattered") || desc.includes("few clouds")) return 20;
  
  return 0;
};

export function HomePage() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [cidadeBusca, setCidadeBusca] = useState("Recife");
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ text: string; sender: 'user' | 'ia' }>>([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const climaDaApi: ClimaAtual = await climaService.buscarClimaAtual(cidadeBusca);

        if (!climaDaApi || climaDaApi.status === 404 || climaDaApi.cod === "404" || climaDaApi.message === "city not found") {
          throw new Error("Cidade não encontrada");
        }

        const previsaoDaApi: PrevisaoItem[] = await climaService.buscarPrevisaoDaSemana(cidadeBusca);

        const nomeCidade: string = climaDaApi.name 
          ? String(climaDaApi.name)
          : climaDaApi.cidade 
          ? String(climaDaApi.cidade)
          : "Cidade Desconhecida";
        let tempBruta: number = climaDaApi.main?.temp ?? climaDaApi.temperatura ?? 0;

        if (tempBruta > 100) {
          tempBruta = tempBruta - 273.15;
        }

        const descricaoAtual = climaDaApi.weather?.[0]?.description ?? climaDaApi.descricao ?? "";

        setWeatherData({
          city: nomeCidade,
          temperature: Math.round(tempBruta),
          condition: mapearCondicao(descricaoAtual),
          icon: getWeatherIcon(descricaoAtual),
        });

        const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
        const datasVistas = new Set<string>();
        const previsaoFiltrada: (PrevisaoItem & { diaFormatado: string })[] = [];

        for (const item of previsaoDaApi) {
          const dataString = String(item.dataHora ?? "").substring(0, 10);

          if (dataString && !datasVistas.has(dataString)) {
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
          (item, index: number) => {
            let tempPrev = item.temperatura;
            if (!tempPrev || tempPrev <= 0) {
              tempPrev = 0;
            } else if (tempPrev > 100) {
              tempPrev = tempPrev - 273.15;
            }

            return {
              day: item.diaFormatado,
              temperature: Math.round(tempPrev),
              condition: mapearCondicao(item.descricao),
              icon: getWeatherIcon(item.descricao ?? ""),
              rainProbability: (() => {
                const prob = calcularProbabilidadeChuva(item.descricao);
                return prob;
              })(),
              isActive: index === 0,
            };
          },
        );

        setForecastData(previsaoParaTela.slice(0, 6));
        setShowErrorPopup(false);

      } catch (error) {
        setShowErrorPopup(true);
      }
    };

    carregarDados();
  }, [cidadeBusca]);

  const handleSearch = (novaCidade: string) => {
    if (novaCidade.trim() !== "") {
      setCidadeBusca(novaCidade);
      setChatMessages([]);
    }
  };

  const handleChatSend = async (message: string) => {
    setChatMessages((prev) => [...prev, { text: message, sender: 'user' }]);
    setIsLoadingChat(true);

    const cidadeAtual = weatherData?.city || "não informada";
    const temperaturaAtual = weatherData?.temperature ? `${weatherData.temperature}°C` : "desconhecida";
    const condicaoAtual = weatherData?.condition || "desconhecida";

    const promptEnriquecido = `Você é um guia turístico e assistente de clima educado, amigável e direto. CONTEXTO: O usuário está em ${cidadeAtual}, a temperatura é de ${temperaturaAtual} com tempo registrado como "${condicaoAtual}". PERGUNTA: "${message}". INSTRUÇÕES: Responda em Português do Brasil de forma natural, simpática e clara. Não seja excessivamente formal (nunca use termos como "Prezado", "Consulente" ou linguagem robótica) e também evite gírias. Traduza os termos meteorológicos (ex: "partly-cloudy" para "parcialmente nublado"). Dê uma recomendação útil baseada no clima e seja conciso na resposta.`;

    try {
      const response = await fetch('https://clima-api-dy98.onrender.com/api/ia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: promptEnriquecido }),
      });

      const data = await response.json();

      let iaResponse: string | undefined;
      try {
        iaResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text
          || data?.result?.candidates?.[0]?.content?.parts?.[0]?.text
          || data?.text
          || data?.response
          || data?.resultado
          || data?.message
          || data?.content;

        if (!iaResponse && typeof data === 'object') {
          const firstKey = Object.keys(data)[0];
          if (firstKey && typeof data[firstKey] === 'string') iaResponse = data[firstKey];
        }
      } catch (err) {
        
      }

      if (!iaResponse) {
        iaResponse = typeof data === 'string' ? data : JSON.stringify(data);
      }

      iaResponse = String(iaResponse).trim();

      setChatMessages((prev) => [...prev, { text: iaResponse || 'Resposta vazia da IA', sender: 'ia' }]);
    } catch (error) {
      setChatMessages((prev) => [...prev, { 
        text: 'Erro ao conectar com a IA. Verifique se o servidor está rodando.', 
        sender: 'ia' 
      }]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-gradient-to-b from-[#1c1c1c] via-[#0a0a0a] to-black flex flex-col pt-12 font-sans overflow-x-hidden relative text-white">
      
      <div className="absolute top-0 left-[-20%] w-[140%] h-100 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-screen"></div>
      <div className="absolute top-[20%] right-[-30%] w-75 h-75 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen"></div>

      {showErrorPopup && (
        <ErrorPopup cityName={cidadeBusca} onClose={() => setShowErrorPopup(false)} />
      )}

      <WeatherEffects condition={weatherData?.condition || 'sunny'} />

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
      
      <div className="rounded-t-[40px] bg-white/5 backdrop-blur-xl border-t border-white/10 mt-auto pt-8 pb-40 relative z-10 w-full shadow-[0_-15px_40px_rgba(0,0,0,0.5)] flex-1 flex flex-col overflow-y-auto">
        <div className="flex flex-col w-full px-6">
          <p className="text-gray-400 font-medium text-sm tracking-wide mb-6">
            Previsão para os próximos 5 dias
          </p>
          
          {weatherData?.alert && <WeatherAlert message={weatherData.alert} />}
          
          {forecastData.length > 0 && (
            <ForecastCarousel forecast={forecastData} />
          )}
          
          <div className="mt-8 border-t border-white/10 pt-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#6D3DB3] animate-pulse"></span>
              <p className="text-gray-300 font-medium text-sm tracking-wide">Assistente Virtual</p>
            </div>
            
            <div className="bg-black/20 rounded-2xl p-4 mb-2 h-72 overflow-y-auto border border-white/5 shadow-inner custom-scrollbar">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2">
                  <p className="text-sm">Como posso ajudar com o seu passeio hoje?</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-4 py-3 text-sm shadow-md ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-[#6D3DB3] to-purple-500 text-white rounded-2xl rounded-tr-sm'
                          : 'bg-white/10 backdrop-blur-md border border-white/10 text-gray-200 rounded-2xl rounded-tl-sm'
                      }`}>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {isLoadingChat && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                        <div className="flex space-x-1.5 items-center h-5">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <ChatInput onSend={handleChatSend} />
          </div>
        </div>
      </div>
      
    </div>
  );
}