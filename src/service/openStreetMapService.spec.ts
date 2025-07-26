import { buildQuery, findBestMatch } from './openStreetMapService';

const isProperQueryURL = (url: string) => {
  return (
    url.startsWith('https://nominatim.openstreetmap.org/search?q=') &&
    url.endsWith('&format=json')
  );
};

describe('OpenStreetMapService', () => {
  describe('buildQuery', () => {
    it('should build correct URL for the given example', () => {
      const address = '1600 Amphitheatre Parkway, Mountain View, CA';
      const expected =
        'https://nominatim.openstreetmap.org/search?q=1600%20Amphitheatre%20Parkway%2C%20Mountain%20View%2C%20CA&format=json';

      const result = buildQuery(address);

      expect(result).toBe(expected);
    });

    it('should properly encode special characters in address', () => {
      const address = '123 Main St & Oak Ave, New York, NY 10001';
      const result = buildQuery(address);

      expect(result).toContain(
        '123%20Main%20St%20%26%20Oak%20Ave%2C%20New%20York%2C%20NY%2010001',
      );
      expect(result).toContain('format=json');
      expect(isProperQueryURL(result)).toStrictEqual(true);
    });

    it('should handle empty string', () => {
      const address = '';
      const expected =
        'https://nominatim.openstreetmap.org/search?q=&format=json';

      const result = buildQuery(address);

      expect(result).toBe(expected);
    });

    it('should handle addresses with unicode characters', () => {
      const address = 'Champs-Élysées, Paris, France';
      const result = buildQuery(address);

      expect(result).toContain('Champs-%C3%89lys%C3%A9es');
      expect(result).toContain('format=json');
      expect(isProperQueryURL(result)).toStrictEqual(true);
    });

    it('should always include format=json parameter', () => {
      const address = 'Any Address';
      const result = buildQuery(address);

      expect(result).toContain('format=json');
    });

    it('should return string type', () => {
      const address = 'Test Address';
      const result = buildQuery(address);

      expect(typeof result).toBe('string');
    });

    it('should handle addresses with multiple spaces', () => {
      const address = '123    Main    Street,    City,    State';
      const result = buildQuery(address);

      expect(result).toContain('123%20%20%20%20Main%20%20%20%20Street');
      expect(isProperQueryURL(result)).toStrictEqual(true);
    });
  });

  describe('findBestMatch', () => {
    it('should return the result with highest importance from the given payload', () => {
      const payload = [
        {
          addresstype: 'building',
          boundingbox: [
            '37.4221124',
            '37.4228508',
            '-122.0859868',
            '-122.0851511',
          ],
          class: 'building',
          display_name:
            'Google Building 41, 1600, Amphitheatre Parkway, Mountain View, Santa Clara County, California, 94043, United States',
          importance: 6.277943083843774e-5,
          lat: '37.4224857',
          licence:
            'Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright',
          lon: '-122.0855846',
          name: 'Google Building 41',
          osm_id: 23733659,
          osm_type: 'way',
          place_id: 298531695,
          place_rank: 30,
          type: 'commercial',
        },
        {
          addresstype: 'office',
          boundingbox: [
            '37.4217136',
            '37.4218136',
            '-122.0846640',
            '-122.0845640',
          ],
          class: 'office',
          display_name: 'Some other address which is definitely not Google',
          importance: 6.277943083843774e-6,
          lat: '37.4217636',
          licence:
            'Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright',
          lon: '-122.0846140',
          name: 'Google Headquarters',
          osm_id: 2192620021,
          osm_type: 'node',
          place_id: 298610557,
          place_rank: 30,
          type: 'it',
        },
      ];

      const result = findBestMatch(payload);

      expect(result).toBeDefined();
      expect(['Google Building 41', 'Google Headquarters']).toContain(
        result?.name,
      );
    });

    it('should return null for empty array', () => {
      const result = findBestMatch([]);

      expect(result).toBeNull();
    });
  });
});
