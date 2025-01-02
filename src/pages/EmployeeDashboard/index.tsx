import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import AttendanceActions from './AttendanceActions';
import AttendanceOverview from './AttendanceOverview';
import EmployeeInfo from './EmployeeInfo';
import AttendanceCalendar from './AttendanceCalendar';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import NotificationBell from '../../components/notifications/NotificationBell';

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen bg-light p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-display">Employee Dashboard</h1>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button
              onClick={handleLogout}
              className="btn-primary flex items-center gap-2 hover:bg-red-600"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <AttendanceActions />
            <EmployeeInfo user={user} />
          </div>
          <div className="space-y-6">
            <AttendanceOverview />
            <AttendanceCalendar />
          </div>
        </div>
      </div>
    </div>
  );
}