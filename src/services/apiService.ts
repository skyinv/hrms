import { db } from '../lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

export const fetchEmployeeAttendance = async (employeeId: string, startDate: Date, endDate: Date) => {
  const attendanceRef = collection(db, 'attendance');
  const q = query(
    attendanceRef,
    where('employeeId', '==', employeeId),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate))
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const fetchIPAddress = async () => {
  const response = await fetch('https://api.ipify.org?format=json');
  const data = await response.json();
  return data.ip;
};