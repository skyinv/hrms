export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  employeeCode: string;
  uid?: string;
  lateCount: number;
  absentCount: number;
  regulariseCount: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: Date;
  punchIn: Date | null;
  punchOut: Date | null;
  photo: string;
  ipAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
  status: 'present' | 'absent' | 'late';
  isLate: boolean;
  workingHours?: number;
}

export interface RegularisationRequest {
  id: string;
  employeeId: string;
  date: Date;
  punchIn: Date | null;
  punchOut: Date | null;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  type: 'missing_punch_out' | 'absent' | 'late';
  attendanceId?: string;
}

// Add these additional types if needed
export interface UserCredentials {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: Employee | null;
  loading: boolean;
  login: (credentials: UserCredentials) => Promise<void>;
  logout: () => Promise<void>;
}