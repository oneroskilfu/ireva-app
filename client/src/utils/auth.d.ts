declare module '../utils/auth' {
  export function getToken(): string | null;
  export function setToken(token: string): void;
  export function logout(): void;
  export function isAuthenticated(): boolean;
  export function configureAxiosAuth(axios: any): void;
  export function decodeToken(token: string): any;
  export function getUserFromToken(): any;
}

declare module './utils/auth' {
  export function getToken(): string | null;
  export function setToken(token: string): void;
  export function logout(): void;
  export function isAuthenticated(): boolean;
  export function configureAxiosAuth(axios: any): void;
  export function decodeToken(token: string): any;
  export function getUserFromToken(): any;
}