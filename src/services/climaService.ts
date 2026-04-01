import { api } from './api';
import type { ClimaAtual, PrevisaoItem } from '../types';

export const climaService = {
  buscarClimaAtual: async (cidade: string): Promise<ClimaAtual> => {
    const response = await api.get<ClimaAtual>(`/clima/${cidade}`);
    return response.data;
  },

  buscarPrevisaoDaSemana: async (cidade: string): Promise<PrevisaoItem[]> => {
    const response = await api.get<PrevisaoItem[]>(`/previsao/${cidade}`);
    return response.data;
  }
};