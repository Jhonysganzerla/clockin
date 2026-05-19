export interface User {
  id: number | null;
  login: string;
  nome: string;
  senha?: string;
  horames: number;
  horadia: number;
  admin: boolean;
}
