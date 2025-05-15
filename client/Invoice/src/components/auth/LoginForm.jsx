// src/components/auth/LoginForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input } from "@nextui-org/react";
import Waves from "../Resuable-Comp/Waves";

const LoginForm = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const BASE_URL = `http://localhost:5000`;
  // const BASE_URL = `https://zatca-e-invoice-1.onrender.com`;

  const [activeTab, setActiveTab] = useState("login");

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
    <div className="w-full h-screen bg-blue-800 flex justify-center items-center">
      <Waves
        lineColor="#2A57D8"
        backgroundColor="rgba(255, 255, 255, 0.2)"
        waveSpeedX={0.02}
        waveSpeedY={0.01}
        waveAmpX={40}
        waveAmpY={20}
        friction={0.9}
        tension={0.01}
        maxCursorMove={120}
        xGap={12}
        yGap={36}
      />
      <div className="w-[1200px] h-[600px] bg-white rounded-3xl flex items-center justify-center overflow-hidden z-10">
        <div className="w-[700px]  flex justify-center items-center h-full">
          <div className="max-w-md w-full space-y-8">
            <div className="relative flex gap-10 font-bold text-2xl">
              {/* Login Tab */}
              <div
                className={`cursor-pointer ${
                  activeTab === "login" ? "text-blue-800" : "text-gray-500"
                }`}
                onClick={() => setActiveTab("login")}
              >
                Login
              </div>

              {/* Signup Tab */}
              <div
                className={`cursor-pointer ${
                  activeTab === "signup" ? "text-blue-800" : "text-gray-500"
                }`}
                onClick={() => {
                  setActiveTab("signup");
                  navigate("/signup"); // Navigate to the Signup page
                }}
              >
                Signup
              </div>

              {/* Animated Underline */}
              <div
                className="absolute bottom-[-5px] h-[3px] bg-blue-800 transition-all duration-300"
                style={{
                  width: "80px",
                  left: activeTab === "login" ? "0px" : "105px", // Adjust `110px` based on gap between tabs
                }}
              ></div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-blue-800">
                Login to your Account
              </h2>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm space-y-4">
                <div>
                  {/* <label htmlFor="email-or-username" className="sr-only">
                    Email or Username
                  </label> */}

                  <Input
                    id="email-or-username"
                    name="email-or-username"
                    type="text"
                    autoComplete="email"
                    required
                    label="Email"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    label="Password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              {error && (
                <div className="text-red-500 mt-2 text-sm">{error}</div>
              )}
              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-800 hover:bg-blue-950 "
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
        <div
          className="w-[500px] h-full flex bg-cover bg-center "
          style={{ backgroundImage: "url('/src/assets/Login_background.png')" }}
        ></div>
      </div>
    </div>
  );
};

export default LoginForm;
