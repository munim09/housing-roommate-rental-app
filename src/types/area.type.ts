/** Area as embedded in `GET /cities` — no counts, just the identity fields. */
export interface CityArea {
  id: string;
  name: string;
  createdAt?: string;
}

export interface City {
  id: string;
  name: string;
  createdAt?: string;
  /** Only `GET /cities` hydrates the nested list. */
  areas?: CityArea[];
}

export interface AreaCount {
  properties: number;
}

export interface Area {
  id: string;
  name: string;
  cityId: string;
  city: City;
  createdAt?: string;
  _count?: AreaCount;
}

export interface CityQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export interface AreaQuery {
  cityId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/** Payload for `POST /admin/cities`. */
export interface CreateCityInput {
  name: string;
}

/** Payload for `POST /admin/areas`. */
export interface CreateAreaInput {
  cityId: string;
  name: string;
}
