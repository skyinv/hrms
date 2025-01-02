import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { RegularisationRequest } from '../../types';

interface RegularizationFormProps {
  employeeId: string;
  date: Date;
  onSubmit: (request: Omit<RegularisationRequest, 'id' | 'status'>) => Promise<void>;
  onCancel: () => void;
}

export default function RegularizationForm({ employeeId, date, onSubmit, onCancel }: RegularizationFormProps) {
  const [formData, setFormData] = useState({
    punchInTime: '09:30',
    punchOutTime: '18:00',
    reason: '',
    type: 'absent' as const
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const [punchInHours, punchInMinutes] = formData.punchInTime.split(':');
      const [punchOutHours, punchOutMinutes] = formData.punchOutTime.split(':');

      const punchIn = new Date(date);
      punchIn.setHours(parseInt(punchInHours), parseInt(punchInMinutes));

      const punchOut = new Date(date);
      punchOut.setHours(parseInt(punchOutHours), parseInt(punchOutMinutes));

      await onSubmit({
        employeeId,
        date,
        punchIn,
        punchOut,
        reason: formData.reason,
        type: formData.type
      });

      toast.success('Regularization request submitted');
      onCancel();
    } catch (error) {
      toast.error('Failed to submit regularization request');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold">Regularize Attendance</h3>
      <p className="text-sm text-gray-600">
        Date: {format(date, 'dd MMM yyyy')}
      </p>

      <div>
        <label className="block text-sm font-medium mb-1">Punch In Time</label>
        <input
          type="time"
          className="input"
          value={formData.punchInTime}
          onChange={(e) => setFormData(prev => ({ ...prev, punchInTime: e.target.value }))}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Punch Out Time</label>
        <input
          type="time"
          className="input"
          value={formData.punchOutTime}
          onChange={(e) => setFormData(prev => ({ ...prev, punchOutTime: e.target.value }))}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <select
          className="input"
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
          required
        >
          <option value="absent">Absent</option>
          <option value="missing_punch_out">Missing Punch Out</option>
          <option value="late">Late</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Reason</label>
        <textarea
          className="input min-h-[100px]"
          value={formData.reason}
          onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
          required
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="btn">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Submit Request
        </button>
      </div>
    </form>
  );
} 