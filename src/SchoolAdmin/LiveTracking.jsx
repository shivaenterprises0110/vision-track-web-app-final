import { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    LayersControl,
} from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import API_URL from "../api";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// VisionTrack Bus Marker
const busIcon = new L.Icon({
    iconUrl:
        "https://cviefvnvftkewddwuktu.supabase.co/storage/v1/object/sign/visiontrack/bus-icon.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZmNjOGQ1OC04MDVmLTQyNTYtOTgyYS00NDU3MDZhZGFhNzkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aXNpb250cmFjay9idXMtaWNvbi5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg3MjQ5NjExLCJleHAiOjE4MTg3ODU2MTF9.yNW-gst7s06ngSvletBRnkT3YFAG4e57Qf8K4qeZa-E",
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -35],
});


export default function LiveTracking() {
    const school = JSON.parse(localStorage.getItem("de_authUser"));
    const [buses, setBuses] = useState([]);

    const fetchLocations = async () => {
        try {

            const url = `${API_URL}/live-tracking/school/${school.school_id}`;

            const res = await axios.get(url);

            setBuses(res.data.buses || []);
        } catch (err) {
            console.error("API Error:", err);
            setBuses([]);
        }
    };
    useEffect(() => {
        fetchLocations();

        const timer = setInterval(fetchLocations, 5000);

        return () => clearInterval(timer);
    }, []);

    const validBuses = buses.filter(
        (b) => b.latitude !== null && b.longitude !== null
    );
    const center =
        validBuses.length > 0
            ? [
                Number(validBuses[0].latitude),
                Number(validBuses[0].longitude),
            ]
            : [17.2899, 76.8176];
    return (
        <div className="p-0">
            <h1 className="text-4xl font-bold mb-5">
                Live Bus Tracking
            </h1>

            <div className="relative z-0">
                <MapContainer
                    center={center}
                    zoom={13}
                    style={{ height: "75vh", width: "100%" }}
                    className="rounded-xl"
                >
                    <LayersControl position="topright">

                        <LayersControl.BaseLayer name="Satellite View">
                            <TileLayer
                                attribution="Tiles © Esri"
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            />
                        </LayersControl.BaseLayer>

                        <LayersControl.BaseLayer checked name=" Map">
                            <TileLayer
                                attribution="&copy; OpenStreetMap contributors"
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                        </LayersControl.BaseLayer>


                    </LayersControl>

                    {validBuses.map((bus) => (
                        <Marker
                            key={bus.id}
                            icon={busIcon}
                            position={[
                                Number(bus.latitude),
                                Number(bus.longitude),
                            ]}
                        >
                            <Popup>
                                <b>{bus.bus_name}</b><br />
                                {bus.bus_number}<br />
                                Speed: {bus.speed} km/h
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}