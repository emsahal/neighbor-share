import { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { HomeIcon, MagnifyingGlassIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

function Header() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10 ">
      <div className="container mx-auto py-4 px-32">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">NS</span>
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">NeighborShare</span>
          </Link>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center font-medium ${
                isActive('/') ? 'text-gray-600' : 'text-gray-600 hover:text-gray-600'
              }`}
            >
               Home
            </Link>
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center font-medium ${
                    isActive('/dashboard') ? 'text-gray-600' : 'text-gray-600 hover:text-gray-600'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/search"
                  className={`flex items-center font-medium ${
                    isActive('/search') ? 'text-gray-600' : 'text-gray-600 hover:text-gray-600'
                  }`}
                >
                 Search
                </Link>
                <Link
                  to="/profile"
                  className={`flex items-center font-medium ${
                    isActive('/profile') ? 'text-gray-600' : 'text-gray-600 hover:text-gray-600'
                  }`}
                >
                   Profile
                </Link>
              </>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Hello, {user.name.split(' ')[0]}</span>
                <button
                  onClick={logout}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" /> Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t mt-4 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className={`flex items-center font-medium ${
                  isActive('/') ? 'text-gray-600' : 'text-gray-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <HomeIcon className="h-5 w-5 mr-1" /> Home
              </Link>
              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className={`flex items-center font-medium ${
                      isActive('/dashboard') ? 'text-gray-600' : 'text-gray-600'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserIcon className="h-5 w-5 mr-1" /> Dashboard
                  </Link>
                  <Link
                    to="/search"
                    className={`flex items-center font-medium ${
                      isActive('/search') ? 'text-gray-600' : 'text-gray-600'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MagnifyingGlassIcon className="h-5 w-5 mr-1" /> Search
                  </Link>
                  <Link
                    to="/profile"
                    className={`flex items-center font-medium ${
                      isActive('/profile') ? 'text-gray-600' : 'text-gray-600'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserIcon className="h-5 w-5 mr-1" /> Profile
                  </Link>
                </>
              )}
              <div className="pt-4 mt-2 border-t">
                {user ? (
                  <div className="flex flex-col space-y-3">
                    <span className="text-gray-600">Hello, {user.name.split(' ')[0]}</span>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 w-full"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" /> Log out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link
                      to="/login"
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;