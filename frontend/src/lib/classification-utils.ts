import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns'
import { ClassificationSchemeRead } from "@/client/models"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeFormatDate(dateString: string | Date | null | undefined, fallback = 'N/A') {
  try {
    if (!dateString) return fallback
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return isNaN(date.getTime()) ? fallback : format(date, 'PP p')
  } catch {
    return fallback
  }
}

export function formatClassificationValue(value: any): string {
  if (!value) return 'N/A';

  // Handle nested classification structure
  if (typeof value === 'object') {
    // Handle array of objects with nested structure
    if (Array.isArray(value)) {
      return value.map(item => formatClassificationValue(item)).join(', ');
    }

    // Handle object with nested classifications
    return Object.entries(value)
      .map(([key, val]) => {
        // If the value is an array of objects with a single key-value pair
        if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
          return val.map(item => {
            return Object.entries(item)
              .map(([subKey, subVal]) => `${subKey}: ${subVal}`)
              .join(', ');
          }).join('; ');
        }
        return `${key}: ${val}`;
      })
      .join('\n');
  }

  return String(value);
}
