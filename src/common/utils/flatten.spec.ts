import { flattenObject } from './flatten';

describe('flattenObject', () => {
  it('should flatten a simple nested object', () => {
    const input = {
      user: {
        name: 'John',
        age: 25,
      },
    };

    const output = flattenObject(input);

    expect(output).toEqual({
      'user.name': 'John',
      'user.age': 25,
    });
  });

  it('should handle deeply nested objects', () => {
    const input = {
      user: {
        profile: {
          info: {
            firstname: 'Ana',
          },
        },
      },
    };

    const output = flattenObject(input);

    expect(output).toEqual({
      'user.profile.info.firstname': 'Ana',
    });
  });

  it('should ignore array values (treat them as primitives)', () => {
    const input = {
      recipe: {
        ingredients: ['tomato', 'cheese'],
        steps: [{ order: 1, text: 'Mix' }],
      },
    };

    const output = flattenObject(input);

    expect(output).toEqual({
      'recipe.ingredients': ['tomato', 'cheese'],
      'recipe.steps': [{ order: 1, text: 'Mix' }],
    });
  });

  it('should flatten multiple branches correctly', () => {
    const input = {
      user: {
        name: { first: 'Luis', last: 'Pérez' },
        settings: { theme: 'dark' },
      },
    };

    const output = flattenObject(input);

    expect(output).toEqual({
      'user.name.first': 'Luis',
      'user.name.last': 'Pérez',
      'user.settings.theme': 'dark',
    });
  });

  it('should handle null values', () => {
    const input = {
      user: {
        name: null,
        data: {
          age: 30,
        },
      },
    };

    const output = flattenObject(input);

    expect(output).toEqual({
      'user.name': null,
      'user.data.age': 30,
    });
  });

  it('should return an empty object when given an empty object', () => {
    const input = {};
    const output = flattenObject(input);
    expect(output).toEqual({});
  });

  it('should not modify the original object', () => {
    const input = {
      user: {
        name: 'Maria',
      },
    };

    const inputClone = structuredClone(input);

    flattenObject(input);

    expect(input).toEqual(inputClone);
  });

  it('should work with primitive top-level values', () => {
    const input = { a: 1, b: 'text', c: true };

    const output = flattenObject(input);

    expect(output).toEqual({
      a: 1,
      b: 'text',
      c: true,
    });
  });

  it('should handle mixed objects with arrays, primitives and nested objects', () => {
    const input = {
      user: {
        name: { first: 'Ana' },
        tags: ['chef', 'vegan'],
        active: true,
        stats: {
          recipes: 12,
        },
      },
    };

    const output = flattenObject(input);

    expect(output).toEqual({
      'user.name.first': 'Ana',
      'user.tags': ['chef', 'vegan'],
      'user.active': true,
      'user.stats.recipes': 12,
    });
  });
});
