import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { LogOut, User, Store, Mail, CheckCircle } from 'lucide-react';
import { OperationType } from '../types';
import { handleFirestoreError } from '../lib/error-handler';

export default function ProfileScreen() {
  const { profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [storeName, setStoreName] = useState(profile?.storeName || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    setSuccess(false);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        name,
        storeName,
      });
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center pt-8">
        <div className="w-28 h-28 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-indigo-100 mb-6 text-4xl font-black rotate-3">
          {profile?.name.charAt(0)}
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{profile?.name}</h1>
        <p className="text-slate-400 font-bold tracking-[0.3em] uppercase text-[10px] mt-2">{profile?.storeName}</p>
      </div>

      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200">
        <h2 className="text-xl font-black mb-8 text-slate-900 tracking-tight">Manage Account</h2>
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center text-[10px] font-black text-slate-400 mb-1 uppercase tracking-[0.2em] ml-1">
              <User size={12} className="mr-2" />
              Full Name
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-bold text-slate-700"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-[10px] font-black text-slate-400 mb-1 uppercase tracking-[0.2em] ml-1">
              <Store size={12} className="mr-2" />
              Store Name
            </label>
            <input
              required
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-bold text-slate-700"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-[10px] font-black text-slate-300 mb-1 uppercase tracking-[0.2em] ml-1">
              <Mail size={12} className="mr-2" />
              Email Address
            </label>
            <input
              disabled
              type="email"
              value={profile?.email}
              className="w-full px-5 py-4 bg-slate-100 border-transparent rounded-2xl text-slate-400 font-bold cursor-not-allowed"
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center active:scale-[0.98]"
          >
            {success ? (
              <>
                <CheckCircle size={24} className="mr-3" />
                Profile Updated!
              </>
            ) : loading ? 'Saving Changes...' : 'Update Details'}
          </button>
        </form>
      </div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center p-6 text-rose-500 font-black bg-white rounded-[32px] border border-rose-50 shadow-sm hover:bg-rose-50 transition-all active:scale-[0.98]"
      >
        <LogOut size={20} className="mr-3" />
        Sign Out Manager
      </button>

      <div className="text-center pb-12">
        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.4em]">
          Cash State v1.2.0
        </p>
      </div>
    </div>
  );
}
