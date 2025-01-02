import React, { useState } from 'react';
import { useAttendanceStats } from '../../hooks/useAttendanceStats';
import { Calendar, AlertCircle, Clock } from 'lucide-react';
import RegularisationModal from './RegularisationModal';

export default function AttendanceOverview() {
  const { stats, openRegularisationModal } = useAttendanceStats();
  const [modalType, setModalType] = useState(null);

  const handleOpenModal = (type) => {
    setModalType(type);
  };

  const handleCloseModal = () => {
    setModalType(null);
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Attendance Overview</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="card bg-green-100">
          <div className="flex items-center gap-2">
            <Calendar className="text-green-600" />
            <span className="font-bold">Present</span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.present}</p>
        </div>
        <div
          className="card bg-red-100 cursor-pointer"
          onClick={() => handleOpenModal('absent')}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="text-red-600" />
            <span className="font-bold">Absent</span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.absent}</p>
        </div>
        <div
          className="card bg-yellow-100 cursor-pointer"
          onClick={() => handleOpenModal('incomplete')}
        >
          <div className="flex items-center gap-2">
            <Calendar className="text-yellow-600" />
            <span className="font-bold">Regularise</span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.incomplete}</p>
        </div>
        <div className="card bg-orange-100">
          <div className="flex items-center gap-2">
            <Clock className="text-orange-600" />
            <span className="font-bold">Late</span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.late}</p>
        </div>
      </div>

      {modalType && (
        <RegularisationModal type={modalType} onClose={handleCloseModal} />
      )}
    </div>
  );
}
