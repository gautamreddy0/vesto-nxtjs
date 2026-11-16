export const PITCH_MAX_CHARS = 6_000;

export function limitPitchText(value: string) {
  return value.length > PITCH_MAX_CHARS ? value.slice(0, PITCH_MAX_CHARS) : value;
}

export function countPitchWords(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}
