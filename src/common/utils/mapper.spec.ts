import { Mapper } from './mapper';

class UserResponseDto {
  id!: string;
  name!: string;
}

describe('Mapper utility', () => {
  describe('toResponse', () => {
    it('should map a plain object to a DTO instance', () => {
      const entity = { id: '123', name: 'John' };

      const result = Mapper.toResponse(UserResponseDto, entity);

      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result).toEqual({
        id: '123',
        name: 'John',
      });
    });

    it('should map an object with a toObject() method (mongoose document)', () => {
      const entity = {
        id: '456',
        name: 'Ana',
        toObject: () => ({ id: '456', name: 'Ana' }),
      };

      const result = Mapper.toResponse(UserResponseDto, entity);

      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result).toEqual({
        id: '456',
        name: 'Ana',
      });
    });

    it('should not mutate the original entity', () => {
      const entity = { id: '789', name: 'Maria' };

      const clone = structuredClone(entity);

      Mapper.toResponse(UserResponseDto, entity);

      expect(entity).toEqual(clone);
    });

    it('should handle nested objects inside the entity', () => {
      class NestedDto {
        a!: { b: number };
      }

      const entity = {
        a: { b: 10 },
      };

      const result = Mapper.toResponse(NestedDto, entity);

      expect(result).toBeInstanceOf(NestedDto);
      expect(result.a).toEqual({ b: 10 });
    });
  });

  describe('toResponseMany', () => {
    it('should map an array of plain objects', () => {
      const entities = [
        { id: '1', name: 'Luis' },
        { id: '2', name: 'Carlos' },
      ];

      const result = Mapper.toResponseMany(UserResponseDto, entities);

      expect(result.length).toBe(2);
      expect(result[0]).toBeInstanceOf(UserResponseDto);
      expect(result[1]).toBeInstanceOf(UserResponseDto);
      expect(result).toEqual([
        { id: '1', name: 'Luis' },
        { id: '2', name: 'Carlos' },
      ]);
    });

    it('should map an array with toObject() documents', () => {
      const entities = [
        {
          id: '100',
          name: 'Eva',
          toObject: () => ({ id: '100', name: 'Eva' }),
        },
        {
          id: '101',
          name: 'Sergio',
          toObject: () => ({ id: '101', name: 'Sergio' }),
        },
      ];

      const result = Mapper.toResponseMany(UserResponseDto, entities);

      expect(result.length).toBe(2);
      expect(result[0]).toBeInstanceOf(UserResponseDto);
      expect(result[1]).toBeInstanceOf(UserResponseDto);

      expect(result).toEqual([
        { id: '100', name: 'Eva' },
        { id: '101', name: 'Sergio' },
      ]);
    });

    it('should return an empty array if given an empty list', () => {
      const result = Mapper.toResponseMany(UserResponseDto, []);

      expect(result).toEqual([]);
    });
  });
});
