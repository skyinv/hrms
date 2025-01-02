import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AttendanceRecord } from '../types';
import { getIndianTime, isLateLogin, calculateWorkingHours, determineAttendanceStatus } from '../utils/dateUtils';
import { getCurrentPosition } from '../utils/dateUtils';

export const useAttendance = (employeeId: string) => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch attendance records
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const q = query(
          collection(db, 'attendance'),
          where('employeeId', '==', employeeId)
        );
        const snapshot = await getDocs(q);
        const records = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AttendanceRecord[];
        setAttendance(records);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [employeeId]);

  // Punch In function
  const punchIn = async () => {
    try {
      const now = getIndianTime();
      const location = await getCurrentPosition();
      const ipAddress = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip);

      const newAttendance: Partial<AttendanceRecord> = {
        employeeId,
        date: now,
        punchIn: now,
        punchOut: null,
        photo: '', // You'll need to implement photo capture
        ipAddress,
        location,
        status: 'present', // Initial status, will be updated on punch out
        isLate: isLateLogin(now),
        workingHours: 0
      };

      await addDoc(collection(db, 'attendance'), newAttendance);
    } catch (error) {
      console.error('Error punching in:', error);
      throw error;
    }
  };

  // Punch Out function
  const punchOut = async (attendanceId: string) => {
    try {
      const now = getIndianTime();
      const attendanceRef = doc(db, 'attendance', attendanceId);
      
      // Get current attendance record
      const attendanceDoc = await getDocs(query(
        collection(db, 'attendance'),
        where('id', '==', attendanceId)
      ));
      
      const currentAttendance = attendanceDoc.docs[0].data() as AttendanceRecord;
      
      if (currentAttendance.punchIn) {
        const workingHours = calculateWorkingHours(currentAttendance.punchIn, now);
        const status = determineAttendanceStatus(workingHours);

        await updateDoc(attendanceRef, {
          punchOut: now,
          workingHours,
          status
        });
      }
    } catch (error) {
      console.error('Error punching out:', error);
      throw error;
    }
  };

  return {
    attendance,
    loading,
    punchIn,
    punchOut
  };
}; 