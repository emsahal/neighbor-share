import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import UserProfile from '../components/UserProfile';

function Profile() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    api
      .get('/users/profile')
      .then((res) => {
        setProfile(res.data.user);
        setItems(res.data.items);
      })
      .catch((err) => {
        // Error handling removed; silently fail
      });
  }, []);

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg
            className="h-12 w-12 mx-auto text-gray-400 animate-spin mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 12a8 8 0 1116 0A8 8 0 014 12z"
            />
          </svg>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Profile</h1>
          <p className="text-gray-600">View your details, listed items, and reviews</p>
        </div>

        {/* User Profile */}
        <UserProfile user={profile} items={items} />
      </div>
    </div>
  );
}

export default Profile;