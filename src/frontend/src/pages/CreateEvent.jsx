import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import EventForm from '../components/events/EventForm';
import api from '../api/axios';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/events', payload);
      toast.success('Event created successfully');
      navigate(`/events/${data.event._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display font-bold text-2xl text-ink-900">Create a new event</h1>
      <p className="text-slate-500 text-sm mt-1">Fill in the details below to publish your event.</p>

      <div className="card p-6 mt-6">
        <EventForm onSubmit={handleSubmit} submitLabel="Create Event" loading={loading} />
      </div>
    </div>
  );
};

export default CreateEvent;
