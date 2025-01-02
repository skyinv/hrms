import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export const useAttendanceStats = () => {
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    incomplete: 0,
    late: 0
  });
  const { user } = useAuth();

  const getWorkingDays = (attendance) => {
    const uniqueDates = new Set();
    attendance.forEach((doc) => {
      const date = doc.data().date.toDate().toDateString();
      uniqueDates.add(date);
    });
    return uniqueDates.size;
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const attendanceRef = collection(db, 'attendance');
        const q = query(attendanceRef, where('employeeId', '==', user.uid));
        const querySnapshot = await getDocs(q);

        let present = 0;
        let incomplete = 0;
        let late = 0;

        const attendanceData = [];
        querySnapshot.forEach((doc) => attendanceData.push(doc));

        const workingDays = getWorkingDays(attendanceData);

        attendanceData.forEach((doc) => {
          const data = doc.data();
          const punchInTime = new Date(data.punchIn.toDate());
          if (data.punchOut) present++;
          if (!data.punchOut) incomplete++;
          if (punchInTime.getHours() > 9 || (punchInTime.getHours() === 9 && punchInTime.getMinutes() > 30)) {
            late++;
          }
        });

        setStats({
          present,
          absent: workingDays - present - incomplete,
          incomplete,
          late
        });
      } catch (error) {
        console.error('Error fetching attendance stats:', error);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const openRegularisationModal = (type) => {
    console.log(`Open regularisation modal for: ${type}`);
    // Implement modal logic
  };

  return { stats, openRegularisationModal };
};
