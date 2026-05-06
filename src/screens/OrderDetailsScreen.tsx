import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderStatus, OperationType } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { handleFirestoreError } from '../lib/error-handler';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, XCircle, Clock, StickyNote } from 'lucide-react';

export default function OrderDetailsScreen() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const path = `orders/${orderId}`;
    const unsubscribe = onSnapshot(
      doc(db, 'orders', orderId),
      (snapshot) => {
        if (snapshot.exists()) {
          setOrder({ ...snapshot.data() as Order, id: snapshot.id });
        } else {
          navigate('/');
        }
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );

    return () => unsubscribe();
  }, [orderId, navigate]);

  const updateStatus = async (newStatus: OrderStatus) => {
    if (!orderId) return;
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  if (loading || !order) return null;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-slate-400 font-bold hover:text-indigo-600 transition-colors group"
      >
        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 flex flex-col items-center text-center">
        <div className={cn(
          "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-sm",
          order.status === 'pending' ? 'bg-amber-50 text-amber-500' :
          order.status === 'completed' ? 'bg-emerald-50 text-emerald-500' :
          'bg-rose-50 text-rose-500'
        )}>
          {order.status === 'pending' ? <Clock size={40} /> :
           order.status === 'completed' ? <CheckCircle2 size={40} /> :
           <XCircle size={40} />}
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-1 leading-tight tracking-tight">{order.customerName}</h1>
        <p className={cn(
          "text-[10px] font-black uppercase tracking-[0.3em] mb-8",
          order.status === 'pending' ? 'text-amber-500' :
          order.status === 'completed' ? 'text-emerald-500' :
          'text-rose-500'
        )}>
          {order.status}
        </p>

        <div className="text-5xl font-black text-slate-900 mb-10 tracking-tighter">
          {formatCurrency(order.amount)}
        </div>

        {order.notes && (
          <div className="w-full bg-slate-50 p-6 rounded-3xl text-left flex items-start space-x-4 mb-8 border border-slate-100/50">
            <StickyNote size={20} className="text-slate-300 mt-1 flex-shrink-0" />
            <p className="text-slate-600 font-medium leading-relaxed italic">"{order.notes}"</p>
          </div>
        )}

        <div className="w-full grid grid-cols-1 gap-4">
          {order.status === 'pending' && (
            <>
              <button
                onClick={() => updateStatus('completed')}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center active:scale-[0.98]"
              >
                <CheckCircle2 size={24} className="mr-3" />
                Mark as Completed
              </button>
              <button
                onClick={() => updateStatus('cancelled')}
                className="w-full bg-slate-100 text-slate-600 py-5 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all flex items-center justify-center active:scale-[0.98]"
              >
                <XCircle size={22} className="mr-3" />
                Cancel Order
              </button>
            </>
          )}
          {order.status !== 'pending' && (
            <div className="bg-slate-50 py-4 rounded-2xl border border-slate-100">
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">This order is {order.status}</p>
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">
          Created: {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 'Just now'}
        </p>
      </div>
    </div>
  );
}
