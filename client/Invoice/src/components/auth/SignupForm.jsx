// src/components/auth/SignupForm.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Input } from "@nextui-org/react";
import Waves from "../Resuable-Comp/Waves";

const SignupForm = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const BASE_URL = `http://localhost:5000`;
  // const BASE_URL = `https://zatca-e-invoice-1.onrender.com`;
  const [activeTab, setActiveTab] = useState("signup");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BASE_URL}/auth/signup`, {
        fullName,
        email,
        username,
        password,
      });
      console.log(response.data.message);
      navigate("/login");
    } catch (error) {
      console.error("Error during signup:", error);
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
      {/* <div className="flex-1 bg-[#8c6e5d] text-white flex items-center justify-center">
        <h1 className="text-4xl font-bold">
          <span className="text-white">Zatca</span>{" "}
          <span className="text-[#f2f0e4]">زاتكا</span>
        </h1>
      </div> */}
      <div className="w-[1200px] h-[600px] bg-white rounded-3xl flex items-center justify-center overflow-hidden z-10">
        <div
          className="w-[500px] h-full flex bg-cover bg-center "
          style={{ backgroundImage: "url('/src/assets/Login_background.png')" }}
        ></div>
        <div className="w-[700px]  flex justify-center items-center h-full">
          <div className="max-w-md w-full space-y-8">
            <div className="relative flex gap-10 font-bold text-2xl">
              {/* Login Tab */}
              <div
                className={`cursor-pointer ${
                  activeTab === "login" ? "text-blue-800" : "text-gray-500"
                }`}
                onClick={() => {
                  setActiveTab("login");
                  navigate("/login");
                }}
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
                }}
              >
                Signup
              </div>

              {/* Animated Underline */}
              <div
                className="absolute bottom-[-5px] h-[3px] bg-blue-800 transition-all duration-300"
                style={{
                  width: "80px",
                  left: activeTab === "login" ? "0px" : "105px", // Adjust position based on active tab
                }}
              ></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-blue-800">
                Create an account
              </h2>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm space-y-4">
                <div>
                  {/* <label htmlFor="full-name" className="sr-only">
                    Full Name
                  </label> */}
                  <Input
                    id="full-name"
                    name="full-name"
                    type="text"
                    autoComplete="name"
                    required
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  {/* <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label> */}
                  <Input
                    id="email-address"
                    name="email"
                    type="email"
                    label="Email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  {/* <label htmlFor="username" className="sr-only">
                    Username
                  </label> */}
                  <Input
                    id="username"
                    name="username"
                    label="Username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    label="Create Password"
                    type="password"
                    autoComplete="new-password"
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
                  Sign up
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
