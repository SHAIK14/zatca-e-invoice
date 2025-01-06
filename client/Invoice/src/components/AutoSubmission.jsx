// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = `http://localhost:5000`;
// const BASE_URL = `https://zatca-e-invoice-1.onrender.com`;

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
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-10">
          Auto Submission Dashboard
        </h1>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Pending Invoices
            </h2>
            <p className="text-3xl font-bold text-indigo-600">
              {pendingInvoicesCount}
            </p>
            <p className="text-gray-600">
              {pendingInvoicesCount === 0
                ? "No pending invoices"
                : pendingInvoicesCount === 1
                ? "1 invoice awaiting submission"
                : `${pendingInvoicesCount} invoices awaiting submission`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Automatic Submission
              </h2>
              {autoSchedule && autoSchedule.isActive ? (
                <>
                  <p className="text-gray-600 mb-4">
                    Scheduled for{" "}
                    {formatTime(autoSchedule.hour, autoSchedule.minute)} daily
                  </p>
                  <button
                    onClick={handleStopAutoSchedule}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
                  >
                    Stop Auto Submission
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAutoSchedule}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
                >
                  Schedule for Midnight
                </button>
              )}
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Manual Submission
              </h2>
              <button
                onClick={handleManualSubmit}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Schedule Manual Submission
            </h2>
            {manualSchedule && manualSchedule.isActive ? (
              <>
                <p className="text-gray-600 mb-4">
                  Scheduled for{" "}
                  {formatTime(manualSchedule.hour, manualSchedule.minute)}
                </p>
                <button
                  onClick={handleStopManualSchedule}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
                >
                  Stop Scheduled Submission
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="relative flex-grow">
                  <input
                    type="time"
                    value={manualTime}
                    onChange={handleManualTimeChange}
                    className="w-full px-4 py-2 pr-8 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={scheduleManualSubmission}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Schedule
                </button>
              </div>
            )}
          </div>
        </div>

        <ToastContainer position="top-right" autoClose={5000} />
      </div>
    </div>
  );
};

export default AutoSubmission;
