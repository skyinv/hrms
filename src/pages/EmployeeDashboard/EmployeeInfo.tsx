import React from 'react';
import { useEmployeeInfo } from '../../hooks/useEmployeeInfo';
import { User, Mail, Hash, MapPin, Globe } from 'lucide-react';

export default function EmployeeInfo({ user }: { user: any }) {
  const { employeeInfo, todayAttendance } = useEmployeeInfo(user.uid);

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Employee Information</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <User className="text-primary" />
          <div>
            <p className="font-bold">Name</p>
            <p>{employeeInfo?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Hash className="text-primary" />
          <div>
            <p className="font-bold">Employee Code</p>
            <p>{employeeInfo?.employeeCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="text-primary" />
          <div>
            <p className="font-bold">Email</p>
            <p>{employeeInfo?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Globe className="text-primary" />
          <div>
            <p className="font-bold">IP Address</p>
            <p>{todayAttendance?.ipAddress || 'Did not punch in yet'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="text-primary" />
          <div>
            <p className="font-bold">Location</p>
            <p>
      {todayAttendance?.location
        ? todayAttendance.location
        : 'Did not punch in yet'}
    </p>
          </div>
        </div>
      </div>
    </div>
  );
}