import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import { isLateLogin } from '../utils/dateUtils';

export const useAttendanceCalendar = () => {
  const [attendanceData, setAttendanceData] = useState<Record<string, any>>({});
  const { user } = useAuth();

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user) return;

      const attendanceRef = collection(db, 'attendance');
      const q = query(attendanceRef, where('employeeId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      const data: Record<string, any> = {};
      querySnapshot.forEach((doc) => {
        const attendance = doc.data();
        const dateKey = format(attendance.date.toDate(), 'yyyy-MM-dd');
        data[dateKey] = attendance;
      });

      setAttendanceData(data);
    };

    fetchAttendance();
  }, [user]);

  const handleDateClick = async (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const attendance = attendanceData[dateKey];
  
    if (!attendance || !attendance.punchIn) {
      // Handle regularization for absent days
      return {
        type: 'absent',
        date,
      };
    }
  
    if (
      isLateLogin(attendance.punchIn.toDate()) ||
      !attendance.punchOut
    ) {
      // Handle regularization for late/incomplete days
      return {
        type: 'incomplete',
        date,
        attendance,
      };
    }
  
    return null; // No action for on-time or regularized days
  };
  

  return {
    attendanceData,
    handleDateClick
  };
};