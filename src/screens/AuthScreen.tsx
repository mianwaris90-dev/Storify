import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { motion } from 'motion/react';
import { LayoutGrid } from 'lucide-react';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const { user } = userCredential;
        
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name,
          email,
          storeName,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-auto"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-200 mb-4 rotate-3">
            <LayoutGrid size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Cash State</h1>
          <p className="text-slate-400 font-bold tracking-[0.3em] uppercase text-[10px] mt-2">Order Management</p>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200">
          <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-medium"
                    placeholder="Sarah Jenkins"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Store Name</label>
                  <input
                    required
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-medium"
                    placeholder="Vintage Threads Boutique"
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-medium"
                placeholder="sarah@boutique.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-medium"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-rose-500 text-xs font-bold bg-rose-50 p-4 rounded-xl border border-rose-100 animate-shake">
                {error}
              </p>
            )}

            <button
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register'}
            </button>
          </form>

          <p className="text-center mt-8 text-slate-500 font-bold text-sm tracking-tight">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 font-black hover:underline"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
