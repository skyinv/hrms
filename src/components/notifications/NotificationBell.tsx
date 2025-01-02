import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

interface Broadcast {
  id: string;
  message: string;
  timestamp: Timestamp;
  status: 'active' | 'recalled';
  sentBy: string;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Create the query with proper ordering
      const broadcastsRef = collection(db, 'admin_broadcasts');
      const q = query(
        broadcastsRef,
        where('status', '==', 'active'),
        orderBy('timestamp', 'desc')
      );

      // Set up real-time listener with error handling
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const messages = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              message: data.message,
              timestamp: data.timestamp,
              status: data.status,
              sentBy: data.sentBy
            } as Broadcast;
          });

          console.log('Fetched broadcasts:', messages);
          setBroadcasts(messages);
          setUnreadCount(messages.length);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching broadcasts:', error);
          toast.error('Failed to fetch notifications');
          setLoading(false);
        }
      );

      // Cleanup subscription on unmount
      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up broadcast listener:', error);
      setLoading(false);
    }
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !(event.target as Element).closest('.notification-bell')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative notification-bell">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4">
            <h3 className="font-bold text-lg mb-4">Notifications</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Loading notifications...</p>
                </div>
              ) : broadcasts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No notifications</p>
              ) : (
                broadcasts.map(broadcast => (
                  <div key={broadcast.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {broadcast.message}
                    </p>
                    {broadcast.timestamp && (
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDistanceToNow(broadcast.timestamp.toDate(), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 