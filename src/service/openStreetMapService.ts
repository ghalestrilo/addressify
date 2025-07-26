const baseURL = 'https://nominatim.openstreetmap.org/search';

export interface OpenStreetMapResult {
  addresstype: string;
  boundingbox: string[];
  class: string;
  display_name: string;
  importance: number;
  lat: string;
  licence: string;
  lon: string;
  name: string;
  osm_id: number;
  osm_type: string;
  place_id: number;
  place_rank: number;
  type: string;
}

export const buildQuery = (address: string): string => {
  const encodedAddress = encodeURIComponent(address);
  return `${baseURL}?q=${encodedAddress}&format=json`;
};

export const fetchAddressData = async (
  address: string,
): Promise<OpenStreetMapResult[]> => {
  const response = await fetch(buildQuery(address));
  const data = (await response.json()) as OpenStreetMapResult[];
  return data;
};

export const findBestAddressMatch = (
  options: OpenStreetMapResult[],
): OpenStreetMapResult | null => {
  if (!options || options.length === 0) {
    return null;
  }

  return options.sort((a, b) => b.importance - a.importance)[0];
};
