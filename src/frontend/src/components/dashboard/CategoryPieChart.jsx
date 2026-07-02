import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#4f46e5', '#fb923c', '#10b981', '#f43f5e', '#0ea5e9', '#a855f7', '#eab308', '#14b8a6', '#64748b', '#f97316'];

const CategoryPieChart = ({ data, dataKey = 'totalBookings', nameKey = '_id', height = 280 }) => {
  if (!data || data.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-16">No category data available yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={50}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryPieChart;
