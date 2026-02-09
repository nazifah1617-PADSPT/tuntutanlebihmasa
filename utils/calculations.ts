
import { DayType } from '../types';

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

export const format12h = (time24: string): string => {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am';
  const hour12 = h % 12 || 12;
  return `${hour12}.${m.toString().padStart(2, '0')} ${suffix}`;
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

  if (end < start) end += 24;

  const totalHours = end - start;
  // Rule: Round down to nearest 15 mins (0.25)
  const roundedHours = Math.floor(totalHours * 4) / 4;

  let daytimeHours = 0;
  let nighttimeHours = 0;

  for (let t = start; t < end; t += 0.25) {
    const hourOfDay = t % 24;
    // 6am to 10pm (inclusive start, exclusive end)
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
    result['1.25'] = daytimeHours; // Weekend Day 1.25
    result['1.5'] = nighttimeHours; // Weekend Night 1.5
  } else if (dayType === 'Kelepasan Am') {
    result['1.75'] = daytimeHours; // PH Day 1.75
    result['2.0'] = nighttimeHours; // PH Night 2.0
  }

  return result;
};

export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val);
};

export const numberToWordsMalay = (amount: number): string => {
  const units = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Lapan", "Sembilan"];
  const teens = ["Sepuluh", "Sebelas", "Dua Belas", "Tiga Belas", "Empat Belas", "Lima Belas", "Enam Belas", "Tujuh Belas", "Lapan Belas", "Sembilan Belas"];
  const tens = ["", "Sepuluh", "Dua Puluh", "Tiga Puluh", "Empat Puluh", "Lima Puluh", "Enam Puluh", "Tujuh Puluh", "Lapan Puluh", "Sembilan Puluh"];
  const levels = ["", "Ribu", "Juta", "Bilion"];

  function convertGroup(n: number): string {
    let res = "";
    const h = Math.floor(n / 100);
    const t = n % 100;
    
    if (h > 0) res += units[h] + " Ratus ";
    
    if (t >= 10 && t < 20) {
      res += teens[t - 10] + " ";
    } else {
      const d = Math.floor(t / 10);
      const u = t % 10;
      if (d > 0) res += tens[d] + " ";
      if (u > 0) res += units[u] + " ";
    }
    return res;
  }

  const [ringgitStr, senStr] = amount.toFixed(2).split(".");
  let ringgit = parseInt(ringgitStr);
  let sen = parseInt(senStr);

  if (ringgit === 0 && sen === 0) return "Kosong Ringgit";

  let ringgitWords = "";
  let level = 0;
  
  if (ringgit === 0) {
    ringgitWords = "Kosong ";
  } else {
    while (ringgit > 0) {
      const group = ringgit % 1000;
      if (group > 0) {
        ringgitWords = convertGroup(group) + levels[level] + " " + ringgitWords;
      }
      ringgit = Math.floor(ringgit / 1000);
      level++;
    }
  }

  let senWords = "";
  if (sen > 0) {
    senWords = " dan " + convertGroup(sen) + "Sen";
  }

  return (ringgitWords + "Ringgit" + senWords + " Sahaja").replace(/\s+/g, ' ').trim();
};
