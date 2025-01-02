import { db } from '../lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';

export const markAttendance = async (employeeId: string, data: any) => {
  const attendanceRef = collection(db, 'attendance');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = Timestamp.fromDate(today);

  // Query attendance for today's date
  const q = query(
    attendanceRef,
    where('employeeId', '==', employeeId),
    where('date', '==', todayTimestamp)
  );

  const querySnapshot = await getDocs(q);

  if (data.type === 'in') {
    if (!querySnapshot.empty) {
      throw new Error('Already punched in today');
    }

    // Add attendance document
    return addDoc(attendanceRef, {
      employeeId,
      date: todayTimestamp, // Store date as Firestore Timestamp
      punchIn: Timestamp.now(),
      punchOut: null,
      photo: data.photo, // Base64 photo
      ipAddress: data.ipAddress,
      location: data.location,
    });
  } else if (data.type === 'out') {
    if (querySnapshot.empty) {
      throw new Error('No punch in record found for today');
    }

    // Update the punchOut field
    const attendanceDoc = querySnapshot.docs[0];
    return updateDoc(doc(db, 'attendance', attendanceDoc.id), {
      punchOut: Timestamp.now(),
    });
  }
};
