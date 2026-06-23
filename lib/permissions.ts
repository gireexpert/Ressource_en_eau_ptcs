export const ROLE_PUBLIC = "Public";
export const ROLE_COLLECTEUR = "Collecteur";
export const ROLE_DNH = "DNH/DRHK";
export const ROLE_ADMIN = "Administrateur PTCS";

export function canViewInternal(role?: string) {
  return [ROLE_COLLECTEUR, ROLE_DNH, ROLE_ADMIN].includes(role || ROLE_PUBLIC);
}
export function canAccessDashboard(role?: string) {
  return [ROLE_DNH, ROLE_ADMIN].includes(role || ROLE_PUBLIC);
}
export function canAccessObservatoire(role?: string) {
  return role === ROLE_ADMIN;
}
export function canAccessReports(role?: string) {
  return [ROLE_DNH, ROLE_ADMIN].includes(role || ROLE_PUBLIC);
}
export function canExportCsvXlsx(role?: string) {
  return [ROLE_DNH, ROLE_ADMIN].includes(role || ROLE_PUBLIC);
}
export function canExportAdvanced(role?: string) {
  return role === ROLE_ADMIN;
}
export function canSync(role?: string) {
  return [ROLE_DNH, ROLE_ADMIN].includes(role || ROLE_PUBLIC);
}
export function canManageUsers(role?: string) {
  return role === ROLE_ADMIN;
}
