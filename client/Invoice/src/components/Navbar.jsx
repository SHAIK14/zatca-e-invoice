// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-white py-4 border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="flex items-center space-x-8">
          <Link to="/search" className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 30"
              className="h-8"
            >
              <text x="0" y="20" fontSize="20" fontWeight="bold" fill="#8c6e5d">
                Zatca
              </text>
              <text
                x="100"
                y="20"
                fontSize="20"
                fontWeight="bold"
                textAnchor="end"
                fill="#8c6e5d"
              >
                زاتكا
              </text>
            </svg>
          </Link>
          <Link to="/search" className="text-gray-600 hover:text-gray-800">
            Search Invoice
          </Link>
          <Link to="/form" className="text-gray-600 hover:text-gray-800">
            Create Invoice
          </Link>
          <Link to="/addresses" className="text-gray-600 hover:text-gray-800">
            Manage Addresses
          </Link>
          <Link to="/auto" className="text-gray-600 hover:text-gray-800">
            Pending Invoices
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-800 hover:text-gray-600 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
