import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { toFriendlyError } from '../api/axiosClient';
import { cacheName } from '../utils/profileCache';

export default function Signup() {
  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('GUEST');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Fill in your name, email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Use a password with at least 6 characters.');
      return;
    }

    setSubmitting(true);

    try {
      const userDto = await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      // Cache the name locally — the backend has no GET /users/me,
      // and the name is only ever returned once here.
      cacheName(userDto.email, userDto.name);

      toast.success('Account created — please log in.');
      navigate('/login');
    } catch (err) {
      setError(toFriendlyError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page flex min-h-[75vh] items-center justify-center py-16">
      <div className="w-full max-w-md">

        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Logo />

          <div>
            <h1 className="text-2xl">Create your account</h1>

            <p className="mt-1 text-sm text-muted">
              Join Stayora to book and manage your stays.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 p-6">

          {/* Full Name */}
          <div>
            <label className="label" htmlFor="name">
              Full name
            </label>

            <input
              id="name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="label" htmlFor="signup-email">
              Email
            </label>

            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="label" htmlFor="signup-password">
              Password
            </label>

            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>

          {/* Account Type */}
          <div>
            <label className="label">
              Account type
            </label>

            <div className="grid grid-cols-2 gap-3">

              {/* Guest */}
              <button
                type="button"
                onClick={() => setRole('GUEST')}
                className={`rounded-xl border p-3 text-left transition ${
                  role === 'GUEST'
                    ? 'border-pine-600 bg-pine-50'
                    : 'border-ink/10 hover:border-ink/30'
                }`}
              >
                <p className="font-semibold text-ink">
                  Guest
                </p>

                <p className="mt-1 text-xs text-muted">
                  Book hotels and manage stays
                </p>
              </button>

              {/* Hotel Manager */}
              <button
                type="button"
                onClick={() => setRole('HOTEL_MANAGER')}
                className={`rounded-xl border p-3 text-left transition ${
                  role === 'HOTEL_MANAGER'
                    ? 'border-pine-600 bg-pine-50'
                    : 'border-ink/10 hover:border-ink/30'
                }`}
              >
                <p className="font-semibold text-ink">
                  Hotel Manager
                </p>

                <p className="mt-1 text-xs text-muted">
                  Manage hotels and rooms
                </p>
              </button>

            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            <UserPlus size={16} />

            {submitting
              ? 'Creating account…'
              : 'Create account'}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}

          <Link
            to="/login"
            className="font-semibold text-ink underline underline-offset-4"
          >
            Log in
          </Link>
        </p>

      </div>
    </div>
  );
}