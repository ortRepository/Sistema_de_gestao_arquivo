// src/services/apiClient.ts

import { getCache } from "@/lib/Cache";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { reLogin } from "./authService";

/**
 * Define os métodos HTTP permitidos.
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * Função genérica para realizar requisições utilizando o fetch.
 *
 * @param url - Endpoint da API (concatenado com a baseURL)
 * @param method - Método HTTP (padrão: GET)
 * @param data - Dados para envio (usado em POST ou PUT)
 * @param extraHeaders - Cabeçalhos adicionais para a requisição
 * @returns Promise com o resultado parseado em JSON
 */

export async function apiRequest<T>(
  url: string,
  method: HttpMethod = "GET",
  data?: any,
  extraHeaders?: Record<string, string>,
  retry: boolean = false,
  autoRefreshOn401: boolean = false
): Promise<T> {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const token = await getCache("token");

  // Verifica se a URL é externa (absoluta)
  const isExternal = url.startsWith("http://") || url.startsWith("https://");

  // Define os headers de acordo com o tipo de dados e se a requisição é interna ou externa
  const headers: Record<string, string> = {
    ...(data instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(!isExternal && token ? { token: token } : {}),
    ...extraHeaders,
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (data && method !== "GET") {
    if (data instanceof FormData) {
      if (!isExternal) {
        data.append("token", token || "");
      }
      options.body = data;
    } else {
      const bodyData = !isExternal ? { ...data, token } : data;
      options.body = JSON.stringify(bodyData);
    }
  }
  // For DELETE requests, always send a JSON body, even if data is provided
  if (method === "DELETE") {
    options.body = JSON.stringify(data || {});
  }

  // Se a URL não for externa, adiciona a baseURL
  const finalUrl = isExternal ? url : `${baseURL}${url}`;

  try {
    const response = await fetch(finalUrl, options);
    if (response.status === 401 && autoRefreshOn401 && !retry) {
      // token expirou: tenta re-login
      try {
        await reLogin();
        return apiRequest<T>(url, method, data, extraHeaders, true, true);
      } catch (err) {
        // se falhar no re-login, propaga erro para a UI (ela pode redirecionar ao login)
        throw new Error("Sessão expirada, por favor faça login novamente.");
      }
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(errorBody?.message || `Erro ${response.status}`);
    }
    return response.json();
  } catch (error: any) {
    console.error(`Erro ao requisitar ${method} ${url}:`, error);

    throw error;
  }
}

/**
 * Hook para requisições GET utilizando o react-query.
 *
 * @param queryKey - Chave para identificar a query no cache
 * @param url - URL da API para realizar a requisição GET
 * @param enabled - Flag para habilitar ou não a execução da query (padrão: true)
 * @returns Objeto contendo os dados, status e métodos da query
 */
export function useApiQuery<T>(
  queryKey: any[],
  url: string,
  enabled: boolean = true,
  autoRefreshOn401: boolean = false
) {
  return useQuery<T>({
    queryKey,
    queryFn: () =>
      apiRequest<T>(url, "GET", undefined, {}, false, autoRefreshOn401),
    enabled,
  });
}

/**
 * Hook para requisições de mutação (POST, PUT, DELETE) utilizando o react-query.
 *
 * @param method - Método HTTP para a requisição de mutação
 * @param url - URL da API para a mutação
 * @param onSuccessCallback - Callback opcional a ser executado após o sucesso da mutação
 * @returns Objeto com as funções e estados da mutação
 */
export function useApiMutation<T, U = unknown>(
  method: HttpMethod,
  url: string,
  onSuccessCallback?: () => void
): UseMutationResult<T, Error, U> {
  // Obtém a instância do queryClient para poder invalidar queries após a mutação
  const queryClient = useQueryClient();

  return useMutation<T, Error, U>({
    // Função que executa a requisição utilizando a apiRequest
    mutationFn: (data: U) => apiRequest<T>(url, method, data),
    onSuccess: () => {
      // Invalida todas as queries para que os dados sejam recarregados
      queryClient.invalidateQueries();
      // Executa o callback de sucesso, se fornecido
      if (onSuccessCallback) onSuccessCallback();
    },
  });
}
