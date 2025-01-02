import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { RegularisationRequest } from '../types';
import { fetchEmployeeData } from '../services/employeeService';

export const useRegularisationRequests = () => {
  const [requests, setRequests] = useState<RegularisationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const requestsRef = collection(db, 'regularisation_requests');
        const q = query(requestsRef, where('status', '==', 'pending'));
        const querySnapshot = await getDocs(q);
        
        const requestsData = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const employee = await fetchEmployeeData(data.employeeId);
            return {
              id: doc.id,
              employeeName: employee?.name || 'Unknown',
              ...data,
              date: data.date.toDate(),
              loginTime: data.loginTime.toDate(),
              logoutTime: data.logoutTime.toDate(),
            };
          })
        );

        setRequests(requestsData);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleApprove = async (requestId: string) => {
    try {
      const requestRef = doc(db, 'regularisation_requests', requestId);
      await updateDoc(requestRef, { status: 'approved' });
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error approving request:', error);
      throw error;
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const requestRef = doc(db, 'regularisation_requests', requestId);
      await updateDoc(requestRef, { status: 'rejected' });
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }
  };

  return {
    requests,
    loading,
    handleApprove,
    handleReject
  };
};