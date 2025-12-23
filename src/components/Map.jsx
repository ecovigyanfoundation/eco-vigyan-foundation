"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet icons in Next.js
if (typeof window !== "undefined") {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
}

const ICONS = {
    food: "/icons/mushroom.png",
    education: "/icons/book.png",
    health: "/icons/health.png",
    shelter: "/icons/home.png",
};

const DEFAULT_ICON_PATH = "/icons/mushroom.png";

function getCustomIcon(path) {
    if (typeof window === "undefined") return null;
    return new L.Icon({
        iconUrl: path,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40], // Adjusts popup slightly above icon
    });
}

export default function Map({ data = [], filters = {}, mode, onMarkerSelect }) {
    const INDIA_CENTER = [23.25, 77.41];

    const isItemActive = (item) => {
        const key = mode === "category" ? item.category : item.use;
        return filters[key];
    };

    return (
        <div className="w-full h-full relative z-10">
            {typeof window !== "undefined" && (
                <MapContainer
                    center={INDIA_CENTER}
                    zoom={5}
                    className="h-full w-full outline-none"
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                    />

                    {data
                        .filter(isItemActive)
                        .map((item, i) => {
                            const iconPath = ICONS[item.category] || DEFAULT_ICON_PATH;
                            const icon = getCustomIcon(iconPath);

                            return (
                                <Marker
                                    key={i}
                                    position={[item.latitude, item.longitude]}
                                    icon={icon}
                                    eventHandlers={{
                                        click: () => {
                                            if (onMarkerSelect) onMarkerSelect(item);
                                        },
                                    }}
                                >
                                    {/* --- UPDATED POPUP DESIGN --- */}
                                    <Popup className="custom-popup">
                                        <div className="min-w-[200px] p-1">
                                            
                                            {/* Header: Name & Category badge */}
                                            <div className="border-b border-gray-200 pb-2 mb-2">
                                                <h3 className="font-bold text-lg text-gray-800 leading-tight m-0">
                                                    {item.name}
                                                </h3>
                                                <span 
                                                    className={`
                                                        inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white
                                                        ${item.category === 'food' ? 'bg-green-600' : 'bg-blue-600'}
                                                    `}
                                                >
                                                    {item.category}
                                                </span>
                                            </div>

                                            {/* Body: Details */}
                                            <div className="space-y-1 text-sm text-gray-600 mb-2">
                                                <div className="flex justify-between">
                                                    <span className="font-semibold text-gray-500 text-xs">Use:</span>
                                                    <span className="text-gray-900 capitalize font-medium">{item.use}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-semibold text-gray-500 text-xs">Contributor:</span>
                                                    <span className="text-gray-900">{item.contributor}</span>
                                                </div>
                                            </div>

                                            {/* Footer: Coordinates */}
                                            <div className="bg-gray-50 -mx-1 -mb-1 p-2 rounded-b text-[10px] text-gray-400 font-mono flex justify-between border-t border-gray-100">
                                                <span>Lat: {item.latitude}</span>
                                                <span>Lon: {item.longitude}</span>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                </MapContainer>
            )}
        </div>
    );
}