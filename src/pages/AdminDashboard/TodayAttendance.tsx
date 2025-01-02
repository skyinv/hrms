import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { AttendanceRecord, Employee } from '../../types';
import { formatTime } from '../../utils/dateUtils';
import { X } from 'lucide-react';

export default function TodayAttendance() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodayAttendance = async () => {
      try {
        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Fetch today's attendance records
        const attendanceQuery = query(
          collection(db, 'attendance'),
          where('date', '>=', today),
          where('date', '<', tomorrow)
        );

        const snapshot = await getDocs(attendanceQuery);
        const attendanceData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date?.toDate(),
            punchIn: data.punchIn?.toDate(),
            punchOut: data.punchOut?.toDate(),
          };
        });

        console.log('Fetched attendance records:', attendanceData);
        setAttendance(attendanceData);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayAttendance();
  }, []);

  if (loading) {
    return (
      <div className="card animate-pulse">
        <h2 className="text-2xl font-bold mb-6">Today's Attendance</h2>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Today's Attendance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2">Photo</th>
                <th className="px-4 py-2">Employee Name</th>
                <th className="px-4 py-2">Employee ID</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Punch In</th>
                <th className="px-4 py-2">Punch Out</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map(record => (
                <tr key={record.id} className="border-t">
                  <td className="px-4 py-2">
                    {record.photo && (
                      <img
                        src={record.photo}
                        alt="Attendance"
                        className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80"
                        onClick={() => setSelectedPhoto(record.photo)}
                      />
                    )}
                  </td>
                  <td className="px-4 py-2">{record.employeeName}</td>
                  <td className="px-4 py-2">{record.employeeCode}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded ${
                      record.status === 'present' ? 'bg-green-100 text-green-800' :
                      record.status === 'absent' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {record.punchIn ? formatTime(record.punchIn) : '-'}
                  </td>
                  <td className="px-4 py-2">
                    {record.punchOut ? formatTime(record.punchOut) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative bg-white p-8 rounded-lg max-w-4xl max-h-[90vh] overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-red-500 rounded-full shadow-md hover:bg-red-600 transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
            <img
              src={selectedPhoto}
              alt="Attendance Photo Preview"
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}
