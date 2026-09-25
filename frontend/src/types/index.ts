export interface User {
  id?: string;
  name: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: User;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}
