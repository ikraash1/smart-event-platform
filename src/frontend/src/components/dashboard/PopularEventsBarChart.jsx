import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const PopularEventsBarChart = ({ data, height = 280 }) => {
  if (!data || data.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-16">No event data available yet.</p>;
  }

  const chartData = data.map((e) => ({
    name: e.title.length > 18 ? `${e.title.slice(0, 18)}...` : e.title,
    seatsBooked: e.seatsBooked,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" height={60} />
        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
        <Bar dataKey="seatsBooked" name="Seats Booked" fill="#4f46e5" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PopularEventsBarChart;
