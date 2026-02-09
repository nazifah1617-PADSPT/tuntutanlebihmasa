
export type DayType = 'Biasa' | 'Rehat' | 'Kelepasan Am';

export interface OTLine {
  id: string;
  date: string;
  dayType: DayType;
  normalFrom: string;
  normalTo: string;
  otFrom: string;
  otTo: string;
  tasks: string;
  // Calculated fields
  hours_1_125: number;
  hours_1_250: number;
  hours_1_500: number;
  hours_1_750: number;
  hours_2_000: number;
}

export interface UserProfile {
  name: string;
  ic: string;
  salaryNo: string;
  phone: string;
  email: string;
  position: string;
  unit: string;
  paymentCenter: string;
  bankAccount: string;
  department: string;
  basicSalary: number;
  workingDays: string;
  weekendDays: string;
}

export interface OTClaim {
  id?: string;
  userId: string;
  month: string;
  year: string;
  profile: UserProfile;
  lines: OTLine[];
  createdAt: number;
}
