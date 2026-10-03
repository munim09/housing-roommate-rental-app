import apiClient, { cleanParams } from "@/lib/api-client";
import type {
  ApiResponse,
  Area,
  AreaQuery,
  City,
  CityQuery,
  CreateAreaInput,
  CreateCityInput,
} from "@/types";

/** `GET /areas` — public, no auth. `cityId` narrows to a single city. */
export function getAreas(params: AreaQuery) {
  return apiClient<ApiResponse<Area[]>>("/areas", {
    params: cleanParams(params),
  });
}

/** `GET /cities` — public, no auth. Each city carries its `areas`. */
export function getCities(params: CityQuery) {
  return apiClient<ApiResponse<City[]>>("/cities", {
    params: cleanParams(params),
  });
}

/** `POST /admin/cities` — admin only. */
export function createCity(payload: CreateCityInput) {
  return apiClient<ApiResponse<City>>("/admin/cities", {
    method: "POST",
    body: payload,
  });
}

/** `POST /admin/areas` — admin only. */
export function createArea(payload: CreateAreaInput) {
  return apiClient<ApiResponse<Area>>("/admin/areas", {
    method: "POST",
    body: payload,
  });
}
