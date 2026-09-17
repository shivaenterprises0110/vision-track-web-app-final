// src/pages/Login.jsx
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";



const slides = [
    "https://cdn.phototourl.com/free/2026-07-09-62031c6a-0759-4620-891d-33cb2ce22f5d.jpg",

    "https://cdn.phototourl.com/free/2026-07-09-48440a33-c7af-4ff4-b0d2-54fc6e2400c0.jpg",

    "https://cdn.phototourl.com/free/2026-07-08-37cf1f8d-91c3-4570-927c-4ee35081965b.jpg",
];


export default function Login() {

    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!email.trim() || !password.trim()) {
            setError("Please enter email and password.");
            return;
        }

        try {

            const res = await fetch(
                "https://schoolbustracker-backend-q5qf.onrender.com/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                        password: password.trim(),
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                setError(
                    data.error || "Invalid email or password."
                );
                return;
            }

            const userObj = data.user;

            // Allow only School Admin
            if (userObj.role !== "school_admin") {
                setError(
                    "Only School Admin can login here."
                );
                return;
            }

            localStorage.setItem(
                "de_authUser",
                JSON.stringify(userObj)
            );

            alert(`Welcome ${userObj.name}`);

            navigate("/school/dashboard");

        } catch (err) {

            console.error(err);

            setError(
                "Network error. Please try again."
            );

        }
    };
    return (

        <div className="relative min-h-screen overflow-hidden">

            {/* Background Slideshow */}

            {slides.map((img, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${currentSlide === index
                        ? "opacity-100"
                        : "opacity-0"
                        }`}
                    style={{
                        backgroundImage: `url(${img})`,
                    }}
                />
            ))}

            {/* Overlay */}

            <div className="absolute inset-0 bg-black/60" />

            {/* Navbar */}

            <nav className="relative z-20 flex justify-between items-center px-8 py-5">

                <div className="flex items-center gap-2">

                    <img
                        src="https://cviefvnvftkewddwuktu.supabase.co/storage/v1/object/sign/visiontrack/Ticon.png?token=eyJraWQiOiI5ZmNjOGQ1OC04MDVmLTQyNTYtOTgyYS00NDU3MDZhZGFhNzkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aXNpb250cmFjay9UaWNvbi5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg5MzY5NTAxLCJleHAiOjE4MjA5MDU1MDF9.vF4Tq_LshvwFOjpGz--PV6f7gg7TjWlMZFZ7u3YViIg"
                        className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 animate-bounce"
                        alt="SchoolBusTracker Logo"
                    />

                    <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-yellow-400 drop-shadow-lg whitespace-nowrap">
                        VisionTrack
                    </h1>

                </div>

                <div className="space-x-8 text-lg text-white">

                    {/* <a href="/">Home</a> */}
                    <Link to="/">Home</Link>

                    {/* <Link to="/join-ngo">Join as NGO</Link>

                    <Link to="/contact">Contact</Link> */}

                </div>

            </nav>

            {/* Login Card */}

            <div className="relative z-20 flex justify-center items-center min-h-[80vh]">

                <div className="bg-white/95 p-8 rounded-xl shadow-2xl w-full max-w-md">

                    <h2 className="text-3xl font-bold text-center text-green-600 mb-8">

                        Login to VisionTrack

                    </h2>

                    <form onSubmit={handleSubmit}>

                        <div className="mb-5">

                            <label className="block mb-2 font-semibold text-gray-700">

                                Email

                            </label>

                            <input
                                type="email"
                                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                            />

                        </div>

                        <div className="mb-5">
                            <label className="block mb-2 font-semibold text-gray-700">
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full border rounded-lg p-3 pr-12 outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm mb-4">

                                {error}

                            </p>
                        )}

                        <div className="flex gap-3">

                            <button
                                type="submit"
                                className="w-1/2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold "
                            >
                                Login
                            </button>

                            <Link
                                to="/"
                                className="w-1/2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg text-center font-semibold"
                            >
                                Cancel
                            </Link>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
}
