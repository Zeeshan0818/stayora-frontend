import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { RequireAuth, RequireHost } from './components/RouteGuards';

import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import HotelDetails from './pages/HotelDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

import BookingStart from './pages/booking/BookingStart';
import BookingGuests from './pages/booking/BookingGuests';
import BookingPayment from './pages/booking/BookingPayment';
import BookingConfirmation from './pages/booking/BookingConfirmation';

import Trips from './pages/trips/Trips';
import TripDetails from './pages/trips/TripDetails';

import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminHotels from './pages/admin/AdminHotels';
import AdminHotelForm from './pages/admin/AdminHotelForm';
import AdminHotelDetail from './pages/admin/AdminHotelDetail';
import AdminRoomForm from './pages/admin/AdminRoomForm';
import AdminRoomEdit from './pages/admin/AdminRoomEdit';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <Routes>

          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Hotels */}
          <Route path="/hotels" element={<SearchResults />} />
          <Route path="/hotels/:hotelId" element={<HotelDetails />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Profile */}
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />

          {/* Booking flow — each step requires an authenticated session */}
          <Route
            path="/booking/start"
            element={
              <RequireAuth>
                <BookingStart />
              </RequireAuth>
            }
          />

          <Route
            path="/booking/:bookingId/guests"
            element={
              <RequireAuth>
                <BookingGuests />
              </RequireAuth>
            }
          />

          <Route
            path="/booking/:bookingId/payment"
            element={
              <RequireAuth>
                <BookingPayment />
              </RequireAuth>
            }
          />

          <Route
            path="/booking/:bookingId/confirmation"
            element={
              <RequireAuth>
                <BookingConfirmation />
              </RequireAuth>
            }
          />

          {/* Trips */}
          <Route
            path="/trips"
            element={
              <RequireAuth>
                <Trips />
              </RequireAuth>
            }
          />

          <Route
            path="/trips/:bookingId"
            element={
              <RequireAuth>
                <TripDetails />
              </RequireAuth>
            }
          />

          {/* Host / Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <RequireHost>
                <AdminLayout />
              </RequireHost>
            }
          >
            {/* Admin Dashboard */}
            <Route index element={<AdminOverview />} />

            {/* Hotels */}
            <Route path="hotels" element={<AdminHotels />} />

            {/* Create Hotel */}
            <Route path="hotels/new" element={<AdminHotelForm />} />

            {/* Hotel Details */}
            <Route
              path="hotels/:hotelId"
              element={<AdminHotelDetail />}
            />

            {/* Edit Hotel */}
            <Route
              path="hotels/:hotelId/edit"
              element={<AdminHotelForm />}
            />

            {/* Create Room */}
            <Route
              path="hotels/:hotelId/rooms/new"
              element={<AdminRoomForm />}
            />

            {/* Edit Room */}
            <Route
              path="hotels/:hotelId/rooms/:roomId/edit"
              element={<AdminRoomEdit />}
            />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </main>

      <Footer />
    </div>
  );
}