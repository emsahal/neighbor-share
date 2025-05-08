import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import heroImage from '../assets/hero.png'

const Home = () => {
  const { user } = useAuth();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedTools = async () => {
      try {
        const queryParams = user?.location ? `?location=${encodeURIComponent(user.location)}` : '';
        const response = await api.get(`/items${queryParams}`);
        const formattedItems = response.data.map(item => ({
          id: item._id,
          name: item.name,
          category: item.category,
          description: `Available for ${item.availability} rental`,
          image: item.image || '/placeholder.svg',
          owner: {
            name: item.owner.name,
            rating: item.owner.rating || 0,
          },
        }));
        setFeaturedItems(formattedItems);
        setLoading(false);
      } catch (err) {
        // Silently handle error by setting loading to false
        setLoading(false);
      }
    };
    fetchFeaturedTools();
  }, [user]);

  const isAuthenticated = !!user;

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col bg-gray-50">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-16  bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2 text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Share Tools with <span className="text-blue-400">Neighbors</span>
              </h1>
              <p className="text-base md:text-lg mb-6">
                NeighborShare connects you with your community to borrow tools and equipment. Save money, reduce waste, and build connections!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" className="bg-white text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-100 transition">
                      Go to Dashboard
                    </Link>
                    <Link to="/search" className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition">
                      Browse Items
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/register" className="bg-white text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-100 transition">
                      Get Started
                    </Link>
                    <Link to="/login" className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="md:w-1/2">
              <img
                src={heroImage}
                alt="Neighbor sharing tools"
                className="w-full max-w-md mx-auto rounded-lg shadow-lg object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3">How It Works</h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              NeighborShare makes it simple to share tools and equipment with your community in just a few steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, title: 'Sign Up', description: 'Create your profile and join your neighborhood community in less than 2 minutes.' },
              { step: 2, title: 'Browse or List', description: 'Search for tools you need or list your own tools to share with neighbors.' },
              { step: 3, title: 'Share & Connect', description: 'Meet up to exchange tools and build relationships within your community.' },
            ].map(({ step, title, description }) => (
              <div key={step} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-800 text-xl font-bold">{step}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-gray-600 text-sm">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tools Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3">Featured Tools</h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Check out these popular tools available in your area.
            </p>
          </div>
          {loading ? (
            <p className="text-center text-gray-600">Loading featured tools...</p>
          ) : featuredItems.length === 0 ? (
            <p className="text-center text-gray-600">No featured tools available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {featuredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
                >
                  <div className="h-48 bg-gray-100">
                    <img
                      src={heroImage}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.target.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-base">{item.name}</h3>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-2 h-8 w-8 rounded-full bg-gray-800 text-white flex items-center justify-center">
                          {item.owner.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.owner.name}</p>
                          <div className="flex text-xs text-yellow-500">
                            {'★'.repeat(Math.floor(item.owner.rating))}
                            {'☆'.repeat(5 - Math.floor(item.owner.rating))}
                          </div>
                        </div>
                      </div>
                      {isAuthenticated ? (
                        <Link
                          to="/search"
                          className="bg-gray-800 text-white text-sm py-1 px-3 rounded hover:bg-gray-900 transition"
                        >
                          View Details
                        </Link>
                      ) : (
                        <Link
                          to="/login"
                          className="bg-gray-800 text-white text-sm py-1 px-3 rounded hover:bg-gray-900 transition"
                        >
                          Sign in to Request
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link
              to="/search"
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Browse All Tools
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3">Benefits of Sharing</h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Why join our community of neighbors helping neighbors?
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Save Money',
                description: 'Why buy expensive tools you’ll only use occasionally? Borrow from neighbors and save hundreds.',
                icon: (
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                bgColor: 'bg-green-100',
              },
              {
                title: 'Reduce Environmental Impact',
                description: 'Sharing resources means fewer tools manufactured and less waste in landfills.',
                icon: (
                  <svg
                    className="h-6 w-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                bgColor: 'bg-gray-100',
              },
              {
                title: 'Build Community',
                description: 'Meet your neighbors and create meaningful connections through sharing resources.',
                icon: (
                  <svg
                    className="h-6 w-6 text-gray-800"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                ),
                bgColor: 'bg-gray-100',
              },
              {
                title: 'Access More Tools',
                description: 'Get access to a wider variety of high-quality tools than you could afford to own yourself.',
                icon: (
                  <svg
                    className="h-6 w-6 text-yellow-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                ),
                bgColor: 'bg-yellow-100',
              },
            ].map(({ title, description, icon, bgColor }) => (
              <div key={title} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-start">
                <div className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center mr-4 flex-shrink-0`}>
                  {icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{title}</h3>
                  <p className="text-gray-600 text-sm">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Ready to Start Sharing?</h2>
          <p className="text-base md:text-lg mb-6 max-w-2xl mx-auto">
            Join our growing community of neighbors helping neighbors. Sign up today and start borrowing or lending tools!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Create Account
            </Link>
            <Link
              to="/search"
              className="border-2 border-white text-white px-6 py-2 rounded-lg hover:bg-white hover:text-gray-800 transition"
            >
              Browse Tools
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;