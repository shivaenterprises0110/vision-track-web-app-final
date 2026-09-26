import { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import endicon from "../assets/motorbike.png";
import API_URL from "../api";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  LayersControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Default marker fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function FitBounds({ positions, videoMode }) {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    // Reset when leaving video mode
    if (!videoMode) {
      hasFitted.current = false;
    }

    // Fit only once when video starts
    if (videoMode && positions.length > 1 && !hasFitted.current) {
      map.fitBounds(positions, { padding: [50, 50] });
      hasFitted.current = true;
    }
  }, [videoMode, positions]);

  return null;
}

export default function RouteHistory() {
  const school = JSON.parse(localStorage.getItem("de_authUser"));

  const [buses, setBuses] = useState([]);
  const [busId, setBusId] = useState("");
  const [route, setRoute] = useState([]);

  const [hours, setHours] = useState(24);

  const [roadRoute, setRoadRoute] = useState([]);

  const [roadCurrentIndex, setRoadCurrentIndex] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoMode, setVideoMode] = useState(false);

  // ADD THIS
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const timerRef = useRef(null);

  const [map, setMap] = useState(null);

  const today = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];

  const [date, setDate] = useState(today);

  useEffect(() => {
    fetchBuses();
  }, []);

  useEffect(() => {
    if (!isPlaying || roadRoute.length === 0) return;

    clearInterval(timerRef.current);

    const interval = 40 / playbackSpeed;

    timerRef.current = setInterval(() => {
      setRoadCurrentIndex((prev) => {
        if (prev >= roadRoute.length - 1) {
          clearInterval(timerRef.current);
          setIsPlaying(false);
          return prev;
        }

        const gpsIndex = Math.floor(
          (prev / (roadRoute.length - 1)) * (route.length - 1)
        );

        setCurrentIndex(gpsIndex);

        return prev + 1;
      });
    }, interval);

    return () => clearInterval(timerRef.current);
  }, [isPlaying, playbackSpeed, roadRoute]);

  const fetchBuses = async () => {
    const res = await axios.get(
      `${API_URL}/buses/school/${school.school_id}`
    );
    setBuses(res.data.buses || []);
  };

  const loadHistory = async () => {
    if (!busId) return alert("Select a bus");

    try {
      const res = await axios.get(
        `${API_URL}/tracking/history/${busId}?date=${date}&hours=${hours}`
      );

      const history = res.data.history || [];

      setRoute(history);

      setCurrentIndex(0);
      setRoadCurrentIndex(0);
      setIsPlaying(false);

      // NEW
      fetchRoadRoute(history);


    } catch {
      alert("No route found");
      setRoute([]);
      setRoadRoute([]);
    }
  };

  const fetchRoadRoute = async (gpsPoints) => {
    if (gpsPoints.length < 2) {
      setRoadRoute([]);
      return;
    }

    try {
      // OSRM needs longitude,latitude
      const coordinates = gpsPoints
        .map((p) => `${p.longitude},${p.latitude}`)
        .join(";");

      const res = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
      );

      const routeCoords =
        res.data.routes[0].geometry.coordinates.map(([lng, lat]) => [
          lat,
          lng,
        ]);

      setRoadRoute(routeCoords);
    } catch (err) {
      console.log("OSRM Error:", err);
      setRoadRoute([]);
    }
  };

  const playRoute = () => {
    if (route.length < 2) return;

    setVideoMode(true);
    setCurrentIndex(0);
    setRoadCurrentIndex(0);
    setIsPlaying(true);

    clearInterval(timerRef.current);

    const interval = 500 / playbackSpeed;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= route.length - 1) {
          clearInterval(timerRef.current);
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, interval);
  };

  const pauseRoute = () => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
  };

  const resumeRoute = () => {
    if (currentIndex >= route.length - 1) return;

    setIsPlaying(true);

    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= route.length - 1) {
          clearInterval(timerRef.current);
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 500 / playbackSpeed);
  };

  const skipForward = () => {
    const gpsIndex = Math.min(currentIndex + 10, route.length - 1);

    setCurrentIndex(gpsIndex);

    const roadIdx = Math.floor(
      (gpsIndex / (route.length - 1)) *
      (roadRoute.length - 1)
    );

    setRoadCurrentIndex(roadIdx);
  };

  const skipBackward = () => {
    const gpsIndex = Math.max(currentIndex - 10, 0);

    setCurrentIndex(gpsIndex);

    const roadIdx = Math.floor(
      (gpsIndex / (route.length - 1)) *
      (roadRoute.length - 1)
    );

    setRoadCurrentIndex(roadIdx);
  };

  const resetRoute = () => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
    setCurrentIndex(0);
    setRoadCurrentIndex(0);   // ← add this line
  };

  const positions = route.map((p) => [
    Number(p.latitude),
    Number(p.longitude),
  ]);

  const roadIndex =
    roadRoute.length > 0 && route.length > 1
      ? Math.floor(
        (currentIndex / (route.length - 1)) * (roadRoute.length - 1)
      )
      : currentIndex;

  const visibleRoadRoute = videoMode
    ? roadRoute.slice(0, roadCurrentIndex + 1)
    : roadRoute;

  // Calculate total distance (km)
  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  const totalDistance = useMemo(() => {
    if (route.length < 2) return 0;

    let distance = 0;

    for (let i = 1; i < route.length; i++) {
      distance += getDistance(
        Number(route[i - 1].latitude),
        Number(route[i - 1].longitude),
        Number(route[i].latitude),
        Number(route[i].longitude)
      );
    }

    return (distance / 1000).toFixed(2);
  }, [route]);

  const startIcon = L.divIcon({
    html: '<div style="font-size:30px;">🚩</div>',
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  });

  const endIcon = L.icon({
  iconUrl: endicon,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -20],
});



  return (
    <div >
      <h1 className="text-4xl font-bold mb-5">Route History</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Bus</label>
          <select
            value={busId}
            onChange={(e) => setBusId(e.target.value)}
            className="border rounded-lg px-3 py-2 w-56"
          >
            <option value="">Select Bus</option>
            {buses.map((bus) => (
              <option key={bus.id} value={bus.id}>
                {bus.bus_number}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Recording
          </label>

          <div className="flex gap-2">
            {[4, 8, 24].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHours(h)}
                className={`px-4 py-2 rounded-lg font-medium transition ${hours === h
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                {h} Hrs
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={loadHistory}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
          >
            🗺 View Route
          </button>

          <button
            onClick={playRoute}
            disabled={route.length === 0}
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            🎥 Video View
          </button>
          {videoMode && (
            <button
              onClick={() => {
                pauseRoute();
                setVideoMode(false);
                setCurrentIndex(route.length - 1);
                setRoadCurrentIndex(roadRoute.length - 1);
              }}
              className="bg-gray-700 text-white px-5 py-2 rounded-lg hover:bg-gray-800"
            >
              exit Video View
            </button>
          )}

          {videoMode && route.length > 0 && (
            <div className="bg-gray-100 rounded-xl p-3 mt-3">

              <div className="flex justify-between text-sm mb-2">
                <span>{currentIndex + 1} / {route.length}</span>
                <span>
                  {route[currentIndex] &&
                    new Date(route[currentIndex].recorded_at)
                      .toLocaleTimeString("en-IN")}
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={route.length - 1}
                value={currentIndex}
                onChange={(e) => {
                  const gpsIndex = Number(e.target.value);

                  setCurrentIndex(gpsIndex);

                  const roadIdx = Math.floor(
                    (gpsIndex / (route.length - 1)) *
                    (roadRoute.length - 1)
                  );

                  setRoadCurrentIndex(roadIdx);
                }}
                className="w-full"
              />

              <div className="flex items-center justify-between flex-wrap gap-3">

                <div className="flex gap-2">

                  <button onClick={resetRoute} className="px-3 py-2 bg-white rounded-lg">
                    🔄
                  </button>

                  <button onClick={skipBackward} className="px-3 py-2 bg-white rounded-lg">
                    ⏪10
                  </button>

                  {isPlaying ? (
                    <button
                      onClick={pauseRoute}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg"
                    >
                      ⏸
                    </button>
                  ) : (
                    <button
                      onClick={resumeRoute}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg"
                    >
                      ▶
                    </button>
                  )}

                  <button onClick={skipForward} className="px-3 py-2 bg-white rounded-lg">
                    10⏩
                  </button>

                </div>

                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="border rounded-lg px-2 py-1"
                >
                  <option value={0.5}>0.5×</option>
                  <option value={1}>1×</option>
                  <option value={2}>2×</option>
                  <option value={4}>4×</option>
                </select>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="relative z-0 rounded-xl overflow-hidden shadow">
        <MapContainer
          center={[17.2899, 76.8176]}
          zoom={13}
          whenCreated={setMap}
          style={{ height: "75vh", width: "100%" }}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Street Map">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles © Esri"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {positions.length > 1 && (
            <>
              <Polyline
                positions={visibleRoadRoute}
                color="#2563eb"
                weight={5}
              />
              <FitBounds
                positions={positions}
                videoMode={videoMode}
              />
            </>
          )}

          {route.length > 0 && (
            <>
              {/* Start Marker */}
              <Marker
                icon={startIcon}
                zIndexOffset={1000}
                position={[
                  Number(route[0].latitude),
                  Number(route[0].longitude),
                ]}
              >
                <Popup>
                  <div>
                    <b>🚩 Trip Started</b><br />
                    {new Date(route[0].recorded_at).toLocaleString("en-IN")}
                  </div>
                </Popup>
              </Marker>

              {/* Start Point */}
              <Marker
                icon={endIcon}
                position={
                  videoMode
                    ? roadRoute[
                    Math.min(roadCurrentIndex, roadRoute.length - 1)
                    ]
                    : [
                      Number(route[route.length - 1].latitude),
                      Number(route[route.length - 1].longitude),
                    ]
                }
              >
                <Popup>
                  <div>
                    <b>👨‍💼 Employee</b><br />
                    📍{" "}
                    {new Date(
                      route[
                        videoMode
                          ? Math.min(currentIndex, route.length - 1)
                          : route.length - 1
                      ].recorded_at
                    ).toLocaleString("en-IN")}
                    <hr className="my-2" />
                    <b>🛣 Distance:</b> {totalDistance} km
                  </div>
                </Popup>
              </Marker>
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}