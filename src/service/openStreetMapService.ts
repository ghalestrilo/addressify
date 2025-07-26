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
): Promise<OpenStreetMapResult | null> => {
  const query = buildQuery(address);
  console.log(query);
  const response = await fetch(query, {
    headers: {
      'User-Agent': 'Addressify/1.0 (Contact: your-email@example.com)',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Nominatim API error: ${response.status} ${response.statusText}`,
    );
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(
      `Expected JSON response but got: ${contentType}. Response: ${text.substring(0, 200)}...`,
    );
  }

  const data = (await response.json()) as OpenStreetMapResult[];
  return findBestAddressMatch(data);
};

export const findBestAddressMatch = (
  options: OpenStreetMapResult[],
): OpenStreetMapResult | null => {
  if (!options || options.length === 0) {
    return null;
  }

  return options.sort((a, b) => b.importance - a.importance)[0];
};
