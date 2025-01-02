import React from 'react';
import EmployeeList from './EmployeeList';
import RegularisationRequests from './RegularisationRequests';
import AddEmployee from './AddEmployee';
import TodayAttendance from './TodayAttendance';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';
import BroadcastMessage from '../../components/admin/BroadcastMessage';
import BroadcastList from './BroadcastList';

export default function AdminDashboard() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <BroadcastMessage />
              <AddEmployee />
              <button 
                onClick={logout} 
                className="btn flex items-center gap-2 hover:bg-red-50 text-red-600 border-red-600"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Employee List */}
          <div className="col-span-12 lg:col-span-5">
            <div className="sticky top-8">
              <EmployeeList />
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <RegularisationRequests />
            <BroadcastList />
            <TodayAttendance />
          </div>
        </div>
      </main>
    </div>
  );
}
