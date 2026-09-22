import { useEffect, useMemo, useState } from "react";
import axios from "axios";
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

function FitBounds({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 1) {
      map.fitBounds(positions, { padding: [50, 50] });
    }
  }, [positions]);

  return null;
}

export default function RouteHistory() {
  const school = JSON.parse(localStorage.getItem("de_authUser"));

  const [buses, setBuses] = useState([]);
  const [busId, setBusId] = useState("");
  const [route, setRoute] = useState([]);

  const [hours, setHours] = useState(24);

  const [roadRoute, setRoadRoute] = useState([]);


  const today = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];

  const [date, setDate] = useState(today);

  useEffect(() => {
    fetchBuses();
  }, []);

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

  const positions = route.map((p) => [
    Number(p.latitude),
    Number(p.longitude),
  ]);

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
    html: '<div style="font-size:32px;">🚩</div>',
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const endIcon = L.divIcon({
    html: '<div style="font-size:32px;">🚌</div>',
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
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

        <button
          onClick={loadHistory}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          View Route
        </button>
      </div>

      {/* Map */}
      <div className="relative z-0 rounded-xl overflow-hidden shadow">
        <MapContainer
          center={[17.2899, 76.8176]}
          zoom={13}
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
                positions={roadRoute.length ? roadRoute : positions}
                color="#2563eb"
                weight={5}
              />
              <FitBounds positions={positions} />
            </>
          )}

          {route.length > 0 && (
            <>
              {/* Start Point */}
              <Marker
                icon={startIcon}
                position={[
                  Number(route[0].latitude),
                  Number(route[0].longitude),
                ]}
              >
                <Popup>
                  <div>
                    <b>🟢 Trip Started</b><br />
                    {new Date(route[0].recorded_at).toLocaleString("en-IN")}
                  </div>
                </Popup>
              </Marker>

              {/* End Point */}
              <Marker
                icon={endIcon}
                position={[
                  Number(route[route.length - 1].latitude),
                  Number(route[route.length - 1].longitude),
                ]}
              >
                <Popup>
                  <div>
                    <b>🏁 Trip Ended</b><br />
                    📍 {new Date(route[route.length - 1].recorded_at).toLocaleString("en-IN")}
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