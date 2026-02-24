import { formatDate, formatCurrency, isValidEmail, generateId } from '../utils';

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('formats date string correctly', () => {
      const result = formatDate('2024-02-24');
      expect(result).toContain('2024');
    });

    it('formats Date object correctly', () => {
      const date = new Date('2024-02-24');
      const result = formatDate(date);
      expect(result).toContain('2024');
    });
  });

  describe('formatCurrency', () => {
    it('formats number as PHP currency', () => {
      const result = formatCurrency(1000);
      expect(result).toContain('1,000');
    });

    it('formats decimal amounts correctly', () => {
      const result = formatCurrency(99.99);
      expect(result).toContain('99');
    });
  });

  describe('isValidEmail', () => {
    it('returns true for valid email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('returns false for invalid email', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(id1.length).toBeGreaterThan(10);
    });
  });
});
