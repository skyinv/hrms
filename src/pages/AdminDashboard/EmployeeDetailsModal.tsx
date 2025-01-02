import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Employee, AttendanceRecord } from '../../types';
import { X, Calendar as CalendarIcon, MapPin, Globe } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { formatDate, formatTime } from '../../utils/dateUtils';

interface Props {
  employee: Employee;
  onClose: () => void;
}

interface AttendanceDetails {
  [date: string]: AttendanceRecord;
}

export default function EmployeeDetailsModal({ employee, onClose }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [attendanceDetails, setAttendanceDetails] = useState<AttendanceDetails>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        console.log('Fetching attendance for employee:', {
          id: employee.id,
          employeeCode: employee.employeeCode,
          uid: employee.uid,
          email: employee.email
        });

        // Query attendance using multiple possible employee identifiers
        const attendanceQuery = query(
          collection(db, 'attendance'),
          where('employeeId', 'in', [employee.id, employee.employeeCode, employee.uid, employee.email])
        );

        const snapshot = await getDocs(attendanceQuery);
        console.log('Found attendance records:', snapshot.size);

        const details: AttendanceDetails = {};
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log('Processing attendance record:', data);

          // Convert Firestore timestamps to Date objects
          const date = data.date?.toDate();
          if (date) {
            const dateStr = date.toISOString().split('T')[0];
            details[dateStr] = {
              id: doc.id,
              employeeId: data.employeeId,
              date: date,
              punchIn: data.punchIn?.toDate() || null,
              punchOut: data.punchOut?.toDate() || null,
              photo: data.photo || '',
              ipAddress: data.ipAddress || '',
              location: data.location || { latitude: 0, longitude: 0 },
              status: data.status || 'absent',
              isLate: data.isLate || false,
              workingHours: data.workingHours || 0
            };
          }
        });

        console.log('Processed attendance details:', details);
        setAttendanceDetails(details);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [employee]);

  const getTileClassName = ({ date }: { date: Date }) => {
    const dateStr = date.toISOString().split('T')[0];
    const record = attendanceDetails[dateStr];
    
    if (!record) return '';
    
    if (record.status === 'present') return 'bg-green-100';
    if (record.status === 'absent') return 'bg-red-100';
    return 'bg-yellow-100';
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold">{employee.name}</h2>
            <p className="text-gray-600">Employee ID: {employee.employeeCode}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Calendar
              className="w-full rounded-lg shadow"
              tileClassName={getTileClassName}
              onChange={(date: Date) => setSelectedDate(date)}
              value={selectedDate}
            />
          </div>

          <div>
            {selectedDate && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold">
                  {formatDate(selectedDate)} Details
                </h3>
                {attendanceDetails[selectedDate.toISOString().split('T')[0]] ? (
                  <AttendanceDetails
                    record={attendanceDetails[selectedDate.toISOString().split('T')[0]]}
                  />
                ) : (
                  <p className="text-gray-500">No attendance record for this date</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AttendanceDetails({ record }: { record: AttendanceRecord }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Status</p>
          <p className={`font-medium ${
            record.status === 'present' ? 'text-green-600' :
            record.status === 'absent' ? 'text-red-600' :
            'text-yellow-600'
          }`}>
            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
            {record.isLate && ' (Late)'}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Working Hours</p>
          <p className="font-medium">{record.workingHours?.toFixed(1) || '-'} hours</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Punch In</p>
          <p className="font-medium">{record.punchIn ? formatTime(record.punchIn) : '-'}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Punch Out</p>
          <p className="font-medium">
            {record.punchOut ? formatTime(record.punchOut) : 'Not punched out'}
          </p>
        </div>
      </div>

      {record.location && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={16} className="text-gray-600" />
            <p className="text-sm text-gray-600">Location</p>
          </div>
          <p className="font-medium">
            Lat: {record.location.latitude.toFixed(6)}, Long: {record.location.longitude.toFixed(6)}
          </p>
        </div>
      )}

      {record.ipAddress && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={16} className="text-gray-600" />
            <p className="text-sm text-gray-600">IP Address</p>
          </div>
          <p className="font-medium">{record.ipAddress}</p>
        </div>
      )}

      {record.photo && (
        <div>
          <p className="text-sm text-gray-600 mb-2">Attendance Photo</p>
          <img
            src={record.photo}
            alt="Attendance"
            className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90"
            onClick={() => window.open(record.photo, '_blank')}
          />
        </div>
      )}
    </div>
  );
} 