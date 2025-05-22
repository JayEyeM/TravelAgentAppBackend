// File: src/handyTools/BasicCommissionCalculator/types.ts

// Converts camelCase string to snake_case string
export const camelToSnake = (str: string): string =>
  str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

// Converts an object with camelCase keys to snake_case keys
export const convertKeysToSnakeCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => convertKeysToSnakeCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = camelToSnake(key);
      result[snakeKey] = convertKeysToSnakeCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
};
