// src/services/apiClient.ts

import { getCache } from "@/lib/Cache";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";

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

/**
 * Generic API request helper with Bearer token authentication and path-parameter substitution
 */
export async function apiRequest<T>(
  url: string,
  method: HttpMethod = "GET",
  data?: Record<string, any> | FormData,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const token = await getCache("token");

  // Substitute any path parameters (e.g., /departments/{idDepartment}) using keys from data
  let endpoint = url;
  if (data && !(data instanceof FormData)) {
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      if (endpoint.includes(placeholder)) {
        // Replace all occurrences of the placeholder
        endpoint = endpoint
          .split(placeholder)
          .join(encodeURIComponent(String(value)));
        delete data[key];
      }
    });
  }

  const isExternal =
    endpoint.startsWith("http://") || endpoint.startsWith("https://");

  // Build headers
  const headers: Record<string, string> = {
    ...(data instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(!isExternal && token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };

  const options: RequestInit = { method, headers };

  // Attach body for POST, PUT, DELETE, PATCH
  if (data && method !== "GET") {
    if (data instanceof FormData) {
      options.body = data;
    } else {
      options.body = JSON.stringify(data);
    }
  }

  const finalUrl = isExternal ? endpoint : `${baseURL}${endpoint}`;

  try {
    const response = await fetch(finalUrl, options);
    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(errorBody?.message || `Error ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error on ${method} ${finalUrl}:`, error);
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
  enabled: boolean = true
) {
  return useQuery<T>({
    queryKey,
    queryFn: () => apiRequest<T>(url, "GET"),
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
export function useApiMutation<
  T,
  U extends Record<string, any> | FormData = Record<string, any>
>(
  method: HttpMethod,
  url: string,
  onSuccessCallback?: () => void
): UseMutationResult<T, Error, U> {
  const queryClient = useQueryClient();

  return useMutation<T, Error, U>({
    mutationFn: (data: U) => apiRequest<T>(url, method, data),
    onSuccess: () => {
      queryClient.invalidateQueries();
      if (onSuccessCallback) onSuccessCallback();
    },
  });
}
