import { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, where, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { RegularisationRequest, Employee } from '../../types';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { toast } from 'react-hot-toast';
import { Clock, Calendar, AlertCircle } from 'lucide-react';

export default function RegularisationRequests() {
  const [requests, setRequests] = useState<RegularisationRequest[]>([]);
  const [employees, setEmployees] = useState<Record<string, Employee>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First fetch all employees for lookup
        const employeesSnapshot = await getDocs(collection(db, 'employees'));
        const employeesData = employeesSnapshot.docs.reduce((acc, doc) => {
          const data = doc.data();
          acc[doc.id] = { id: doc.id, ...data };
          return acc;
        }, {} as Record<string, Employee>);
        setEmployees(employeesData);

        // Then fetch pending requests
        const q = query(
          collection(db, 'regularisation_requests'),
          where('status', '==', 'pending')
        );
        const snapshot = await getDocs(q);
        const requestsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date?.toDate(),
            punchIn: data.punchIn?.toDate(),
            punchOut: data.punchOut?.toDate(),
          };
        });

        setRequests(requestsData);
      } catch (error) {
        console.error('Error fetching requests:', error);
        toast.error('Failed to load requests');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApproval = async (requestId: string, approved: boolean) => {
    try {
      const requestRef = doc(db, 'regularisation_requests', requestId);
      await updateDoc(requestRef, {
        status: approved ? 'approved' : 'rejected',
        updatedAt: Timestamp.now()
      });

      // Update the attendance record if approved
      const request = requests.find(r => r.id === requestId);
      if (approved && request) {
        const attendanceRef = doc(db, 'attendance', request.attendanceId || request.date.toISOString());
        await updateDoc(attendanceRef, {
          status: 'present',
          punchIn: request.punchIn,
          punchOut: request.punchOut,
          isRegularized: true
        });
      }

      setRequests(prev => prev.filter(r => r.id !== requestId));
      toast.success(`Request ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    }
  };

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Regularisation Requests</h2>
      
      {requests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p>No pending requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(request => {
            const employee = employees[request.employeeId];
            return (
              <div key={request.id} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{employee?.name || 'Unknown Employee'}</h3>
                    <p className="text-sm text-gray-600">ID: {employee?.employeeCode}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                    {request.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-gray-400" size={16} />
                    <span className="text-sm">{formatDate(request.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="text-gray-400" size={16} />
                    <span className="text-sm">
                      {request.punchIn ? formatTime(request.punchIn) : 'No punch in'} - 
                      {request.punchOut ? formatTime(request.punchOut) : 'No punch out'}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  <strong>Reason:</strong> {request.reason}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApproval(request.id, true)}
                    className="btn-primary flex-1"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproval(request.id, false)}
                    className="btn flex-1"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
