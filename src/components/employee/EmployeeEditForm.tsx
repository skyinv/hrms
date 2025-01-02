import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { getAuth, updateEmail, updatePassword } from 'firebase/auth';
import { Employee } from '../../types';

interface EmployeeEditFormProps {
  employee: Employee;
  onCancel: () => void;
}

export default function EmployeeEditForm({ employee, onCancel }: EmployeeEditFormProps) {
  const [formData, setFormData] = useState({
    name: employee.name,
    email: employee.email,
    employeeCode: employee.employeeCode,
    role: employee.role,
    newPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const employeeRef = doc(db, 'employees', employee.id);
      
      await updateDoc(employeeRef, {
        name: formData.name,
        email: formData.email,
        employeeCode: formData.employeeCode,
        role: formData.role,
      });

      if (employee.uid) {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          if (formData.email !== employee.email) {
            await updateEmail(user, formData.email);
          }

          if (formData.newPassword) {
            await updatePassword(user, formData.newPassword);
          }
        }
      }

      toast.success('Employee updated successfully');
      onCancel();
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Failed to update employee');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Edit Employee</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            className="input"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="input"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Employee Code</label>
          <input
            type="text"
            className="input"
            value={formData.employeeCode}
            onChange={(e) => setFormData(prev => ({ ...prev, employeeCode: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            className="input"
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            required
          >
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">New Password (leave blank to keep current)</label>
          <input
            type="password"
            className="input"
            value={formData.newPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
            placeholder="Enter new password"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onCancel} className="btn">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
} 