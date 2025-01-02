import { formatTime, formatDate } from '../../utils/dateUtils';
import { AttendanceRecord } from '../../types';
import { Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { addDoc, collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface AttendanceCardProps {
  attendance: AttendanceRecord;
  onRegularize?: () => void;
}

export default function AttendanceCard({ attendance, onRegularize }: AttendanceCardProps) {
  const { user } = useAuth();

  const getStatusColor = () => {
    switch (attendance.status) {
      case 'present':
        return 'bg-green-100';
      case 'half-day':
        return 'bg-yellow-100';
      case 'absent':
        return 'bg-red-100';
      case 'regularization-pending':
        return 'bg-blue-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getStatusText = () => {
    switch (attendance.status) {
      case 'present':
        return 'Present';
      case 'half-day':
        return 'Half Day';
      case 'absent':
        return 'Absent';
      case 'regularization-pending':
        return 'Pending Regularization';
      default:
        return attendance.status;
    }
  };

  const markAttendance = async () => {
    if (!user?.email) return;

    try {
      // Get employee details from Firestore using email
      const employeesRef = collection(db, 'employees');
      const q = query(employeesRef, where('email', '==', user.email));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const employeeDoc = snapshot.docs[0];
        const employeeData = employeeDoc.data();

        // Create attendance record
        await addDoc(collection(db, 'attendance'), {
          employeeId: user.email, // Use email as employeeId for consistency
          employeeName: employeeData.name,
          employeeCode: employeeData.employeeCode,
          date: serverTimestamp(),
          punchIn: serverTimestamp(),
          photo: photoUrl,
          ipAddress,
          location: {
            latitude,
            longitude
          },
          status: isLate ? 'late' : 'present',
          isLate
        });

        console.log('Attendance marked for:', {
          name: employeeData.name,
          code: employeeData.employeeCode
        });
      } else {
        throw new Error('Employee not found in database');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  };

  return (
    <div className={`card ${getStatusColor()}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="font-bold">{formatDate(attendance.date)}</p>
          {attendance.punchIn && (
            <p className="text-sm flex items-center gap-1">
              <Clock size={14} className="text-primary" />
              Punch In: {formatTime(attendance.punchIn)}
              {attendance.isLate && (
                <span className="text-yellow-600 ml-2 text-xs">(Late)</span>
              )}
            </p>
          )}
          {attendance.punchOut && (
            <p className="text-sm flex items-center gap-1">
              <Clock size={14} className="text-primary" />
              Punch Out: {formatTime(attendance.punchOut)}
            </p>
          )}
        </div>
        <div className="text-right">
          <span className="text-sm font-medium capitalize px-2 py-1 rounded-full" 
                style={{ backgroundColor: getStatusColor() }}>
            {getStatusText()}
          </span>
          {attendance.workingHours !== undefined && (
            <p className="text-sm mt-1 text-gray-600">
              {attendance.workingHours.toFixed(1)} hrs
            </p>
          )}
        </div>
      </div>
      {onRegularize && attendance.status !== 'present' && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onRegularize}
            className="text-sm text-primary hover:underline"
          >
            Regularize
          </button>
        </div>
      )}
    </div>
  );
}