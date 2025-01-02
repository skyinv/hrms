import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      const employeesRef = collection(db, 'employees');
      const q = query(employeesRef, where('email', '==', email));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const employeeData = snapshot.docs[0].data();
        if (employeeData.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/employee');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`, // Redirect URL after password reset
        handleCodeInApp: true,
      });
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email');
      } else {
        toast.error('Failed to send reset email. Please try again.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light p-4">
      <div className="card max-w-md w-full">
        <div className="flex justify-center mb-6">
          <UserCircle size={64} className="text-primary" />
        </div>
        <h1 className="text-3xl font-display text-center mb-8">Attendance System</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-bold mb-2">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || resetLoading}
              required
            />
          </div>
          <div>
            <label className="block font-bold mb-2">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || resetLoading}
              required
            />
          </div>
          <div className="flex flex-col gap-4">
            <button 
              type="submit" 
              className="btn-primary w-full"
              disabled={loading || resetLoading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-primary hover:text-primary-dark text-sm text-center"
              disabled={loading || resetLoading}
            >
              {resetLoading ? 'Sending reset email...' : 'Forgot Password?'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}