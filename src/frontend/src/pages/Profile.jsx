import { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, Shield } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const INTEREST_OPTIONS = ['Technology', 'Business', 'Music', 'Sports', 'Education', 'Health', 'Art & Culture', 'Networking', 'Food & Drink', 'Other'];

const roleBadge = {
  admin: 'bg-rose-50 text-rose-700',
  organizer: 'bg-amber-50 text-amber-700',
  attendee: 'bg-brand-50 text-brand-700',
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    interests: user?.interests || [],
    password: '',
  });
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
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      const { data } = await api.put('/users/profile', payload);
      updateUser(data.user);
      toast.success('Profile updated successfully');
      setForm((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display font-bold text-2xl text-ink-900">Profile settings</h1>
      <p className="text-slate-500 text-sm mt-1">Manage your personal information and preferences.</p>

      <div className="card p-6 mt-6 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-display font-bold text-2xl">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h2 className="font-display font-semibold text-lg text-ink-900">{user?.name}</h2>
          <p className="text-sm text-slate-500 flex items-center gap-1.5"><Mail size={14} /> {user?.email}</p>
          <span className={`badge mt-1.5 ${roleBadge[user?.role]}`}>
            <Shield size={12} className="mr-1" /> {user?.role}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 mt-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1.5">Full name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1.5">Phone number</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="+92 3xx xxxxxxx" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-800 mb-1.5">Bio</label>
          <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input-field" placeholder="Tell us a little about yourself" />
        </div>

        {user?.role === 'attendee' && (
          <div>
            <label className="block text-sm font-medium text-ink-800 mb-2">Interests</label>
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
            <p className="text-xs text-slate-400 mt-2">These power your personalized recommendations on the "For You" page.</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-ink-800 mb-1.5">New password (leave blank to keep current)</label>
          <input type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" placeholder="••••••••" />
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
