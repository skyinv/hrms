import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Bell, Send, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function BroadcastMessage() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);
    try {
      const broadcastData = {
        message: message.trim(),
        timestamp: serverTimestamp(),
        status: 'active',
        sentBy: 'admin'
      };

      await addDoc(collection(db, 'admin_broadcasts'), broadcastData);
      console.log('Broadcast sent:', broadcastData);
      toast.success('Message broadcasted successfully');
      setMessage('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error broadcasting message:', error);
      toast.error('Failed to broadcast message');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary flex items-center gap-2"
      >
        <Bell size={20} />
        Broadcast Message
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Broadcast Message</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full h-48 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Type your message here..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="btn"
                disabled={sending}
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="btn-primary flex items-center gap-2"
                disabled={sending}
              >
                <Send size={20} />
                {sending ? 'Sending...' : 'Send Broadcast'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 