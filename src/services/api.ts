import { getToken, clearAll } from './storage';

const BASE_URL = 'http://129.211.94.83:5001/api';

async function request<T>(
  method: string,
  path: string,
  data?: Record<string, any>
): Promise<T> {
  const token = await getToken();
  const url = BASE_URL + path;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  const options: RequestInit = {
    method,
    headers,
  };
  if (data !== undefined) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (response.status === 401) {
    await clearAll();
    throw new Error('Unauthorized');
  }

  const result = await response.json() as Record<string, any>;

  if (response.ok) {
    if (result['data'] !== undefined) {
      return result['data'] as T;
    }
    return result as T;
  }

  const msg = result['message'] || result['error'] || 'HTTP ' + response.status;
  throw new Error(msg);
}

export async function get<T>(path: string): Promise<T> {
  return request<T>('GET', path);
}

export async function post<T>(path: string, data: Record<string, any>): Promise<T> {
  return request<T>('POST', path, data);
}

export async function put<T>(path: string, data: Record<string, any>): Promise<T> {
  return request<T>('PUT', path, data);
}

export async function del<T>(path: string): Promise<T> {
  return request<T>('DELETE', path);
}
