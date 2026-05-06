import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Message, OperationType } from '../types';
import { handleFirestoreError } from '../lib/error-handler';
import { motion } from 'motion/react';
import { Bell, Info, Mail } from 'lucide-react';

export default function MessagesScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'messages'),
      where('shopkeeperId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: Message[] = [];
        snapshot.forEach((doc) => {
          msgs.push({ ...doc.data() as Message, id: doc.id });
        });
        setMessages(msgs);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'messages');
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4 mb-2">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 text-indigo-600">
          <Bell size={24} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inbox</h1>
      </div>

      <div className="space-y-5">
        {messages.length === 0 ? (
          <div className="bg-white p-16 rounded-[40px] border border-slate-200 text-center flex flex-col items-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Mail size={40} className="text-slate-200" />
            </div>
            <p className="text-slate-900 font-black text-xl mb-2 tracking-tight">Your inbox is empty</p>
            <p className="text-slate-400 text-sm max-w-[200px] font-medium leading-relaxed">System notifications and admin messages will appear here.</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-3 relative overflow-hidden group hover:border-indigo-200 transition-colors"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600 opacity-20 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-slate-800 text-lg tracking-tight">{msg.title}</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">
                  {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleDateString() : 'Now'}
                </span>
              </div>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">{msg.body}</p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
