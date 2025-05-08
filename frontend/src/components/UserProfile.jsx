function UserProfile({ user, items }) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
      {/* User Info */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
        <div className="space-y-1">
          <p className="text-gray-600">Role: {user.role}</p>
          <p className="text-gray-600">Location: {user.location}</p>
          <p className="text-gray-600">Rating: {user.rating.toFixed(1)} / 5</p>
        </div>
      </div>

      {/* Listed Items */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Listed Items</h3>
        {items.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
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
            <h4 className="text-lg font-medium text-gray-900 mb-2">No items listed</h4>
            <p className="text-gray-500">You haven't listed any items yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item._id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <h4 className="text-lg font-semibold text-gray-900">{item.name}</h4>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>Category: {item.category}</p>
                  <p>Availability: {item.availability}</p>
                  <p>Price: PKR {item.prices[item.availability.toLowerCase()]}</p>
                  <p>Status: {item.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h3>
        {user.reviews.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h4>
            <p className="text-gray-500">You haven't received any reviews yet.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {user.reviews.map((review, index) => (
              <li
                key={index}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center mb-2">
                  <span className="text-yellow-500">{'★'.repeat(review.score)}</span>
                  <span className="text-gray-600 ml-2">{review.score}/5</span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
                <p className="text-sm text-gray-500 mt-1">
                  By User ID: {review.reviewer}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default UserProfile;