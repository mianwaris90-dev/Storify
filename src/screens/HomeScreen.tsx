import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Order, OperationType } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { handleFirestoreError } from '../lib/error-handler';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, Clock, XCircle, DollarSign, ChevronRight } from 'lucide-react';

export default function HomeScreen() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    cancelled: 0,
    portfolio: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const path = 'orders';
    const q = query(
      collection(db, path),
      where('shopkeeperId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData: Order[] = [];
        let total = 0;
        let pending = 0;
        let cancelled = 0;
        let portfolio = 0;

        snapshot.forEach((doc) => {
          const data = doc.data() as Order;
          const order = { ...data, id: doc.id };
          ordersData.push(order);

          total++;
          if (order.status === 'pending') pending++;
          if (order.status === 'cancelled') cancelled++;
          if (order.status === 'completed') portfolio += order.amount;
        });

        setOrders(ordersData.slice(0, 5)); // Recent 5
        setStats({ total, pending, cancelled, portfolio });
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'orders');
      }
    );

    return () => unsubscribe();
  }, []);

  const statCards = [
    { label: 'Total Orders', value: stats.total, icon: ShoppingBag, color: 'bg-slate-50 text-slate-400', badge: 'Lifetime' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-amber-50 text-amber-500', isPulse: true },
    { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'bg-rose-50 text-rose-500' },
    { label: 'Portfolio', value: formatCurrency(stats.portfolio), icon: DollarSign, color: 'bg-indigo-600 text-white', isMain: true },
  ];

  if (loading) return null;

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{profile?.storeName}</h1>
          <p className="text-sm text-slate-500">Manager Dashboard • <span className="font-semibold text-indigo-600">{profile?.name}</span></p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center border-2 border-white shadow-sm">
          <span className="text-indigo-700 font-bold">{profile?.name.charAt(0)}</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "stat-card p-6 rounded-3xl border shadow-sm flex flex-col justify-between h-36",
                stat.isMain ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-white border-slate-200"
              )}
            >
              <div className="flex justify-between items-start">
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  stat.isMain ? "text-indigo-200" : stat.color.split(' ')[1]
                )}>
                  {stat.label}
                </p>
                {stat.badge && <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">{stat.badge}</span>}
                {stat.isPulse && (
                  <div className="w-4 h-4 rounded-full bg-amber-50 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></div>
                  </div>
                )}
              </div>
              <div className="flex items-end justify-between">
                <h2 className={cn("text-2xl font-black tracking-tight", stat.isMain ? "text-white" : "text-slate-900")}>
                  {stat.value}
                </h2>
                {stat.isMain && <Icon size={24} className="text-indigo-300" />}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Recent Orders</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {orders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ShoppingBag size={48} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-500 font-medium">No orders yet</p>
            </div>
          ) : (
            orders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center space-x-4">
                  <div className="font-mono text-[10px] text-slate-400 w-16">
                    #ORD-{order.id.slice(-4).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{order.customerName}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatCurrency(order.amount)}</p>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-block mt-1",
                      order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-rose-100 text-rose-700'
                    )}>
                      {order.status}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
