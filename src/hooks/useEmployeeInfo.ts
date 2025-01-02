import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

export const useEmployeeInfo = (userId: string) => {
  const [employeeInfo, setEmployeeInfo] = useState<any>(null);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employee info
        const employeeRef = collection(db, 'employees');
        const q = query(employeeRef, where('uid', '==', userId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setEmployeeInfo(querySnapshot.docs[0].data());
        }

        // Fetch today's attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = Timestamp.fromDate(today);

        const attendanceRef = collection(db, 'attendance');
        const attendanceQuery = query(
          attendanceRef,
          where('employeeId', '==', userId),
          where('date', '==', todayTimestamp)
        );

        const attendanceSnapshot = await getDocs(attendanceQuery);

        if (!attendanceSnapshot.empty) {
          const attendanceData = attendanceSnapshot.docs[0].data();
          setTodayAttendance({
            ...attendanceData,
            location: attendanceData.location
              ? `${attendanceData.location.latitude}, ${attendanceData.location.longitude}`
              : null,
          });
        }
      } catch (error) {
        console.error('Error fetching employee info or attendance:', error);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  return { employeeInfo, todayAttendance };
};
