import { useState } from 'react';
import { Calendar } from 'react-calendar';
import { format } from 'date-fns';
import { AttendanceRecord } from '../../types';
import 'react-calendar/dist/Calendar.css';

interface AttendanceCalendarProps {
  attendance: AttendanceRecord[];
  onDateClick: (date: Date) => void;
}

export default function AttendanceCalendar({ attendance, onDateClick }: AttendanceCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getDateStatus = (date: Date) => {
    const record = attendance.find(
      a => format(a.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );

    if (!record) return 'absent';
    return record.status;
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const status = getDateStatus(date);
    const classes = {
      'present': 'bg-green-100',
      'absent': 'bg-red-100',
      'regularization-pending': 'bg-blue-100'
    };
    return classes[status] || '';
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick(date);
  };

  return (
    <div className="p-4">
      <Calendar
        onChange={handleDateClick}
        value={selectedDate}
        tileClassName={tileClassName}
        className="rounded-lg border-2 border-dark shadow-brutal"
      />
    </div>
  );
} 