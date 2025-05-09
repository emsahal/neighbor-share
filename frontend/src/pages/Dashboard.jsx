import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';
import Notification from '../components/Notification';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    availability: 'Hour',
    location: user?.location || '',
    prices: { hourly: '', daily: '', weekly: '' },
    image: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [activeTab, setActiveTab] = useState('my-items');
  const [timers, setTimers] = useState({}); // Store countdown timers for each request

  useEffect(() => {
    if (user) {
      api
        .get('/users/profile')
        .then((res) => setItems(res.data.items || []))
        .catch((err) => setError('Failed to load items'));

      api
        .get('/requests')
        .then((res) => setRequests(res.data || []))
        .catch((err) => setError('Failed to load requests'));
    }
  }, [user]);

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        const newTimers = { ...prevTimers };
        requests.forEach((request) => {
          if (
            request.status === 'Accepted' &&
            request.requester?._id === user?._id &&
            request.rentalStartTime
          ) {
            const startTime = new Date(request.rentalStartTime).getTime();
            const maxDuration = 59 * 3600 * 1000 + 59 * 60 * 1000 + 59 * 1000; // 59:59:59 in ms
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, maxDuration - elapsed);

            if (remaining > 0) {
              const hours = Math.floor(remaining / (1000 * 3600));
              const minutes = Math.floor((remaining % (1000 * 3600)) / (1000 * 60));
              const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
              newTimers[request._id] = `${hours.toString().padStart(2, '0')}:${minutes
                .toString()
                .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            } else {
              newTimers[request._id] = '00:00:00';
            }
          }
        });
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [requests, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', formData.category);
      data.append('availability', formData.availability);
      data.append('location', formData.location);
      data.append('prices[hourly]', parseInt(formData.prices.hourly) || 0);
      data.append('prices[daily]', parseInt(formData.prices.daily) || 0);
      data.append('prices[weekly]', parseInt(formData.prices.weekly) || 0);
      if (formData.image) {
        data.append('image', formData.image);
      }

      const res = await api.post('/items', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setItems([...items, res.data]);
      setSuccess('Item added successfully');
      setFormData({
        name: '',
        category: '',
        availability: 'Hour',
        location: user?.location || '',
        prices: { hourly: '', daily: '', weekly: '' },
        image: null,
      });
      setShowAddItemForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setFormData({ ...formData, image: file });
    }
  };

  const handleRequest = (requestedItem) => {
    const availabilityToPriceKey = {
      Hour: 'hourly',
      Day: 'daily',
      Week: 'weekly',
    };
    const priceKey = requestedItem.availability ? availabilityToPriceKey[requestedItem.availability] : null;
    const price =
      requestedItem.prices && priceKey && requestedItem.prices[priceKey] !== undefined
        ? requestedItem.prices[priceKey]
        : 'N/A';
    setSuccess(`Request sent for ${requestedItem.name} ${price !== 'N/A' ? `for PKR ${price}` : ''}`);
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await api.put(`/requests/${requestId}/accept`);
      setRequests(
        requests.map((req) =>
          req._id === requestId ? { ...req, status: 'Accepted', rentalStartTime: new Date() } : req
        )
      );
      setItems(
        items.map((item) =>
          item._id === res.data.item._id ? { ...item, status: 'Borrowed' } : item
        )
      );
      setSuccess('Request accepted');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      await api.put(`/requests/${requestId}/decline`);
      setRequests(
        requests.map((req) =>
          req._id === requestId ? { ...req, status: 'Declined' } : req
        )
      );
      setSuccess('Request declined');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to decline request');
    }
  };

  const handleReturn = async (requestId) => {
    try {
      const res = await api.put(`/requests/${requestId}/return`);
      setRequests(
        requests.map((req) =>
          req._id === requestId ? { ...req, status: 'Completed' } : req
        )
      );
      setItems(
        items.map((item) =>
          item._id === res.data.item._id ? { ...item, status: 'Available' } : item
        )
      );
      setSuccess('Item returned successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to return item');
    }
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            You need to be logged in to view your dashboard
          </h1>
          <a
            href="/login"
            className="bg-neighborshare-purple text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Log in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600">Manage your shared items and requests</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-neighborshare-purple">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Items Shared</p>
                <p className="text-xl font-semibold text-gray-900">{items.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gray-50 text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Active Loans</p>
                <p className="text-xl font-semibold text-gray-900">
                  {items.filter((item) => item.status === 'Borrowed').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-50 text-green-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Completed Exchanges</p>
                <p className="text-xl font-semibold text-gray-900">
                  {requests.filter((req) => req.status === 'Completed').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-50 text-yellow-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Your Rating</p>
                <p className="text-xl font-semibold text-gray-900">{user.rating || 'N/A'} / 5</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 mb-8">
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'my-items'
                  ? 'text-neighborshare-purple border-b-2 border-neighborshare nephropathy-purple'
                  : 'text-gray-500 hover:text-purple-700'
              }`}
              onClick={() => setActiveTab('my-items')}
            >
              My Items
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'requests'
                  ? 'text-neighborshare-purple border-b-2 border-neighborshare-purple'
                  : 'text-gray-500 hover:text-purple-700'
              }`}
              onClick={() => setActiveTab('requests')}
            >
              Requests
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'my-items' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Items You're Sharing</h2>
                  <button
                    onClick={() => setShowAddItemForm(!showAddItemForm)}
                    className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    {showAddItemForm ? 'Cancel' : '+ Add New Item'}
                  </button>
                </div>

                {/* Add Item Form */}
                {showAddItemForm && (
                  <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Add a New Item</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Item Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neighborshare-purple focus:border-transparent"
                            placeholder="e.g. Power Drill"
                            required
                            aria-label="Item Name"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="category"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Category
                          </label>
                          <select
                            id="category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neighborshare-purple focus:border-transparent"
                            required
                            aria-label="Category"
                          >
                            <option value="">Select Category</option>
                            <option value="Tools">Tools</option>
                            <option value="Kitchen">Kitchen</option>
                            <option value="Cleaning">Cleaning</option>
                          </select>
                        </div>
                        <div>
                          <label
                            htmlFor="availability"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Availability
                          </label>
                          <select
                            id="availability"
                            value={formData.availability}
                            onChange={(e) =>
                              setFormData({ ...formData, availability: e.target.value })
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neighborshare-purple focus:border-transparent"
                            required
                            aria-label="Availability"
                          >
                            <option value="Hour">Hour</option>
                            <option value="Day">Day</option>
                            <option value="Week">Week</option>
                          </select>
                        </div>
                        <div>
                          <label
                            htmlFor="location"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Location
                          </label>
                          <input
                            type="text"
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neighborshare-purple focus:border-transparent"
                            required
                            aria-label="Location"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="hourlyPrice"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Hourly Price (PKR)
                          </label>
                          <input
                            type="number"
                            id="hourlyPrice"
                            value={formData.prices.hourly}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                prices: { ...formData.prices, hourly: e.target.value },
                              })
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neighborshare-purple focus:border-transparent"
                            min="0"
                            aria-label="Hourly Price"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="dailyPrice"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Daily Price (PKR)
                          </label>
                          <input
                            type="number"
                            id="dailyPrice"
                            value={formData.prices.daily}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                prices: { ...formData.prices, daily: e.target.value },
                              })
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neighborshare-purple focus:border-transparent"
                            min="0"
                            aria-label="Daily Price"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="weeklyPrice"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Weekly Price (PKR)
                          </label>
                          <input
                            type="number"
                            id="weeklyPrice"
                            value={formData.prices.weekly}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                prices: { ...formData.prices, weekly: e.target.value },
                              })
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neighborshare-purple focus:border-transparent"
                            min="0"
                            aria-label="Weekly Price"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="image"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Item Image
                          </label>
                          <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            aria-label="Item Image"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Add Item
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Items List */}
                {items.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                      <ItemCard key={item._id} item={item} onRequest={handleRequest} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <svg
                      className="h-12 w-12 mx-auto text-gray-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
                    <p className="text-gray-500 mb-4">Start sharing by adding your first item.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'requests' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Item Requests</h2>
                {requests.length > 0 ? (
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <div
                        key={request._id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <p className="font-semibold">
                          {(request.requester && request.requester.name) || 'Unknown User'} requested{' '}
                          {(request.item && request.item.name) || 'Unknown Item'} for {request.availability}
                        </p>
                        <p className="text-sm text-gray-600">Status: {request.status}</p>
                        <p className="text-sm text-gray-600">
                          Requested on: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                        {request.status === 'Accepted' && request.requester?._id === user._id && (
                          <p className="text-sm text-gray-600">
                            Time Remaining: {timers[request._id] || 'Loading...'}
                          </p>
                        )}
                        <div className="mt-2 flex space-x-2">
                          {request.owner?._id === user._id && request.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleAcceptRequest(request._id)}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleDeclineRequest(request._id)}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          {request.requester?._id === user._id && request.status === 'Accepted' && (
                            <button
                              onClick={() => handleReturn(request._id)}
                              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                              Return
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <svg
                      className="h-12 w-12 mx-auto text-gray-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
                    <p className="text-gray-500">
                      You'll be notified when someone requests to borrow your item.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {error && <Notification message={error} type="error" />}
        {success && <Notification message={success} type="success" />}
      </div>
    </div>
  );
}

export default Dashboard; 