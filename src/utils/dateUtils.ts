import { format, isAfter, isBefore, setHours, setMinutes, differenceInHours, differenceInMinutes } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

const TIMEZONE = 'Asia/Kolkata';
const WORKDAY_START = { hours: 9, minutes: 30 };
const FULL_DAY_HOURS = 8.5; // 8.5 hours for full day
const HALF_DAY_HOURS = 4; // 4 hours for half day

export const getIndianTime = (date: Date = new Date()): Date => {
  return new Date(formatInTimeZone(date, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX"));
};

export const isLateLogin = (date: Date): boolean => {
  const indianTime = getIndianTime(date);
  const startTime = setHours(setMinutes(new Date(), WORKDAY_START.minutes), WORKDAY_START.hours);
  return isAfter(indianTime, startTime);
};

export const calculateWorkingHours = (punchIn: Date, punchOut: Date): number => {
  const hours = differenceInHours(punchOut, punchIn);
  const minutes = differenceInMinutes(punchOut, punchIn) % 60;
  return hours + (minutes / 60);
};

export const determineAttendanceStatus = (workingHours: number): 'present' | 'half-day' => {
  return workingHours >= FULL_DAY_HOURS ? 'present' : 
         workingHours >= HALF_DAY_HOURS ? 'half-day' : 'absent';
};

export const formatTime = (date: Date | null): string => {
  if (!date) return '-';
  return formatInTimeZone(date, TIMEZONE, 'hh:mm a');
};

export const formatDate = (date: Date | null): string => {
  if (!date) return '-';
  return formatInTimeZone(date, TIMEZONE, 'dd MMM yyyy');
};

export const getCurrentPosition = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};