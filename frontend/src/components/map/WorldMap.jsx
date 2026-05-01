import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { getActiveMapLocations } from "../../api/mapLocation.api";

/* ─── Leaflet default ikon path düzeltmesi (Vite için zorunlu) ────────────── */
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon   from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl:       markerIcon,
  shadowUrl:     markerShadow,
});

/* ─── Özel kurumsal pin ikonu ─────────────────────────────────────────────── */
const iscevPin = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 36px; height: 36px;
      background: #1B3F84;
      border: 3px solid #DDE9F8;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 12px rgba(27,63,132,0.45);
    "></div>
  `,
  iconSize:   [36, 36],
  iconAnchor: [18, 36],
  popupAnchor:[0, -38],
});

/* ─── Backend görsel URL yardımcısı ──────────────────────────────────────── */
const uploadsBase = import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000";

const getImageUrl = (imageFilePath) => {
  if (!imageFilePath) return null;
  return `${uploadsBase}/${imageFilePath}`;
};

/* ─── Koordinat çıkarıcı (GeoJSON: [lng, lat]) ───────────────────────────── */
const getLatLng = (loc) => ({
  lat: loc.location.coordinates[1],
  lng: loc.location.coordinates[0],
});

/* ─── Yükleniyor Durumu (Harita Skeleton) ────────────────────────────────── */
function MapSkeleton() {
  return (
    <div
      className="w-full flex flex-col items-center justify-center gap-4"
      style={{ height: "520px", background: "#F0F5FC" }}
      aria-label="Harita yükleniyor"
    >
      {/* Dönen halka */}
      <div
        className="rounded-full border-4 border-iscev-light"
        style={{
          width: 52,
          height: 52,
          borderTopColor: "#1B3F84",
          animation: "spin 0.9s linear infinite",
        }}
      />
      <p className="text-sm font-gilroy font-medium" style={{ color: "#4988C5" }}>
        Harita yükleniyor…
      </p>

      {/* CSS animasyonu (global stilden bağımsız) */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

/* ─── Hata Durumu ─────────────────────────────────────────────────────────── */
function MapError({ onRetry }) {
  return (
    <div
      className="w-full flex flex-col items-center justify-center gap-3"
      style={{ height: "520px", background: "#F0F5FC" }}
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4988C5" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p className="text-sm font-gilroy font-medium text-gray-500">
        Lokasyonlar yüklenirken bir hata oluştu.
      </p>
      <button
        onClick={onRetry}
        className="text-xs font-gilroy font-semibold px-4 py-2 rounded-full"
        style={{ background: "#1B3F84", color: "#fff" }}
      >
        Tekrar Dene
      </button>
    </div>
  );
}

/* ─── Popup İçerik Bileşeni ───────────────────────────────────────────────── */
function LocationPopup({ loc }) {
  const imageUrl = getImageUrl(loc.imageFilePath);

  return (
    <div className="font-gilroy" style={{ minWidth: 240, maxWidth: 280 }}>
      {/* Proje görseli — varsa göster */}
      {imageUrl && (
        <div style={{ height: 130, overflow: "hidden" }}>
          <img
            src={imageUrl}
            alt={loc.projectName}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>
      )}

      {/* Başlık bandı */}
      <div
        className="px-4 py-3"
        style={{
          background: "#1B3F84",
          borderRadius: imageUrl ? "0" : "10px 10px 0 0",
        }}
      >
        <h3 className="text-white font-bold text-sm leading-snug">
          {loc.projectName}
        </h3>
        {loc.country && (
          <span className="text-xs font-medium" style={{ color: "#DDE9F8" }}>
            {loc.country}
          </span>
        )}
      </div>

      {/* Gövde */}
      <div className="px-4 py-3 bg-white rounded-b-lg">
        {loc.description && (
          <p className="text-gray-600 text-xs leading-relaxed mb-2">
            {loc.description}
          </p>
        )}
        {/* Koordinat bilgisi */}
        <div className="flex gap-1 flex-wrap pt-1 mb-3">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: "#DDE9F8", color: "#4988C5" }}
          >
            {getLatLng(loc).lat.toFixed(4)}°N
          </span>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: "#DDE9F8", color: "#4988C5" }}
          >
            {getLatLng(loc).lng.toFixed(4)}°E
          </span>
        </div>

        {/* Detay butonu */}
        <Link
          to={`/dunya-haritasi/${loc._id}`}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg
                     text-xs font-semibold text-white transition-opacity duration-150
                     hover:opacity-90"
          style={{ background: "#1B3F84" }}
        >
          Detayları İncele
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

/* ─── Ana Bileşen ─────────────────────────────────────────────────────────── */
export default function WorldMap({ hideHeading = false }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);

  const fetchLocations = async () => {
    setLoading(true);
    setError(false);
    try {
      const res  = await getActiveMapLocations();
      const raw  = res?.data?.data ?? res?.data ?? res;
      const list = raw?.locations ?? raw?.data ?? raw;
      setLocations(Array.isArray(list) ? list : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <section className="w-full" aria-label="İSÇEV Dünya Haritası">
      {/* Başlık — ayrı sayfada göster, ana sayfada gizle */}
      {!hideHeading && (
        <div className="container-iscev py-14 text-center">
          <p className="section-subtitle mb-2">Global Varlığımız</p>
          <h2 className="section-title mb-4">Dünya Genelindeki Projelerimiz</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
            Türkiye'den dünyaya uzanan projelerimizi harita üzerinde keşfedin.
            Pin'lere tıklayarak tesis detaylarına ulaşabilirsiniz.
          </p>
        </div>
      )}

      {/* Harita Wrapper */}
      <div className="w-full relative" style={{ height: "520px" }}>
        {/* Dekoratif üst şerit */}
        <div
          className="absolute top-0 left-0 right-0 h-1 z-10"
          style={{ background: "linear-gradient(90deg, #1B3F84, #4988C5, #DDE9F8)" }}
        />

        {/* Yükleme durumu */}
        {loading && <MapSkeleton />}

        {/* Hata durumu */}
        {!loading && error && <MapError onRetry={fetchLocations} />}

        {/* Harita — sadece veri hazır olduğunda render et */}
        {!loading && !error && (
          <MapContainer
            center={[25, 20]}
            zoom={2}
            minZoom={2}
            maxZoom={10}
            scrollWheelZoom={false}
            zoomControl={false}
            style={{ width: "100%", height: "100%" }}
            className="z-0"
            worldCopyJump
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            <ZoomControl position="bottomright" />

            {locations.map((loc) => {
              const { lat, lng } = getLatLng(loc);
              return (
                <Marker
                  key={loc._id}
                  position={[lat, lng]}
                  icon={iscevPin}
                >
                  <Popup
                    minWidth={240}
                    className="iscev-popup"
                    closeButton={false}
                  >
                    <LocationPopup loc={loc} />
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}

        {/* Pin sayacı rozeti — veri yüklendikten sonra göster */}
        {!loading && !error && (
          <div
            className="absolute bottom-4 left-4 z-20 flex items-center gap-2
                       bg-white/90 backdrop-blur-sm rounded-full px-4 py-2
                       shadow-md text-xs font-gilroy font-semibold"
            style={{ color: "#1B3F84" }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: "#1B3F84" }} />
            {locations.length} Aktif Proje
          </div>
        )}
      </div>

      {/* Leaflet popup özel stil override */}
      <style>{`
        .iscev-popup .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(27,63,132,0.2);
          border: none;
        }
        .iscev-popup .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .iscev-popup .leaflet-popup-tip {
          background: #1B3F84;
        }
      `}</style>
    </section>
  );
}
