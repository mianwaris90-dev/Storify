import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OperationType } from '../types';
import { handleFirestoreError } from '../lib/error-handler';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewOrderModal({ isOpen, onClose }: NewOrderModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      const path = 'orders';
      await addDoc(collection(db, path), {
        shopkeeperId: auth.currentUser.uid,
        customerName,
        amount: parseFloat(amount),
        notes,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      onClose();
      setCustomerName('');
      setAmount('');
      setNotes('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[60]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] p-8 z-[70] shadow-2xl safe-bottom border-t border-slate-100"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Order</h2>
              <button onClick={onClose} className="p-2.5 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-colors active:scale-90">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Customer Name</label>
                <input
                  required
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-bold text-slate-700"
                  placeholder="e.g. Alice Montgomery"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Order Amount</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-black text-2xl text-slate-900"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Special Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all min-h-[120px] font-medium text-slate-600"
                  placeholder="Any size adjustments or delivery preferences..."
                />
              </div>

              <button
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {loading ? 'Processing...' : 'Create Order Now'}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
