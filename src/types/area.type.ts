export interface City {
  id: string;
  name: string;
}

export interface AreaCount {
  properties: number;
}

export interface Area {
  id: string;
  name: string;
  cityId: string;
  city: City;
  _count?: AreaCount;
}

export interface AreaQuery {
  cityId?: string;
  search?: string;
  page?: number;
  limit?: number;
}
