export const fmt = (val: unknown, digits = 2, fallback = 'N/A'): string => {
  if (typeof val === 'number' && Number.isFinite(val)) {
    return val.toFixed(digits);
  }
  if (typeof val === 'string') {
    const num = Number(val);
    if (Number.isFinite(num)) return num.toFixed(digits);
  }
  return fallback;
}; 