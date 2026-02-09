
import { DayType, OTLine } from '../types';

export const calculateHourlyRate = (basicSalary: number): number => {
  // Formula: (12 * Gaji Pokok) / (313 * 8)
  const rate = (12 * basicSalary) / 2504;
  return Math.round(rate * 100) / 100;
};

export const calculateMaxOTLimit = (basicSalary: number): number => {
  return Math.round((basicSalary / 3) * 100) / 100;
};

const timeToDecimal = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
};

export const calculateOTHours = (
  dayType: DayType,
  from: string,
  to: string
): { [key: string]: number } => {
  const result = {
    '1.125': 0,
    '1.25': 0,
    '1.5': 0,
    '1.75': 0,
    '2.0': 0
  };

  if (!from || !to) return result;

  let start = timeToDecimal(from);
  let end = timeToDecimal(to);

  // Handle cross-day (not very common in this form but possible)
  if (end < start) end += 24;

  const totalHours = end - start;
  // Rule: Round to nearest 15 mins (0.25)
  const roundedHours = Math.floor(totalHours * 4) / 4;

  // Split hours into 6am-10pm and 10pm-6am
  // Simplified for typical form usage:
  // Daytime: 06:00 to 22:00
  // Nighttime: 22:00 to 06:00
  
  let daytimeHours = 0;
  let nighttimeHours = 0;

  for (let t = start; t < end; t += 0.25) {
    const hourOfDay = t % 24;
    if (hourOfDay >= 6 && hourOfDay < 22) {
      daytimeHours += 0.25;
    } else {
      nighttimeHours += 0.25;
    }
  }

  if (dayType === 'Biasa') {
    result['1.125'] = daytimeHours;
    result['1.25'] = nighttimeHours;
  } else if (dayType === 'Rehat') {
    result['1.25'] = daytimeHours;
    result['1.5'] = nighttimeHours;
  } else if (dayType === 'Kelepasan Am') {
    result['1.75'] = daytimeHours;
    result['2.0'] = nighttimeHours;
  }

  return result;
};

export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val);
};

export const numberToWordsMalay = (n: number): string => {
  // Very simplified version for common claim amounts
  // In a real app, use a library or a complete mapper
  return n.toFixed(2) + " sahaja";
};
