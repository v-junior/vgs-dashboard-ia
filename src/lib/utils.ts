import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const extractWidgetData = (data: any) => {
  if (!data) return [];
  // Pega os valores da primeira chave do objeto 'data' (ex: br.com.bb...)
  const keys = Object.keys(data);
  if (keys.length > 0 && Array.isArray(data[keys[0]])) {
    return data[keys[0]];
  }
  return [];
};
