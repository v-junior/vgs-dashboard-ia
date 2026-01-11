export function formatNumber(value: number | string | null | undefined, format?: string): string {
  if (value === null || value === undefined) return '-';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return String(value);
  
  // Handle percentage format
  if (format === '0.00%' || format?.includes('%')) {
    return `${numValue.toFixed(2)}%`;
  }
  
  // Handle abbreviated format (K, M, B)
  if (format === '0.000a' || format === '0.00a' || format === 'abbreviated') {
    return abbreviateNumber(numValue);
  }
  
  // Handle decimal format
  if (format === '0.00') {
    return numValue.toFixed(2);
  }
  
  // Handle time format (seconds to readable)
  if (format === 'time' || format === 'duration') {
    return formatDuration(numValue);
  }
  
  // Default: abbreviate large numbers
  if (Math.abs(numValue) >= 1000) {
    return abbreviateNumber(numValue);
  }
  
  return numValue.toLocaleString('pt-BR');
}

export function abbreviateNumber(value: number): string {
  const absValue = Math.abs(value);
  
  if (absValue >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (absValue >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (absValue >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  
  return value.toFixed(2);
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(0)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return `${hours}h ${remainingMinutes}m`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  } catch {
    return dateString;
  }
}

export function formatFullDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function getDataFromWidget(data: Record<string, unknown[]>): unknown[] {
  // Get the first available key in data (dynamic package name)
  const keys = Object.keys(data);
  if (keys.length === 0) return [];
  return data[keys[0]] || [];
}

export function parseYFields(yField: string): string[] {
  return yField.split(',').map(f => f.trim());
}
