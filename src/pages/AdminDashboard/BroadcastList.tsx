import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Bell, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface Broadcast {
  id: string;
  message: string;
  timestamp: Timestamp;
  status: 'active' | 'recalled';
  sentBy: string;
}

export default function BroadcastList() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null);

  useEffect(() => {
    const broadcastsRef = collection(db, 'admin_broadcasts');
    const q = query(broadcastsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Broadcast[];
        setBroadcasts(messages);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching broadcasts:', error);
        toast.error('Failed to fetch broadcasts');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (broadcastId: string) => {
    setDeletingId(broadcastId);
    try {
      await deleteDoc(doc(db, 'admin_broadcasts', broadcastId));
      toast.success('Broadcast message deleted');
    } catch (error) {
      console.error('Error deleting broadcast:', error);
      toast.error('Failed to delete broadcast');
    } finally {
      setDeletingId(null);
      setShowConfirmDelete(false);
      setSelectedBroadcast(null);
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
      <div className="flex items-center gap-2 mb-6">
        <Bell className="text-primary" size={24} />
        <h2 className="text-2xl font-bold">Broadcast Messages</h2>
        <span className="text-sm text-gray-500 ml-auto">
          Total: {broadcasts.length}
        </span>
      </div>

      <div className="space-y-4">
        {broadcasts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No broadcast messages</p>
        ) : (
          broadcasts.map(broadcast => (
            <div
              key={broadcast.id}
              className="p-4 bg-white rounded-lg shadow-sm border relative group"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {broadcast.message}
                  </p>
                  {broadcast.timestamp && (
                    <p className="text-xs text-gray-500 mt-2">
                      Sent {formatDistanceToNow(broadcast.timestamp.toDate(), { addSuffix: true })}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedBroadcast(broadcast);
                    setShowConfirmDelete(true);
                  }}
                  className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  disabled={deletingId === broadcast.id}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && selectedBroadcast && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Delete Broadcast</h3>
              <button
                onClick={() => {
                  setShowConfirmDelete(false);
                  setSelectedBroadcast(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this broadcast message? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowConfirmDelete(false);
                  setSelectedBroadcast(null);
                }}
                className="btn"
                disabled={!!deletingId}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedBroadcast.id)}
                className="btn bg-red-500 text-white hover:bg-red-600"
                disabled={!!deletingId}
              >
                {deletingId === selectedBroadcast.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 