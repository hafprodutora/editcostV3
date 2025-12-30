
export const formatCurrency = (value: number, currency: string = 'BRL') => {
  const safeValue = isNaN(value) || value === null || value === undefined ? 0 : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(safeValue);
};

export const formatTime = (seconds: number) => {
  const safeSeconds = isNaN(seconds) ? 0 : seconds;
  const h = Math.floor(safeSeconds / 3600);
  const m = Math.floor((safeSeconds % 3600) / 60);
  const s = safeSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const formatMinutesToDisplay = (seconds: number) => {
  const safeSeconds = isNaN(seconds) ? 0 : seconds;
  const m = Math.floor(safeSeconds / 60);
  const s = safeSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};
