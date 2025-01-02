import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { toast } from 'react-hot-toast';
import { UserPlus, X } from 'lucide-react';

interface AddEmployeeFormData {
  name: string;
  email: string;
  employeeCode: string;
  password: string;
  role: 'employee' | 'admin';
}

export default function AddEmployee() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<AddEmployeeFormData>({
    name: '',
    email: '',
    employeeCode: '',
    password: '',
    role: 'employee'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Add user to Firestore
      await addDoc(collection(db, 'employees'), {
        name: formData.name,
        email: formData.email,
        employeeCode: formData.employeeCode,
        role: formData.role,
        uid: userCredential.user.uid,
        lateCount: 0,
        absentCount: 0,
        regulariseCount: 0
      });

      toast.success('Employee added successfully');
      setFormData({
        name: '',
        email: '',
        employeeCode: '',
        password: '',
        role: 'employee'
      });
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error adding employee:', error);
      toast.error(error.message || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="btn-primary flex items-center gap-2"
      >
        <UserPlus size={20} />
        Add New Employee
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-lg w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Add New Employee</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Employee Code</label>
                <input
                  type="text"
                  className="input"
                  value={formData.employeeCode}
                  onChange={e => setFormData(prev => ({ ...prev, employeeCode: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Role</label>
                <select
                  className="input"
                  value={formData.role}
                  onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as 'employee' | 'admin' }))}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Password</label>
                <input
                  type="password"
                  className="input"
                  value={formData.password}
                  onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}