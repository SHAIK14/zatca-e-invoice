// src/components/Navbar.jsx
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiLogOut } from "react-icons/fi";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoverStyle, setHoverStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const [activeStyle, setActiveStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const activeLink = document.querySelector(`a[href='${location.pathname}']`);
    if (activeLink) {
      const { offsetLeft, offsetWidth } = activeLink;
      setHoverStyle({ left: offsetLeft, width: offsetWidth, opacity: 1 });
    }
  }, [location]);

  const handleMouseEnter = (e) => {
    const { offsetLeft, offsetWidth } = e.target;
    setHoverStyle({ left: offsetLeft, width: offsetWidth, opacity: 1 });
  };

  const handleMouseLeave = () => {
    // Keep the active link background when the mouse leaves
    const activeLink = document.querySelector(`a[href='${location.pathname}']`);
    if (activeLink) {
      const { offsetLeft, offsetWidth } = activeLink;
      setHoverStyle({ left: offsetLeft, width: offsetWidth, opacity: 1 });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-white py-4 border-b font-montserrat font-semibold border-gray-200 relative">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <NavLink to="/" className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 120 30"
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
          </NavLink>

          <div className="relative flex items-center space-x-8">
            {/* Animated Background */}
            <div
              className="absolute top-0 bottom-0 rounded-full bg-blue-50 transition-all duration-300 ease-in-out pointer-events-none"
              style={{
                left: `${hoverStyle.left}px`,
                width: `${hoverStyle.width}px`,
                opacity: hoverStyle.opacity,
              }}
            ></div>

            {/* Navigation Links */}
            <NavLink
              to="/search"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className={({ isActive }) =>
                `relative z-10 px-4 py-2 rounded-full transition-all duration-300 ${
                  isActive ? "text-blue-950" : "text-gray-600"
                } hover:text-gray-800 text-sm flex items-center justify-center`
              }
            >
              Search Invoice
            </NavLink>

            <NavLink
              to="/form"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className={({ isActive }) =>
                `relative z-10 px-4 py-2 rounded-full transition-all duration-300 ${
                  isActive ? "text-black" : "text-gray-600"
                } hover:text-gray-800 text-sm flex items-center justify-center`
              }
            >
              Create Invoice
            </NavLink>

            <NavLink
              to="/addresses"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className={({ isActive }) =>
                `relative z-10 px-4 py-2 rounded-full transition-all duration-300 ${
                  isActive ? "text-black" : "text-gray-600"
                } hover:text-gray-800 text-sm flex items-center justify-center`
              }
            >
              Manage Addresses
            </NavLink>

            <NavLink
              to="/auto"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className={({ isActive }) =>
                `relative z-10 px-4 py-2 rounded-full transition-all duration-300 ${
                  isActive ? "text-black" : "text-gray-600"
                } hover:text-gray-800 text-sm flex items-center justify-center`
              }
            >
              Pending Invoices
            </NavLink>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => console.log("Logout")}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-red-500 text-gray-800 hover:text-white transition-all duration-300 shadow-md focus:outline-none"
        >
          <FiLogOut className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
