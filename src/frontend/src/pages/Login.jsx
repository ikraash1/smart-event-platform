import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarDays } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md p-8">
        <Link to="/" className="flex items-center justify-center gap-2 font-display font-bold text-lg text-ink-900 mb-6">
          <span className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center text-white">
            <CalendarDays size={18} />
          </span>
          EventSphere
        </Link>
        <h1 className="font-display font-bold text-2xl text-ink-900 text-center">Welcome back</h1>
        <p className="text-sm text-slate-500 text-center mt-1">Log in to manage your events and tickets.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1.5">Email address</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-brand-600 font-semibold hover:underline">Sign up</Link>
        </p>

        <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-400 text-center">
          Demo accounts (after running the seed script): admin@example.com / organizer@example.com /
          attendee@example.com — password: password123
        </div>
      </div>
    </div>
  );
};

export default Login;
