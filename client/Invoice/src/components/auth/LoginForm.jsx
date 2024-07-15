// src/components/auth/LoginForm.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const LoginForm = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const BASE_URL = `http://localhost:5000`;
  // const BASE_URL = `https://zatca-e-invoice-1.onrender.com`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        emailOrUsername,
        password,
      });
      const token = response.data.token;
      localStorage.setItem("token", token);
      navigate("/search");
    } catch (error) {
      console.error("Error during login:", error);
      setError(error.response.data.error);
    }
  };
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 bg-[#8c6e5d] text-white flex items-center justify-center">
        <h1 className="text-4xl font-bold">
          <span className="text-white">Zatca</span>{" "}
          <span className="text-[#f2f0e4]">زاتكا</span>
        </h1>
      </div>
      <div className="flex-1 flex items-center justify-center bg-[#f2f0e4] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-[#2d2a26]">
              Sign in to your account
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="email-or-username" className="sr-only">
                  Email or Username
                </label>
                <input
                  id="email-or-username"
                  name="email-or-username"
                  type="text"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#8c6e5d] focus:border-[#8c6e5d] focus:z-10 sm:text-sm"
                  placeholder="Email or Username"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#8c6e5d] focus:border-[#8c6e5d] focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#8c6e5d] hover:bg-[#77604c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8c6e5d]"
              >
                Sign in
              </button>
            </div>

            <div className="text-sm text-center">
              <Link
                to="/signup"
                className="font-medium text-[#8c6e5d] hover:text-[#77604c]"
              >
                New User? Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
