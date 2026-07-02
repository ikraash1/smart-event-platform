import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import EventForm from '../components/events/EventForm';
import Loader from '../components/common/Loader';
import api from '../api/axios';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        setEvent(data.event);
      } catch {
        toast.error('Event not found');
        navigate('/organizer/dashboard');
      } finally {
        setFetching(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  const handleSubmit = async (payload) => {
    setLoading(true);
    try {
      await api.put(`/events/${id}`, payload);
      toast.success('Event updated successfully');
      navigate(`/events/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Loader fullScreen />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display font-bold text-2xl text-ink-900">Edit event</h1>
      <p className="text-slate-500 text-sm mt-1">Update your event details below.</p>

      <div className="card p-6 mt-6">
        <EventForm initialValues={event} onSubmit={handleSubmit} submitLabel="Save Changes" loading={loading} />
      </div>
    </div>
  );
};

export default EditEvent;
