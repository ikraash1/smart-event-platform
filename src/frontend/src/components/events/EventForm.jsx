import { useState } from 'react';

const CATEGORIES = [
  'Technology', 'Business', 'Music', 'Sports', 'Education',
  'Health', 'Art & Culture', 'Networking', 'Food & Drink', 'Other',
];

const toInputDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const EventForm = ({ initialValues, onSubmit, submitLabel = 'Create Event', loading }) => {
  const [form, setForm] = useState({
    title: initialValues?.title || '',
    description: initialValues?.description || '',
    category: initialValues?.category || CATEGORIES[0],
    tags: initialValues?.tags?.join(', ') || '',
    venue: initialValues?.venue || '',
    address: initialValues?.address || '',
    isOnline: initialValues?.isOnline || false,
    onlineLink: initialValues?.onlineLink || '',
    startDate: toInputDateTime(initialValues?.startDate) || '',
    endDate: toInputDateTime(initialValues?.endDate) || '',
    coverImage: initialValues?.coverImage || '',
    price: initialValues?.price ?? 0,
    capacity: initialValues?.capacity ?? 50,
    status: initialValues?.status || 'published',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      capacity: Number(form.capacity),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-ink-800 mb-1.5">Event title *</label>
        <input name="title" value={form.title} onChange={handleChange} required className="input-field" placeholder="e.g. Karachi Tech Summit 2026" />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-800 mb-1.5">Description *</label>
        <textarea name="description" value={form.description} onChange={handleChange} required rows={4} className="input-field" placeholder="What is this event about? What should attendees expect?" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink-800 mb-1.5">Category *</label>
          <select name="category" value={form.category} onChange={handleChange} className="input-field">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-800 mb-1.5">Tags (comma separated)</label>
          <input name="tags" value={form.tags} onChange={handleChange} className="input-field" placeholder="AI, Startups, Networking" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink-800 mb-1.5">Start date & time *</label>
          <input type="datetime-local" name="startDate" value={form.startDate} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-800 mb-1.5">End date & time *</label>
          <input type="datetime-local" name="endDate" value={form.endDate} onChange={handleChange} required className="input-field" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="isOnline" name="isOnline" checked={form.isOnline} onChange={handleChange} className="rounded border-slate-300 text-brand-600 focus:ring-brand-300" />
        <label htmlFor="isOnline" className="text-sm text-ink-800">This is an online event</label>
      </div>

      {form.isOnline ? (
        <div>
          <label className="block text-sm font-medium text-ink-800 mb-1.5">Online meeting link</label>
          <input name="onlineLink" value={form.onlineLink} onChange={handleChange} className="input-field" placeholder="https://meet.example.com/..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1.5">Venue *</label>
            <input name="venue" value={form.venue} onChange={handleChange} required className="input-field" placeholder="e.g. Expo Centre Karachi" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1.5">Address</label>
            <input name="address" value={form.address} onChange={handleChange} className="input-field" placeholder="Street, city" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink-800 mb-1.5">Ticket price (PKR)</label>
          <input type="number" name="price" min="0" value={form.price} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-800 mb-1.5">Capacity *</label>
          <input type="number" name="capacity" min="1" value={form.capacity} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-800 mb-1.5">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="input-field">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-800 mb-1.5">Cover image URL (optional)</label>
        <input name="coverImage" value={form.coverImage} onChange={handleChange} className="input-field" placeholder="https://..." />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto">
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
};

export default EventForm;
