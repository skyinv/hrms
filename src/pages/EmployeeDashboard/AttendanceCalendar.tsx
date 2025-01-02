import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { useAttendanceCalendar } from '../../hooks/useAttendanceCalendar';
import RegularisationModal from './RegularisationModal';

// Localizer Setup
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function AttendanceCalendar() {
  const { attendanceData } = useAttendanceCalendar();
  const [modalData, setModalData] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const mappedEvents = Object.keys(attendanceData).map((dateKey) => {
      const attendance = attendanceData[dateKey];
      const punchInTime = attendance.punchIn?.toDate();
      const punchOutTime = attendance.punchOut?.toDate();

      // Logic for incomplete or irregular attendance
      const isOnTime =
        punchInTime?.getHours() === 9 &&
        punchInTime?.getMinutes() === 30 &&
        punchOutTime?.getHours() === 18 &&
        punchOutTime?.getMinutes() === 30;

      const isRegularized = attendance.isRegularized;

      const color = isRegularized
        ? '#6cb2eb' // Blue for Regularized
        : isOnTime
        ? '#48bb78' // Green for On Time
        : '#ecc94b'; // Yellow for Incomplete

      return {
        title: isRegularized ? 'Regularized' : isOnTime ? 'On Time' : 'Incomplete',
        start: attendance.date.toDate(),
        end: attendance.date.toDate(),
        allDay: true,
        resource: { attendance, isOnTime, isRegularized, color },
      };
    });

    setEvents(mappedEvents);
  }, [attendanceData]);

  const handleSelectEvent = (event) => {
    const { attendance, isOnTime, isRegularized } = event.resource;

    if (!isOnTime && !isRegularized) {
      setModalData({
        type: 'incomplete',
        date: event.start,
        attendance,
      });
    }
  };

  const closeModal = () => {
    setModalData(null);
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.resource.color,
        color: 'white',
        borderRadius: '5px',
        border: 'none',
        padding: '5px',
      },
    };
  };

  return (
    <div className="p-6 bg-white shadow rounded-md">
      <h2 className="text-xl font-bold mb-6">Attendance Calendar</h2>
      <Calendar
        events={events}
        startAccessor="start"
        endAccessor="end"
        localizer={localizer}
        style={{ height: 500 }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
      />
      {modalData && (
        <RegularisationModal
          type={modalData.type}
          date={modalData.date}
          attendance={modalData.attendance}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
