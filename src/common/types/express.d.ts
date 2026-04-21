// Tipo local para evitar el error TS1272 con isolatedModules
// al usar @CurrentUser() en controladores decorados
export interface RequestUser {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
}
