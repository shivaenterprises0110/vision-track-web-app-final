import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout";
import SchoolLayout from "./components/SchoolLayout";
import SuperDashboard from "./SuperAdmin/Dashboard";
import Dashboard from "./SchoolAdmin/Dashboard";
import AddSchool from "./SuperAdmin/AddSchool";
import SchoolCredentials from "./SuperAdmin/SchoolCredentials";
import LandingPage from './pages/LandingPage';
import Login from './pages/Auth/login';
import AddStudent from './SchoolAdmin/AddStudent';
import AddDriver from './SchoolAdmin/AddDriver';
import AddBus from './SchoolAdmin/AddBus';
import StudentList from './SchoolAdmin/StudentList';
import DriverList from './SchoolAdmin/DriverList';
import BusList from './SchoolAdmin/BusList';
import SchoolList from './SuperAdmin/SchoolList';
import EditBus from "./SchoolAdmin/EditBus";
import BusDetails from "./SchoolAdmin/BusDetails";
// Driver Pages
import DriverDetails from "./SchoolAdmin/DriverDetails";
import EditDriver from "./SchoolAdmin/EditDriver";
// Student Pages
import StudentDetails from "./SchoolAdmin/StudentDetails";
import EditStudent from "./SchoolAdmin/EditStudent";
import LiveTracking from "./SchoolAdmin/LiveTracking";
import RouteHistory from "./SchoolAdmin/RouteHistory";

const routes = () => {
    return (
        <div>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route element={<SchoolLayout />}>
                    <Route path="/school/dashboard" element={<Dashboard />} />
                    <Route path="/school/addstudent" element={<AddStudent />} />
                    <Route path="/school/adddriver" element={<AddDriver />} />
                    <Route path="/school/addbus" element={<AddBus />} />
                    <Route path="/school/students" element={<StudentList />} />
                    <Route path="/school/drivers" element={<DriverList />} />
                    <Route path="/school/buses" element={<BusList />} />
                    <Route path="/school/buses/edit/:id" element={<EditBus />} />
                    <Route path="/school/buses/view/:id" element={<BusDetails />} />
                    <Route
                        path="/school/drivers/view/:id"
                        element={<DriverDetails />}
                    />

                    <Route
                        path="/school/drivers/edit/:id"
                        element={<EditDriver />}
                    />
                    {/* Student */}
                    <Route
                        path="/school/students/view/:id"
                        element={<StudentDetails />}
                    />

                    <Route
                        path="/school/students/edit/:id"
                        element={<EditStudent />}
                    />

                    <Route
                        path="/school/live-tracking"
                        element={<LiveTracking />}
                    />

                    {/* Route History */}

                    <Route
                        path="/school/route-history"
                        element={<RouteHistory />}
                    />

                </Route>

                <Route element={<Layout />}>
                    <Route path="/superdashboard" element={<SuperDashboard />} />
                    <Route path="/superdashboard/schools" element={<AddSchool />} />
                    <Route path="/superdashboard/schools/credentials" element={<SchoolCredentials />} />
                    <Route path="/superdashboard/schools/list" element={<SchoolList />} />
                </Route>

            </Routes>
        </div>
    )
}

export default routes
