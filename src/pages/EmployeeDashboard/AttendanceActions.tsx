import React, { useState, useRef } from 'react';
import { Clock, LogOut } from 'lucide-react';
import Webcam from 'react-webcam';
import { useAuth } from '../../context/AuthContext';
import { markAttendance } from '../../services/attendanceService';
import toast from 'react-hot-toast';

export default function AttendanceActions() {
  const [showCamera, setShowCamera] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const { user } = useAuth();

  const handlePunchIn = async () => {
    if (attendanceMarked) {
      toast.error("Attendance already marked for today.");
      return;
    }
  
    try {
      const photoBase64 = webcamRef.current?.getScreenshot();
      if (!photoBase64) {
        toast.error("Failed to capture photo. Please ensure the camera is working.");
        return; // Stop execution if no photo is captured
      }
  
      const position = await getCurrentPosition();
      const ipAddress = await fetch('https://api.ipify.org?format=json')
        .then((res) => res.json())
        .then((data) => data.ip);
  
      const currentDateTime = new Date();
      await markAttendance(user.uid, {
        photo: photoBase64, // Ensure Base64 string is passed here
        location: position,
        ipAddress,
        type: 'in',
        loginTime: currentDateTime.toISOString(),
        loginDate: currentDateTime.toDateString(),
      });
  
      toast.success('Punched in successfully!');
      setAttendanceMarked(true);
      setShowCamera(false);
    } catch (error) {
      toast.error(error.message || 'Failed to punch in. Please try again.');
    }
  };
  

  const handlePunchOut = async () => {
    const now = new Date();
    const minTime = new Date();
    minTime.setHours(18, 30, 0);

    if (now < minTime) {
      toast.error('Cannot punch out before 6:30 PM');
      return;
    }

    const confirmPunchOut = window.confirm("Do you want to Punch Out?");
    if (!confirmPunchOut) return;

    try {
      await markAttendance(user.uid, { type: 'out', logoutTime: now.toISOString() });
      toast.success('Punched out successfully!');
    } catch (error) {
      toast.error('Failed to punch out. Please try again.');
    }
  };

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Attendance Actions</h2>
      <div className="space-y-4">
        {showCamera ? (
          <div className="space-y-4">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full rounded-lg border-2 border-dark"
            />
            <div className="flex gap-4">
              <button onClick={handlePunchIn} className="btn-primary flex-1">
                Confirm Punch In
              </button>
              <button
                onClick={() => setShowCamera(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setShowCamera(true)}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <Clock /> Punch In
            </button>
            <button
              onClick={handlePunchOut}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <LogOut /> Punch Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
