/** `GET /manager/dashboard` — the stat block for the manager home. */
export interface ManagerDashboardStats {
  totalAssignedFlats: number;
  activeAdvertisements: number;
  rentCollectionThisMonth: number;
  utilityCollectionThisMonth: number;
}
