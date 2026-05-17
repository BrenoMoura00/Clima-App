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
  
  console.log("Descrição:", descricao, "Probabilidade calculada: 0");
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
                console.log("Item descrição:", item.descricao, "Probabilidade:", prob);
                return prob;
              })(),
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

  const handleChatSend = async (message: string) => {
    setChatMessages((prev) => [...prev, { text: message, sender: 'user' }]);
    setIsLoadingChat(true);

    try {
      const response = await fetch('http://localhost:8080/api/ia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: message }),
      });

      const data = await response.json();
      console.log('Resposta da IA:', data);

      // Tenta extrair o texto da resposta (suporta formato Gemini-like com candidates)
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
          // tenta caminhos alternativos em respostas aninhadas
          const firstKey = Object.keys(data)[0];
          if (firstKey && typeof data[firstKey] === 'string') iaResponse = data[firstKey];
        }
      } catch (err) {
        console.warn('Erro ao extrair resposta da IA:', err);
      }

      if (!iaResponse) {
        iaResponse = typeof data === 'string' ? data : JSON.stringify(data);
      }

      // Limitar comprimento e formatar quebras de linha
      iaResponse = String(iaResponse).trim();

      setChatMessages((prev) => [...prev, { text: iaResponse || 'Resposta vazia da IA', sender: 'ia' }]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setChatMessages((prev) => [...prev, { 
        text: 'Erro ao conectar com a IA. Verifique se o servidor está rodando.', 
        sender: 'ia' 
      }]);
    } finally {
      setIsLoadingChat(false);
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
      <div className="rounded-t-[40px] bg-white/5 backdrop-blur-xl border-t border-white/10 mt-auto pt-8 pb-40 relative z-10 w-full shadow-[0_-15px_40px_rgba(0,0,0,0.5)] flex-1 flex flex-col overflow-y-auto">
        <div className="flex flex-col w-full px-6">
          <p className="text-gray-400 font-medium text-sm tracking-wide mb-6">
            Previsão para os próximos 5 dias
          </p>
          
          {weatherData?.alert && <WeatherAlert message={weatherData.alert} />}
          
          {forecastData.length > 0 && (
            <ForecastCarousel forecast={forecastData} />
          )}
          
          {/* Seção de Chat */}
          <div className="mt-12 border-t border-white/10 pt-6">
            <p className="text-gray-400 font-medium text-sm tracking-wide mb-4">Chat com IA</p>
            <div className="bg-white/5 rounded-lg p-4 mb-4 h-64 overflow-y-auto">
              {chatMessages.length === 0 ? (
                <p className="text-gray-500 text-center text-sm">Comece uma conversa...</p>
              ) : (
                <div className="space-y-3">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs rounded-lg px-4 py-2 ${
                        msg.sender === 'user'
                          ? 'bg-[#6D3DB3] text-white'
                          : 'bg-white/10 text-gray-300'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {isLoadingChat && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 rounded-lg px-4 py-2">
                        <p className="text-sm text-gray-400">IA está digitando...</p>
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