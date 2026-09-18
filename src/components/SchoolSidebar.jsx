import { useState } from "react";
import { FaRoute } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUserGraduate,
  FaBus,
  FaMapMarkedAlt,
  FaChevronDown,
  FaChevronRight,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";

export default function SchoolSidebar({
  sidebarOpen,
  setSidebarOpen,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const [studentsOpen, setStudentsOpen] = useState(true);
  const [driversOpen, setDriversOpen] = useState(true);
  const [busesOpen, setBusesOpen] = useState(true);

  const menuClass = (path) =>
    `block px-10 py-2 rounded-lg transition ${location.pathname === path
      ? "bg-blue-600 text-white"
      : "text-gray-300 hover:bg-slate-700 hover:text-white"
    }`;

  return (
    <>
      {/* Overlay */}

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* Sidebar */}

      <div
        className={`fixed top-0 left-0 h-screen w-72 bg-slate-900 text-white z-50 flex flex-col transform transition-transform duration-300
        ${sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
          }`}
      >
        {/* Header */}

        <div className="flex items-center justify-between p-6 border-b border-slate-700">

          <div>

            <Link
              to="/school/dashboard"
              className="text-2xl font-bold"
            >
              🚌 BusTracker
            </Link>

            <p className="text-sm text-slate-400 mt-1">
              School Bus Tracking
            </p>

          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="text-xl hover:text-red-400"
          >
            <FaTimes />
          </button>

        </div>

        {/* Menu */}

        <div className="flex-1 overflow-y-auto px-3 py-5">

          <p className="text-xs uppercase text-slate-500 mb-3 px-3">
            Main
          </p>

          <Link
            to="/school/dashboard"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${location.pathname === "/school/dashboard"
              ? "bg-blue-600"
              : "hover:bg-slate-700"
              }`}
          >
            <FaHome />
            Dashboard
          </Link>

          <p className="text-xs uppercase text-slate-500 mt-8 mb-3 px-3">
            Management
          </p>

          {/* Students */}

          <button
            onClick={() => setStudentsOpen(!studentsOpen)}
            className="w-full flex justify-between items-center px-4 py-3 rounded-lg hover:bg-slate-700"
          >
            <span className="flex items-center gap-3">
              <FaUserGraduate />
              Students
            </span>

            {studentsOpen ? (
              <FaChevronDown />
            ) : (
              <FaChevronRight />
            )}
          </button>

          {studentsOpen && (
            <div className="ml-2 mt-2 space-y-1">

              <Link
                to="/school/addstudent"
                onClick={() => setSidebarOpen(false)}
                className={menuClass("/school/addstudent")}
              >
                Add Student
              </Link>

              <Link
                to="/school/students"
                onClick={() => setSidebarOpen(false)}
                className={menuClass("/school/students")}
              >
                List Students
              </Link>

            </div>
          )}

          {/* Drivers */}

          <button
            onClick={() => setDriversOpen(!driversOpen)}
            className="w-full flex justify-between items-center px-4 py-3 rounded-lg hover:bg-slate-700 mt-3"
          >
            <span className="flex items-center gap-3">
              <FaBus />
              Drivers
            </span>

            {driversOpen ? (
              <FaChevronDown />
            ) : (
              <FaChevronRight />
            )}
          </button>

          {driversOpen && (
            <div className="ml-2 mt-2 space-y-1">

              <Link
                to="/school/adddriver"
                onClick={() => setSidebarOpen(false)}
                className={menuClass("/school/adddriver")}
              >
                Add Driver
              </Link>

              <Link
                to="/school/drivers"
                onClick={() => setSidebarOpen(false)}
                className={menuClass("/school/drivers")}
              >
                List Drivers
              </Link>

            </div>
          )}

          {/* Buses */}

          <button
            onClick={() => setBusesOpen(!busesOpen)}
            className="w-full flex justify-between items-center px-4 py-3 rounded-lg hover:bg-slate-700 mt-3"
          >
            <span className="flex items-center gap-3">
              <FaBus />
              Buses
            </span>

            {busesOpen ? (
              <FaChevronDown />
            ) : (
              <FaChevronRight />
            )}
          </button>

          {busesOpen && (
            <div className="ml-2 mt-2 space-y-1">

              <Link
                to="/school/addbus"
                onClick={() => setSidebarOpen(false)}
                className={menuClass("/school/addbus")}
              >
                Add Bus
              </Link>

              <Link
                to="/school/buses"
                onClick={() => setSidebarOpen(false)}
                className={menuClass("/school/buses")}
              >
                List Buses
              </Link>

              <Link
                to="/school/route-history"
                onClick={() => setSidebarOpen(false)}
                className={menuClass("/school/route-history")}
              >
                Route History
              </Link>
              
            </div>
          )}

        </div>

        {/* Live Tracking */}

        <div className="border-t border-slate-700 p-4">

          <button
            onClick={() => navigate("/school/live-tracking")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-600 transition"
          >
            <FaMapMarkedAlt />
            Live Tracking
          </button>

        </div>


        <div className="border-t border-slate-700 p-4">

          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 transition"
          >
            <FaSignOutAlt />
            Home
          </button>

        </div>

      </div>
    </>
  );
}