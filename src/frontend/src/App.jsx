import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import MyBookings from './pages/MyBookings';
import MyTickets from './pages/MyTickets';
import Recommendations from './pages/Recommendations';
import OrganizerDashboard from './pages/OrganizerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AttendeeManagement from './pages/AttendeeManagement';
import ScanQR from './pages/ScanQR';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/my-tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
          <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />

          <Route
            path="/events/create"
            element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><CreateEvent /></ProtectedRoute>}
          />
          <Route
            path="/events/:id/edit"
            element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><EditEvent /></ProtectedRoute>}
          />
          <Route
            path="/events/:id/attendees"
            element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><AttendeeManagement /></ProtectedRoute>}
          />
          <Route
            path="/organizer/dashboard"
            element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><OrganizerDashboard /></ProtectedRoute>}
          />
          <Route
            path="/scan"
            element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><ScanQR /></ProtectedRoute>}
          />
          <Route
            path="/admin/dashboard"
            element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>}
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
