import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Employee } from '../../types';
import { Users, Pencil } from 'lucide-react';
import EmployeeDetailsModal from './EmployeeDetailsModal';
import { toast } from 'react-hot-toast';

interface EmployeeStats extends Employee {
  presentCount: number;
}

interface EditModalProps {
  employee: EmployeeStats;
  onClose: () => void;
  onSave: (updatedEmployee: Partial<Employee>) => Promise<void>;
}

function EditEmployeeModal({ employee, onClose, onSave }: EditModalProps) {
  const [formData, setFormData] = useState({
    name: employee.name,
    email: employee.email,
    employeeCode: employee.employeeCode,
    role: employee.role
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      toast.success('Employee updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Edit Employee</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="input w-full"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="input w-full"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Employee Code</label>
            <input
              type="text"
              className="input w-full"
              value={formData.employeeCode}
              onChange={e => setFormData(prev => ({ ...prev, employeeCode: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              className="input w-full"
              value={formData.role}
              onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as 'employee' | 'admin' }))}
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EmployeeList() {
  const [employees, setEmployees] = useState<EmployeeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeStats | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeStats | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const employeesSnapshot = await getDocs(collection(db, 'employees'));
      const employeesData = employeesSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          presentCount: 0,
          lateCount: doc.data().lateCount || 0,
          absentCount: doc.data().absentCount || 0,
          regulariseCount: doc.data().regulariseCount || 0
        }))
        .filter(emp => emp.role !== 'admin') as EmployeeStats[];

      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmployee = async (employeeId: string, updates: Partial<Employee>) => {
    if (window.confirm('Are you sure you want to save these changes?')) {
      try {
        const employeeRef = doc(db, 'employees', employeeId);
        await updateDoc(employeeRef, updates);
        await fetchEmployees(); // Refresh the list
        toast.success('Employee updated successfully');
      } catch (error) {
        console.error('Error updating employee:', error);
        toast.error('Failed to update employee');
      }
    }
  };

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="text-primary" size={24} />
          <h2 className="text-2xl font-bold">Employee List</h2>
        </div>
        <span className="text-sm text-gray-500">Total: {employees.length}</span>
      </div>

      <div className="space-y-4">
        {employees.map(employee => (
          <div key={employee.id} className="p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 
                    className="font-bold text-primary hover:text-primary-dark cursor-pointer"
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    {employee.name}
                  </h3>
                  <button
                    onClick={() => setEditingEmployee(employee)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                    title="Edit employee"
                  >
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <p className="text-sm text-gray-600">ID: {employee.employeeCode}</p>
                <p className="text-sm text-gray-600">{employee.email}</p>
              </div>
              <div className="text-right text-sm">
                <p>Present Count: {employee.presentCount}</p>
                <p>Late Count: {employee.lateCount || 0}</p>
                <p>Absent Count: {employee.absentCount || 0}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedEmployee && (
        <EmployeeDetailsModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}

      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSave={(updates) => handleUpdateEmployee(editingEmployee.id, updates)}
        />
      )}
    </div>
  );
}