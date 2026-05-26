export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  username: string;
}

export interface UserInfo {
  id: number;
  username: string;
}

export interface Employee {
  id?: number;
  name: string;
  age: number;
  email: string;
  created_at?: string;
}

export interface Category {
  id?: number;
  name: string;
  device_count?: number;
  created_at?: string;
}

export interface Device {
  id?: number;
  name: string;
  model: string;
  category_id: number;
  category_name?: string;
  status: string;
  employee_name?: string;
  asset_number?: string;
  created_at?: string;
}
