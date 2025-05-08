import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

function SearchBar({ onSearch }) {
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [availability, setAvailability] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ location, category, availability, maxPrice });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Location (e.g., Lahore)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Location"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Category"
        >
          <option value="">All Categories</option>
          <option value="Tools">Tools</option>
          <option value="Kitchen">Kitchen</option>
          <option value="Cleaning">Cleaning</option>
        </select>
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Availability"
        >
          <option value="">All Availability</option>
          <option value="Hour">Hour</option>
          <option value="Day">Day</option>
          <option value="Week">Week</option>
        </select>
        <input
          type="number"
          placeholder="Max Price (PKR)"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Max Price"
          min="0"
        />
      </div>
      <button
        type="submit"
        className="mt-4 bg-primary text-white px-4 py-2 rounded flex items-center justify-center w-full md:w-auto"
      >
        <MagnifyingGlassIcon className="h-5 w-5 mr-2" /> Search
      </button>
    </form>
  );
}

export default SearchBar;