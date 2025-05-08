import { useState, useEffect } from 'react';
import api from '../utils/api';
import SearchBar from '../components/SearchBar';
import ItemCard from '../components/ItemCard';
import Notification from '../components/Notification';

function Search() {
  const [items, setItems] = useState([]);
  const [success, setSuccess] = useState('');

  const handleSearch = async (filters) => {
    try {
      const res = await api.get('/items', { params: filters });
      setItems(res.data);
    } catch (err) {
      // Error handling removed; silently fail
    }
  };

  const handleRequest = (requestedItem) => {
    setItems(
      items.map((item) =>
        item._id === requestedItem._id ? { ...item, status: 'Borrowed' } : item
      )
    );
    setSuccess(`Requested ${requestedItem.name} for PKR ${requestedItem.prices[requestedItem.availability.toLowerCase()]}`);
  };

  useEffect(() => {
    handleSearch({});
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Items</h1>
          <p className="text-gray-600">Find tools, equipment, and more to borrow in your community</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Notifications */}
        {success && <Notification message={success} type="success" />}

        {/* Items Display */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
          {items.length === 0 ? (
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500">Try adjusting your search filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <ItemCard key={item._id} item={item} onRequest={handleRequest} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;