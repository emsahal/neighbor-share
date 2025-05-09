import { useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

function ItemCard({ item, onRequest }) {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [hasAcceptedRequest, setHasAcceptedRequest] = useState(false);
  const [acceptedRequestId, setAcceptedRequestId] = useState(null);
  const [isFetchingRequests, setIsFetchingRequests] = useState(true);
  const [timer, setTimer] = useState('Loading...');

  // Check for pending and accepted requests
  useEffect(() => {
    if (user) {
      setIsFetchingRequests(true);
      api
        .get('/requests')
        .then((res) => {
          const requests = res.data;
          // Check for pending requests
          const pending = requests.some(
            (req) =>
              req.item._id === item._id &&
              req.requester._id === user._id &&
              req.status === 'Pending'
          );
          setHasPendingRequest(pending);

          // Check for accepted requests
          const accepted = requests.find(
            (req) =>
              req.item._id === item._id &&
              req.requester._id === user._id &&
              req.status === 'Accepted'
          );
          setHasAcceptedRequest(!!accepted);
          setAcceptedRequestId(accepted ? accepted._id : null);

          // Initialize timer for accepted request
          if (accepted && accepted.rentalStartTime) {
            const startTime = new Date(accepted.rentalStartTime).getTime();
            const maxDuration = 59 * 3600 * 1000 + 59 * 60 * 1000 + 59 * 1000; // 59:59:59 in ms
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, maxDuration - elapsed);

            if (remaining > 0) {
              const hours = Math.floor(remaining / (1000 * 3600));
              const minutes = Math.floor((remaining % (1000 * 3600)) / (1000 * 60));
              const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
              setTimer(
                `${hours.toString().padStart(2, '0')}:${minutes
                  .toString()
                  .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
              );
            } else {
              setTimer('00:00:00');
            }
          }
        })
        .catch((err) => {
          console.error('Failed to fetch requests:', err);
        })
        .finally(() => {
          setIsFetchingRequests(false);
        });
    } else {
      setIsFetchingRequests(false);
    }
  }, [user, item._id]);

  // Update timer every second for accepted requests
  useEffect(() => {
    if (hasAcceptedRequest && acceptedRequestId) {
      const interval = setInterval(() => {
        api
          .get('/requests')
          .then((res) => {
            const accepted = res.data.find(
              (req) => req._id === acceptedRequestId && req.status === 'Accepted'
            );
            if (accepted && accepted.rentalStartTime) {
              const startTime = new Date(accepted.rentalStartTime).getTime();
              const maxDuration = 59 * 3600 * 1000 + 59 * 60 * 1000 + 59 * 1000; // 59:59:59 in ms
              const elapsed = Date.now() - startTime;
              const remaining = Math.max(0, maxDuration - elapsed);

              if (remaining > 0) {
                const hours = Math.floor(remaining / (1000 * 3600));
                const minutes = Math.floor((remaining % (1000 * 3600)) / (1000 * 60));
                const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
                setTimer(
                  `${hours.toString().padStart(2, '0')}:${minutes
                    .toString()
                    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
              } else {
                setTimer('00:00:00');
              }
            }
          })
          .catch((err) => {
            console.error('Failed to fetch request for timer:', err);
          });
      }, 1000);

      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [hasAcceptedRequest, acceptedRequestId]);

  const handleRequest = async () => {
    setIsLoading(true);
    try {
      await api.post('/requests', {
        itemId: item._id,
        availability: item.availability,
      });
      setHasPendingRequest(true); // Optimistic update
      onRequest(item);
    } catch (err) {
      alert(
        'Error requesting item: ' + (err.response?.data?.message || 'An unexpected error occurred')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async () => {
    setIsLoading(true);
    try {
      await api.put(`/requests/${acceptedRequestId}/return`);
      setHasAcceptedRequest(false);
      setAcceptedRequestId(null);
      setTimer('00:00:00');
      alert('Item returned successfully');
    } catch (err) {
      alert(
        'Error returning item: ' + (err.response?.data?.message || 'An unexpected error occurred')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const availabilityToPriceKey = {
    Hour: 'hourly',
    Day: 'daily',
    Week: 'weekly',
  };

  const priceKey = item.availability ? availabilityToPriceKey[item.availability] : null;
  const price =
    item.prices && priceKey && item.prices[priceKey] !== undefined
      ? item.prices[priceKey]
      : 'N/A';

  return (
    <div className="relative max-w-sm w-full bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
      {/* Image Section */}
      <div className="relative overflow-hidden">
        {item.img && item.img.contentType ? (
          <img
            src={`${api.defaults.baseURL}/items/${item._id}/image`}
            alt={item.name || 'Item'}
            className="w-full h-56 object-cover rounded-t-xl transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl flex items-center justify-center transition-transform duration-300 hover:scale-105">
            <span className="text-gray-400 font-medium">No Image Available</span>
          </div>
        )}
        {/* Status Tag */}
        {!isFetchingRequests && (
          <div className="absolute top-2 right-2">
            {hasPendingRequest ? (
              <span className="bg-yellow-400 text-black text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Pending
              </span>
            ) : hasAcceptedRequest ? (
              <span className="bg-blue-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Borrowed
              </span>
            ) : item.status === 'Available' ? (
              <span className="bg-green-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Available
              </span>
            ) : item.status === 'Borrowed' ? (
              <span className="bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Borrowed
              </span>
            ) : null}
          </div>
        )}
      </div>

      {/* Separator */}
      <hr className="border-t border-gray-200 mx-4" />

      {/* Text Section */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 truncate">
          {item.name || 'Unknown Item'}
        </h3>
        <div className="mt-2 space-y-1.5">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Category:</span> {item.category || 'N/A'}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Availability:</span> {item.availability || 'N/A'}
          </p>
          <p className="text-sm font-semibold text-gray-800">
            <span className="font-medium">Price:</span>{' '}
            {price === 'N/A' ? 'N/A' : `PKR ${price}`}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Location:</span> {item.location || 'N/A'}
          </p>
          {hasAcceptedRequest && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Time Remaining:</span> {timer}
            </p>
          )}
        </div>

        {user && user._id !== item.owner?._id && (
          <div className="mt-4">
            {!isFetchingRequests && item.status === 'Available' && !hasPendingRequest && !hasAcceptedRequest && (
              <button
                onClick={handleRequest}
                disabled={isLoading}
                aria-label={`Request ${item.name} for ${item.availability}`}
                className={`w-full bg-gray-700 text-white font-semibold py-2.5 rounded-lg hover:bg-gray-800 transition-all duration-300 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Requesting...' : 'Request Item'}
              </button>
            )}
            {!isFetchingRequests && hasAcceptedRequest && (
              <button
                onClick={handleReturn}
                disabled={isLoading}
                aria-label={`Return ${item.name}`}
                className={`w-full bg-blue-500 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-600 transition-all duration-300 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Returning...' : 'Return Item'}
              </button>
            )}
          </div> 
        )}
      </div>
    </div>
  );
}

export default ItemCard;