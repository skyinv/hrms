import { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { RegularisationRequest } from '../../types';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { toast } from 'react-hot-toast';

export default function RegularizationRequests() {
  const [requests, setRequests] = useState<RegularisationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const q = query(
          collection(db, 'regularisation_requests'),
          where('status', '==', 'pending')
        );
        const snapshot = await getDocs(q);
        const requestsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as RegularisationRequest[];
        setRequests(requestsData);
      } catch (error) {
        console.error('Error fetching requests:', error);
        toast.error('Failed to load regularization requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleApproval = async (requestId: string, approved: boolean) => {
    try {
      const requestRef = doc(db, 'regularisation_requests', requestId);
      await updateDoc(requestRef, {
        status: approved ? 'approved' : 'rejected'
      });

      // Update the attendance record if approved
      if (approved) {
        const request = requests.find(r => r.id === requestId);
        if (request) {
          const attendanceRef = doc(db, 'attendance', request.date.toString());
          await updateDoc(attendanceRef, {
            status: 'present',
            punchIn: request.punchIn,
            punchOut: request.punchOut,
            isLate: request.type === 'late'
          });
        }
      }

      setRequests(prev => prev.filter(r => r.id !== requestId));
      toast.success(`Request ${approved ? 'approved' : 'rejected'}`);
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Pending Regularization Requests</h2>
      {requests.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        requests.map(request => (
          <div key={request.id} className="card">
            <div className="space-y-2">
              <p className="font-bold">Date: {formatDate(request.date)}</p>
              <p>Punch In: {request.punchIn ? formatTime(request.punchIn) : 'Not specified'}</p>
              <p>Punch Out: {request.punchOut ? formatTime(request.punchOut) : 'Not specified'}</p>
              <p>Type: {request.type}</p>
              <p>Reason: {request.reason}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleApproval(request.id, true)}
                className="btn-primary"
              >
                Approve
              </button>
              <button
                onClick={() => handleApproval(request.id, false)}
                className="btn"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
} 