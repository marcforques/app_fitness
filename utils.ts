
export const calculate1RM = (weight: number, reps: number): number => {
  if (reps === 1) return weight;
  // Epley formula: 1RM = weight * (1 + reps / 30)
  return weight * (1 + reps / 30);
};

export const formatTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  const s = Math.floor((minutes * 60) % 60);
  return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
};

export const formatDate = (dateStr: string): string => {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  }).format(new Date(dateStr));
};

export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
