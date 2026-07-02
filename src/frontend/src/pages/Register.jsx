import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarDays } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const INTEREST_OPTIONS = ['Technology', 'Business', 'Music', 'Sports', 'Education', 'Health', 'Art & Culture', 'Networking'];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'attendee', interests: [] });
  const [loading, setLoading] = useState(false);

  const toggleInterest = (interest) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to EventSphere, ${user.name.split(' ')[0]}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
        <h1 className="font-display font-bold text-2xl text-ink-900 text-center">Create your account</h1>
        <p className="text-sm text-slate-500 text-center mt-1">Join as an attendee or start hosting events.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1.5">Full name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1.5">Email address</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1.5">Password</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" placeholder="At least 6 characters" />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-800 mb-2">I want to join as</label>
            <div className="grid grid-cols-2 gap-3">
              {['attendee', 'organizer'].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setForm({ ...form, role: r })}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium capitalize transition ${
                    form.role === r ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-brand-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {form.role === 'attendee' && (
            <div>
              <label className="block text-sm font-medium text-ink-800 mb-2">Interests (helps us recommend events)</label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => (
                  <button
                    type="button"
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`badge border ${
                      form.interests.includes(interest)
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'border-slate-200 text-slate-600 hover:border-brand-300'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
