// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// const BASE_URL = `http://localhost:8000`;


const AutoSubmission = () => {
  const [pendingInvoicesCount, setPendingInvoicesCount] = useState(0);
  const [autoSchedule, setAutoSchedule] = useState(null);
  const [manualSchedule, setManualSchedule] = useState(null);
  const [manualTime, setManualTime] = useState("");

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchPendingInvoicesCount = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/auto-submit/pending`,
        getAuthHeader()
      );
      setPendingInvoicesCount(response.data.totalPendingInvoices);
    } catch (error) {
      console.error("Error fetching pending invoices count:", error);
      toast.error("Failed to fetch pending invoices count");
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/auto-submit/schedule`,
        getAuthHeader()
      );
      const schedules = response.data;
      const auto = schedules.find((s) => s.scheduleType === "auto");
      const manual = schedules.find((s) => s.scheduleType === "manual");
      setAutoSchedule(auto);
      setManualSchedule(manual);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast.error("Failed to fetch submission schedules");
    }
  };

  useEffect(() => {
    fetchPendingInvoicesCount();
    fetchSchedules();
  }, []);

  const handleAutoSchedule = async () => {
    try {
      await axios.post(
        `${BASE_URL}/auto-submit/start`,
        { hour: 0, minute: 0, scheduleType: "auto" },
        getAuthHeader()
      );
      toast.success("Auto submission scheduled for midnight");
      fetchSchedules();
    } catch (error) {
      console.error("Error scheduling auto submission:", error);
      toast.error(
        error.response?.data?.error || "Failed to schedule auto submission"
      );
    }
  };

  const handleStopAutoSchedule = async () => {
    try {
      await axios.post(
        `${BASE_URL}/auto-submit/stop`,
        { scheduleType: "auto" },
        getAuthHeader()
      );
      toast.success("Auto submission stopped");
      fetchSchedules();
    } catch (error) {
      console.error("Error stopping auto submission:", error);
      toast.error(
        error.response?.data?.error || "Failed to stop auto submission"
      );
    }
  };

  const handleManualSubmit = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/auto-submit/manual`,
        {},
        getAuthHeader()
      );
      const { submitted, remaining } = response.data;
      toast.success(
        `Manual submission completed: ${submitted} invoices submitted, ${remaining} remaining`
      );
      fetchPendingInvoicesCount();
    } catch (error) {
      console.error("Error performing manual submission:", error);
      toast.error("Manual submission failed");
    }
  };

  const handleManualTimeChange = (e) => {
    setManualTime(e.target.value);
  };

  const scheduleManualSubmission = async () => {
    if (!manualTime) {
      toast.error("Please select a time for manual submission");
      return;
    }

    const [hours, minutes] = manualTime.split(":");
    try {
      await axios.post(
        `${BASE_URL}/auto-submit/start`,
        {
          hour: parseInt(hours),
          minute: parseInt(minutes),
          scheduleType: "manual",
        },
        getAuthHeader()
      );
      toast.success(`Submission scheduled for ${manualTime}`);
      fetchSchedules();
    } catch (error) {
      console.error("Error scheduling manual submission:", error);
      toast.error(
        error.response?.data?.error || "Failed to schedule manual submission"
      );
    }
  };

  const handleStopManualSchedule = async () => {
    try {
      await axios.post(
        `${BASE_URL}/auto-submit/stop`,
        { scheduleType: "manual" },
        getAuthHeader()
      );
      toast.success("Scheduled submission stopped");
      fetchSchedules();
    } catch (error) {
      console.error("Error stopping scheduled submission:", error);
      toast.error(
        error.response?.data?.error || "Failed to stop scheduled submission"
      );
    }
  };

  const formatTime = (hour, minute) => {
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-medium text-indigo-900 mb-1">
            Invoice Submission
          </h1>
          <p className="text-indigo-600 font-light">
            Manage your automatic and manual invoice submissions
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white backdrop-filter backdrop-blur-lg bg-opacity-80 rounded-xl shadow-sm overflow-hidden border border-indigo-100 mb-8">
          <div className="p-6">
            <div>
              <h2 className="text-base font-medium text-gray-800 mb-2">
                Pending Invoices
              </h2>
              <div className="flex items-center">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-indigo-50 border border-indigo-100">
                  <span className="text-lg font-medium text-indigo-600">
                    {pendingInvoicesCount}
                  </span>
                </div>
                <p className="text-sm text-gray-500 ml-3">
                  {pendingInvoicesCount === 0
                    ? "All invoices are submitted"
                    : pendingInvoicesCount === 1
                    ? "1 invoice awaiting submission"
                    : `${pendingInvoicesCount} invoices awaiting submission`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Automatic Submission Card */}
          <div className="bg-white backdrop-filter backdrop-blur-lg bg-opacity-80 rounded-xl shadow-sm overflow-hidden border border-indigo-100 transition-all duration-300 hover:border-indigo-200">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <h2 className="text-base font-medium text-gray-800">
                  Automatic Submission
                </h2>
              </div>
              
              {autoSchedule && autoSchedule.isActive ? (
                <div className="space-y-4">
                  <div className="flex items-center px-4 py-3 bg-blue-50 rounded-xl">
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-blue-700">
                      Scheduled for{" "}
                      <span className="font-semibold">{formatTime(autoSchedule.hour, autoSchedule.minute)}</span> daily
                    </p>
                  </div>
                  <button
                    onClick={handleStopAutoSchedule}
                    className="w-full bg-white text-red-600 border border-red-200 font-medium py-2.5 px-4 rounded-lg hover:bg-red-50 transition duration-200 ease-in-out focus:outline-none"
                  >
                    Stop Auto Submission
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAutoSchedule}
                  className="w-full bg-white text-blue-600 border border-blue-200 font-medium py-2.5 px-4 rounded-lg hover:bg-blue-50 transition duration-200 ease-in-out focus:outline-none"
                >
                  Schedule for Midnight
                </button>
              )}
            </div>
          </div>

          {/* Manual Submission Card */}
          <div className="bg-white backdrop-filter backdrop-blur-lg bg-opacity-80 rounded-xl shadow-sm overflow-hidden border border-indigo-100 transition-all duration-300 hover:border-indigo-200">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <h2 className="text-base font-medium text-gray-800">
                  Manual Submission
                </h2>
              </div>
              <button
                onClick={handleManualSubmit}
                className="w-full bg-white text-green-600 border border-green-200 font-medium py-2.5 px-4 rounded-lg hover:bg-green-50 transition duration-200 ease-in-out focus:outline-none"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>

        {/* Schedule Manual Submission Card */}
        <div className="bg-white backdrop-filter backdrop-blur-lg bg-opacity-80 rounded-xl shadow-sm overflow-hidden border border-indigo-100 transition-all duration-300 hover:border-indigo-200 mb-8">
          <div className="p-6">
            <div className="flex items-center mb-5">
              <h2 className="text-base font-medium text-gray-800">
                Schedule Manual Submission
              </h2>
            </div>
            
            {manualSchedule && manualSchedule.isActive ? (
              <div className="space-y-4">
                <div className="flex items-center px-3 py-2 bg-purple-50 rounded-lg mb-3">
                  <p className="text-sm text-purple-700">
                    Scheduled for{" "}
                    <span className="font-medium">{formatTime(manualSchedule.hour, manualSchedule.minute)}</span>
                  </p>
                </div>
                <button
                  onClick={handleStopManualSchedule}
                  className="w-full bg-white text-red-600 border border-red-200 font-medium py-2.5 px-4 rounded-lg hover:bg-red-50 transition duration-200 ease-in-out focus:outline-none"
                >
                  Stop Scheduled Submission
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="relative flex-grow w-full md:w-auto">
                  <input
                    type="time"
                    value={manualTime}
                    onChange={handleManualTimeChange}
                    className="w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-purple-300 transition duration-200"
                  />
                </div>
                <button
                  onClick={scheduleManualSubmission}
                  className="bg-white text-purple-600 border border-purple-200 font-medium py-2.5 px-6 rounded-lg hover:bg-purple-50 transition duration-200 ease-in-out focus:outline-none w-full md:w-auto"
                >
                  Schedule
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Toast Container */}
        <ToastContainer 
          position="top-right" 
          autoClose={5000} 
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ zIndex: 9999 }}
        />
      </div>
    </div>
  );
};

export default AutoSubmission;