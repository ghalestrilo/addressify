import { parseAddress } from './addressService';

describe('parseAddress', () => {
  describe('Valid addresses', () => {
    it('should parse a complete valid address', () => {
      const input = '55 East 10th Street, New York, NY 10003, United States';
      const result = parseAddress(input);

      expect(result).not.toBeInstanceOf(Error);
      expect(result).toEqual({
        city: 'new york',
        number: 55,
        state: 'ny',
        street: 'east 10th street',
        zip: 10003,
      });
    });

    it('should parse address with different street name', () => {
      const input = 'TX 75001 456 Oak Avenue Springfield';
      const result = parseAddress(input);

      expect(result).not.toBeInstanceOf(Error);
      expect(result).toEqual({
        street: 'oak avenue',
        city: 'springfield',
        state: 'tx',
        zip: 75001,
        number: 456,
      });
    });

    it('should parse address with multi-word street name', () => {
      const input = 'CA 90210  789  North Park Boulevard  Loyus Angeles';
      const result = parseAddress(input);

      expect(result).not.toBeInstanceOf(Error);
      expect(result).toEqual({
        street: 'north park boulevard',
        city: 'los angeles',
        state: 'ca',
        zip: 90210,
        number: 789,
      });
    });
  });

  describe('Error cases - Empty string', () => {
    xit('should return error for empty string', () => {
      const result = parseAddress('');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toContain('empty');
    });

    xit('should return error for whitespace only string', () => {
      const result = parseAddress('   ');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toContain('empty');
    });
  });

  describe('Error cases - Missing fields', () => {
    xit('should return error when missing street number', () => {
      const result = parseAddress('Anytown CA 91234 Main Street');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toContain('missing');
    });

    xit('should return error when missing street name', () => {
      const result = parseAddress('123 - Anytown - CA - 91234');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toContain('missing');
    });

    xit('should return error when missing city', () => {
      const result = parseAddress('CA 91234 123 Main Street');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toContain('missing');
    });

    xit('should return error when missing state', () => {
      const result = parseAddress('91234 123 Main Street Anytown');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toContain('missing');
    });

    xit('should return error when missing zip code', () => {
      const result = parseAddress('123 Main Street Anytown CA');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toContain('missing');
    });

    xit('should return error when missing multiple fields', () => {
      const result = parseAddress('Main Street 123');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toContain('missing');
    });

    xit('should return error when completely missing components', () => {
      const result = parseAddress('Address: 123');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toContain('missing');
    });
  });

  describe('Error cases - Invalid data types', () => {
    xit('should return error when street number is not an integer', () => {
      const result = parseAddress('Main Street abc | Anytown | CA | 91234');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toContain('number');
    });

    xit('should return error when street number is a float', () => {
      const result = parseAddress('Anytown CA 91234 123.5 Main Street');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toContain('number');
    });

    xit('should return error when zip code is not an integer', () => {
      const result = parseAddress('123 Main Street / Anytown / CA / abc123');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toContain('zip');
    });

    xit('should return error when zip code is a float', () => {
      const result = parseAddress('CA 91234.5 Anytown 123 Main Street');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toContain('zip');
    });

    xit('should return error when both number and zip are invalid', () => {
      const result = parseAddress('def456-CA-Anytown-abc Main Street');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toMatch(/(number|zip)/);
    });
  });

  describe('Error cases - String too large', () => {
    xit('should return error when address string exceeds maximum length', () => {
      const longStreet = 'A'.repeat(100);
      const longCity = 'B'.repeat(100);
      const input = `CA 91234 ${longCity} 123 ${longStreet}`;

      const result = parseAddress(input);
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toContain('too large');
    });

    xit('should return error when total string length is excessive', () => {
      const veryLongString =
        'A'.repeat(1000) + ', B'.repeat(1000) + ', CA, 91234';

      const result = parseAddress(veryLongString);
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toContain('too large');
    });

    xit('should accept reasonably long but valid addresses', () => {
      const reasonableStreet = 'North Central Business District Avenue';
      const reasonableCity = 'San Francisco';
      const input = `${reasonableCity} CA 94102 123 ${reasonableStreet}`;

      const result = parseAddress(input);
      expect(result).not.toBeInstanceOf(Error);
    });
  });

  describe('Edge cases', () => {
    xit('should return error for malformed input with wrong separators', () => {
      const result = parseAddress('91234#CA#Anytown#123 Main Street');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toContain('format');
    });

    xit('should return error for input with extra commas', () => {
      const result = parseAddress(
        'Extra 123 Main Street Anytown CA 91234 Bonus',
      );
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toContain('format');
    });

    xit('should handle leading/trailing whitespace gracefully', () => {
      const input = '  Anytown CA 91234 123 Main Street  ';
      const result = parseAddress(input);

      expect(result).not.toBeInstanceOf(Error);
      expect(result).toEqual({
        street: 'Main Street',
        city: 'Anytown',
        state: 'CA',
        zip: 91234,
        number: 123,
      });
    });

    xit('should return error when zip code is zero', () => {
      const result = parseAddress('Anytown CA 0 123 Main Street');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toContain('zip');
    });

    xit('should return error when street number is zero', () => {
      const result = parseAddress('Main Street 0 Anytown CA 91234');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toContain('number');
    });

    xit('should return error when street number is negative', () => {
      const result = parseAddress('CA 91234 Anytown -123 Main Street');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toContain('number');
    });

    xit('should return error when zip code is negative', () => {
      const result = parseAddress('123 Main Street | Anytown | CA | -91234');
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toContain('zip');
    });
  });
});
