import { db, auth } from '../lib/firebase';
import { collection, doc, getDoc, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Correct import

export const createEmployee = async (data: {
  name: string;
  email: string;
  employeeCode: string;
  password: string;
}) => {
  try {
    // Create authentication account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    // Create employee document
    await addDoc(collection(db, 'employees'), {
      uid: userCredential.user.uid,
      name: data.name,
      email: data.email,
      employeeCode: data.employeeCode,
      absentCount: 0,
      regulariseCount: 0,
      lateCount: 0,
    });

    console.log('Employee created successfully.');
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error; // Re-throw to handle errors upstream
  }
};

export const fetchEmployeeData = async (employeeId: string) => {
  try {
    const employeeRef = doc(db, 'employees', employeeId);
    const employeeDoc = await getDoc(employeeRef);

    if (employeeDoc.exists()) {
      return {
        id: employeeDoc.id,
        ...employeeDoc.data(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching employee data:', error);
    return null;
  }
};
