import { useEffect, useState } from 'react';
import { Users, CalendarDays, Ticket, DollarSign, Trash2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Loader from '../components/common/Loader';
import StatCard from '../components/dashboard/StatCard';
import TrendLineChart from '../components/dashboard/TrendLineChart';
import CategoryPieChart from '../components/dashboard/CategoryPieChart';
import PopularEventsBarChart from '../components/dashboard/PopularEventsBarChart';
import Modal from '../components/common/Modal';

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [popularEvents, setPopularEvents] = useState([]);
  const [engagement, setEngagement] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [ov, trendRes, cat, pop, eng, usersRes] = await Promise.all([
        api.get('/analytics/admin/overview'),
        api.get('/analytics/attendance-trend?days=14'),
        api.get('/analytics/bookings-by-category'),
        api.get('/analytics/popular-events?limit=5'),
        api.get('/analytics/user-engagement?limit=8'),
        api.get('/users?limit=8'),
      ]);
      setOverview(ov.data.overview);
      setTrend(trendRes.data.data);
      setCategoryData(cat.data.data);
      setPopularEvents(pop.data.events);
      setEngagement(eng.data.data);
      setUsers(usersRes.data.users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const toggleActive = async (u) => {
    try {
      await api.put(`/users/${u._id}`, { isActive: !u.isActive });
      toast.success(`${u.name} ${u.isActive ? 'deactivated' : 'reactivated'}`);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${target._id}`);
      toast.success('User deleted');
      setTarget(null);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display font-bold text-2xl text-ink-900">Admin Dashboard</h1>
      <p className="text-slate-500 text-sm mt-1">Platform-wide analytics and user management.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
        <StatCard icon={Users} label="Total Users" value={overview?.totalUsers ?? 0} color="brand" />
        <StatCard icon={CalendarDays} label="Total Events" value={overview?.totalEvents ?? 0} color="accent" />
        <StatCard icon={Ticket} label="Confirmed Bookings" value={overview?.totalBookings ?? 0} color="emerald" />
        <StatCard icon={DollarSign} label="Total Revenue" value={`PKR ${(overview?.totalRevenue ?? 0).toLocaleString()}`} color="rose" />
        <StatCard icon={Users} label="Total Check-ins" value={overview?.totalAttendance ?? 0} color="brand" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        <div className="card p-5">
          <h2 className="font-display font-semibold text-ink-900 mb-3">Attendance trend (last 14 days)</h2>
          <TrendLineChart data={trend} lines={[{ key: 'attendance', label: 'Check-ins' }]} />
        </div>
        <div className="card p-5">
          <h2 className="font-display font-semibold text-ink-900 mb-3">Bookings by category</h2>
          <CategoryPieChart data={categoryData} />
        </div>
      </div>

      <div className="card p-5 mt-5">
        <h2 className="font-display font-semibold text-ink-900 mb-3">Most popular events</h2>
        <PopularEventsBarChart data={popularEvents} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-8">
        <div>
          <h2 className="font-display font-semibold text-lg text-ink-900 mb-3">Top engaged users (AI score)</h2>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Bookings</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {engagement.map((u) => (
                  <tr key={u._id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-900">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{u.bookingsCount}</td>
                    <td className="px-4 py-3">
                      <span className="badge bg-brand-50 text-brand-700">{u.engagementScore}/100</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="font-display font-semibold text-lg text-ink-900 mb-3">Recent users</h2>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-900">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-slate-100 text-slate-600 capitalize">{u.role}</span>
                      {!u.isActive && <span className="badge bg-rose-50 text-rose-600 ml-1">inactive</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => toggleActive(u)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500" title={u.isActive ? 'Deactivate' : 'Activate'}>
                          <Shield size={15} />
                        </button>
                        <button onClick={() => setTarget(u)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-500" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={!!target} onClose={() => setTarget(null)} title="Delete this user?">
        <p className="text-sm text-slate-600">
          This will permanently delete <strong>{target?.name}</strong>&apos;s account. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={() => setTarget(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="btn-danger">Delete permanently</button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
