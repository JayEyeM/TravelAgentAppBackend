// File path: src/utils/caseConverter2.ts


// Converts camelCase to snake_case
export function camelToSnake2(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(camelToSnake2);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key.replace(/([A-Z])/g, "_$1").toLowerCase(),
        camelToSnake2(value),
      ])
    );
  }
  return obj;
}

// Converts snake_case to camelCase
export function snakeToCamel2(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel2);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key.replace(/_([a-z])/g, (_, g1) => g1.toUpperCase()),
        snakeToCamel2(value),
      ])
    );
  }
  return obj;
}
