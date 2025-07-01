export function flattenObject(
  obj: Record<string, unknown>,
  parentKey = '',
  result: Record<string, unknown> = {},
): Record<string, unknown> {
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    const newKey = parentKey ? `${parentKey}.${key}` : key;

    if (
      typeof obj[key] === 'object' &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      flattenObject(obj[key] as Record<string, unknown>, newKey, result);
    } else {
      result[newKey] = obj[key];
    }
  }
  return result;
}
