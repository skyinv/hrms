import React, { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const RegularisationModal = ({ type, onClose }) => {
  const [formData, setFormData] = useState({
    date: '',
    loginTime: '',
    logoutTime: '',
    reason: '',
  });
  const { user } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const regularisationRef = collection(db, 'regularisation_requests');

      // Convert date, loginTime, and logoutTime to proper Timestamps
      const requestDate = new Date(formData.date);
      const loginTimestamp = new Date(`${formData.date}T${formData.loginTime}`);
      const logoutTimestamp = new Date(`${formData.date}T${formData.logoutTime}`);

      // Ensure `user.displayName` or `user.name` is used correctly
      const employeeName = user.displayName || user.name || 'Unknown Employee';

      await addDoc(regularisationRef, {
        employeeName, // Use the corrected employee name field
        employeeId: user.uid, // Associate request with the logged-in employee
        type,
        date: Timestamp.fromDate(requestDate),
        loginTime: Timestamp.fromDate(loginTimestamp),
        logoutTime: Timestamp.fromDate(logoutTimestamp),
        reason: formData.reason,
        status: 'pending', // Default status
        createdAt: Timestamp.now(),
      });

      toast.success('Regularisation request submitted successfully.');
      onClose();
    } catch (error) {
      toast.error('Failed to submit the request. Please try again.');
      console.error('Error submitting regularisation:', error);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1050, // Ensure it's above other content
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          width: '400px',
          maxWidth: '90%',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1060, // Ensure it's above the overlay
          position: 'relative',
        }}
      >
        <h2 className="text-xl font-bold mb-4">
          {type === 'absent' ? 'Regularise Absence' : 'Regularise Incomplete Day'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block font-bold mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded p-2"
              style={{
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                width: '100%',
              }}
            />
          </div>
          <div>
            <label className="block font-bold mb-1">Login Time</label>
            <input
              type="time"
              name="loginTime"
              value={formData.loginTime}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded p-2"
              style={{
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                width: '100%',
              }}
            />
          </div>
          <div>
            <label className="block font-bold mb-1">Logout Time</label>
            <input
              type="time"
              name="logoutTime"
              value={formData.logoutTime}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded p-2"
              style={{
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                width: '100%',
              }}
            />
          </div>
          <div>
            <label className="block font-bold mb-1">Reason</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded p-2"
              style={{
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                width: '100%',
              }}
            ></textarea>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              borderRadius: '6px',
              color: '#1f2937',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            style={{
              padding: '8px 16px',
              backgroundColor: '#2563eb',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegularisationModal;
