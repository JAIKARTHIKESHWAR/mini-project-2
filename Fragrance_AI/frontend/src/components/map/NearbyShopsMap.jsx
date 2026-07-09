/**
 * NearbyShopsMap.jsx
 *
 * Renders a Google Map with nearby perfume shops.
 * All Places API calls go through YOUR backend (no key exposed to browser).
 *
 * Props:
 *   apiBase {string}  — base URL of your backend, e.g. "http://localhost:3000"
 *                       Defaults to import.meta.env.VITE_API_URL || "http://localhost:3000"
 *
 * Usage (in your chat renderer, when API returns showNearbyMap: true):
 *   <NearbyShopsMap />
 */

import React, { useEffect, useRef, useState, useCallback } from "react";

const API_BASE =
  typeof import.meta !== "undefined"
    ? import.meta.env?.VITE_API_URL || "http://localhost:5000"
    : "http://localhost:5000";

const MAPS_KEY = typeof import.meta !== "undefined"
  ? import.meta.env?.VITE_GOOGLE_MAPS_API_KEY || ""
  : "";

// ─── Google Maps script loader (singleton, uses official callback pattern) ────
let _gmState = "idle";
const _gmQueue = [];
const loadGoogleMaps = (cb) => {
  if (_gmState === "ready" && window.google?.maps) { cb(); return; }
  _gmQueue.push(cb);
  if (_gmState === "loading") return;
  _gmState = "loading";
  window.__gmapsReady = () => {
    _gmState = "ready";
    delete window.__gmapsReady;
    _gmQueue.splice(0).forEach((fn) => fn());
  };
  const s = document.createElement("script");
  // Only the Maps JS SDK is loaded here (for map rendering + markers).
  // Places searches are done server-side — no Places library needed.
  s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&callback=__gmapsReady`;
  s.async = true;
  s.defer = true;
  s.onerror = () => { _gmState = "idle"; };
  document.head.appendChild(s);
};

// ─── Utils ───────────────────────────────────────────────────────────────────
const distKm = (a, b) => {
  if (!a || !b) return null;
  const R = 6371, r = (x) => (x * Math.PI) / 180;
  const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))).toFixed(1);
};

const photoUrl = (ref, w = 400) =>
  ref ? `${API_BASE}/api/places/photo?ref=${ref}&maxwidth=${w}` : null;

// ─── Stars ───────────────────────────────────────────────────────────────────
const Stars = ({ r }) => (
  <span style={{ display: "inline-flex", gap: 1 }}>
    {[1, 2, 3, 4, 5].map((i) => {
      const pct = Math.min(100, Math.max(0, (r - (i - 1)) * 100));
      return (
        <span key={i} style={{ position: "relative", fontSize: 11, lineHeight: 1 }}>
          <span style={{ color: "#3a3a3a" }}>★</span>
          <span style={{ position: "absolute", left: 0, top: 0, width: `${pct}%`, overflow: "hidden", color: "#FBBC04" }}>★</span>
        </span>
      );
    })}
  </span>
);

// ─── Location Permission Screen ───────────────────────────────────────────────
// Shown before anything else if we haven't asked for permission yet.
const LocationPrompt = ({ onAllow, onDeny }) => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", padding: "40px 24px", textAlign: "center",
    background: "#202124", borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.1)",
  }}>
    <div style={{ fontSize: 48, marginBottom: 16 }}>📍</div>
    <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800, color: "#E8EAED" }}>
      Allow Location Access
    </h3>
    <p style={{ margin: "0 0 24px", fontSize: 13, color: "#9AA0A6", lineHeight: 1.6, maxWidth: 300 }}>
      To show perfume shops near you, we need your location.
      Your location is only used for this search and is never stored.
    </p>
    <div style={{ display: "flex", gap: 10 }}>
      <button
        onClick={onAllow}
        style={{
          background: "#4285F4", color: "#fff", border: "none",
          padding: "10px 24px", borderRadius: 8, fontSize: 13,
          fontWeight: 700, cursor: "pointer",
        }}
      >
        Allow Location
      </button>
      <button
        onClick={onDeny}
        style={{
          background: "rgba(255,255,255,0.08)", color: "#9AA0A6",
          border: "1px solid rgba(255,255,255,0.12)",
          padding: "10px 20px", borderRadius: 8, fontSize: 13,
          fontWeight: 600, cursor: "pointer",
        }}
      >
        Use My City
      </button>
    </div>
  </div>
);

// ─── Detail Panel ─────────────────────────────────────────────────────────────
// Slides in over the list panel — map stays fully visible.
const DetailPanel = ({ shop, userLoc, onBack }) => {
  const [det, setDet] = useState(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!shop?.place_id) return;
    setBusy(true); setDet(null);
    fetch(`${API_BASE}/api/places/detail?placeId=${encodeURIComponent(shop.place_id)}`)
      .then((r) => r.json())
      .then((data) => { setDet(data); setBusy(false); })
      .catch(() => setBusy(false));
  }, [shop]);

  const loc = det?.geometry ?? shop?.geometry;
  const dist = distKm(userLoc, loc);
  const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${shop.place_id}`;
  const dirUrl = loc?.lat
    ? `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}&destination_place_id=${shop.place_id}`
    : mapsUrl;

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 20,
      background: "#1a1b1e", display: "flex", flexDirection: "column",
      animation: "slideIn 0.22s ease",
    }}>
      {/* Back bar */}
      <div style={{
        padding: "10px 14px", display: "flex", alignItems: "center", gap: 10,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "#202124", flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          background: "rgba(255,255,255,0.08)", border: "none", color: "#E8EAED",
          width: 30, height: 30, borderRadius: 6, cursor: "pointer", fontSize: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>←</button>
        <span style={{ fontSize: 12, color: "#9AA0A6" }}>Back to results</span>
      </div>

      <div className="psm-list" style={{ flex: 1, overflowY: "auto" }}>
        {busy ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 48, gap: 12 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#4285F4", animation: "spin 0.8s linear infinite" }} />
            <span style={{ fontSize: 12, color: "#9AA0A6" }}>Loading details…</span>
          </div>
        ) : det ? (
          <>
            {/* Hero photo */}
            {det.photos?.[0] && (
              <img
                src={photoUrl(det.photos[0].reference, 640)}
                alt={det.name}
                crossOrigin="anonymous"
                style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            )}
            <div style={{ padding: "14px 16px" }}>
              <h2 style={{ margin: "0 0 5px", fontSize: 17, fontWeight: 800, color: "#E8EAED" }}>{det.name}</h2>

              {det.rating != null && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#FBBC04" }}>{det.rating}</span>
                  <Stars r={det.rating} />
                  {det.user_ratings_total != null && (
                    <span style={{ fontSize: 11, color: "#9AA0A6" }}>({det.user_ratings_total.toLocaleString()})</span>
                  )}
                </div>
              )}

              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                {det.open_now != null && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, color: det.open_now ? "#34A853" : "#EA4335", background: det.open_now ? "rgba(52,168,83,0.12)" : "rgba(234,67,53,0.12)" }}>
                    {det.open_now ? "● Open Now" : "● Closed"}
                  </span>
                )}
                {dist && <span style={{ fontSize: 11, color: "#9AA0A6", background: "rgba(255,255,255,0.07)", padding: "3px 8px", borderRadius: 4 }}>📍 {dist} km</span>}
                {det.price_level != null && <span style={{ fontSize: 11, color: "#34A853", background: "rgba(52,168,83,0.1)", padding: "3px 8px", borderRadius: 4 }}>{"₹".repeat(det.price_level)}</span>}
              </div>

              {/* CTA — both open Google Maps */}
              <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                <a href={dirUrl} target="_blank" rel="noopener noreferrer"
                  style={{ flex: 1, background: "#4285F4", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 0", borderRadius: 8, textDecoration: "none", textAlign: "center", display: "block" }}>
                  🗺️ Directions
                </a>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#E8EAED", fontWeight: 700, fontSize: 13, padding: "10px 0", borderRadius: 8, textDecoration: "none", textAlign: "center", display: "block" }}>
                  View on Maps ↗
                </a>
              </div>

              <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 14 }} />

              {/* Info rows */}
              {[
                det.formatted_address && { icon: "📍", label: "Address", value: det.formatted_address, href: mapsUrl },
                det.phone && { icon: "📞", label: "Phone", value: det.phone, href: `tel:${det.phone}` },
                det.website && { icon: "🌐", label: "Website", value: det.website.replace(/^https?:\/\/(www\.)?/, ""), href: det.website },
              ].filter(Boolean).map(({ icon, label, value, href }) => (
                <div key={label} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>{icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: "#9AA0A6", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 2 }}>{label}</div>
                    <a href={href} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, color: "#8AB4F8", textDecoration: "none", fontWeight: 600, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {value}
                    </a>
                  </div>
                </div>
              ))}

              {/* Hours */}
              {det.weekday_text?.length > 0 && (
                <>
                  <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "4px 0 12px" }} />
                  <div style={{ fontSize: 10, color: "#9AA0A6", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 8 }}>⏰ Hours</div>
                  {det.weekday_text.map((h, i) => {
                    const [day, ...rest] = h.split(": ");
                    const isToday = h.startsWith(new Date().toLocaleString("en-US", { weekday: "long" }));
                    return (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "4px 7px", borderRadius: 5, background: isToday ? "rgba(66,133,244,0.1)" : "transparent", color: isToday ? "#8AB4F8" : "#9AA0A6", fontWeight: isToday ? 700 : 400 }}>
                        <span>{day}</span><span>{rest.join(": ")}</span>
                      </div>
                    );
                  })}
                </>
              )}

              {/* Reviews */}
              {det.reviews?.length > 0 && (
                <>
                  <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "14px 0 12px" }} />
                  <div style={{ fontSize: 10, color: "#9AA0A6", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 10 }}>💬 Reviews</div>
                  {det.reviews.map((rv, i) => (
                    <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < det.reviews.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}>
                        {rv.avatar && <img src={rv.avatar} alt={rv.author} style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0 }} onError={(e) => { e.target.style.display = "none"; }} />}
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#E8EAED" }}>{rv.author}</div>
                          <Stars r={rv.rating} />
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: 11, color: "#9AA0A6", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>"{rv.text}"</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        ) : (
          <div style={{ padding: 28, textAlign: "center", color: "#9AA0A6", fontSize: 12 }}>
            Could not load details.{" "}
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#8AB4F8" }}>Open on Google Maps ↗</a>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Shop Card ────────────────────────────────────────────────────────────────
const ShopCard = ({ shop, userLoc, isActive, onSelect, onDetails }) => {
  const dist = distKm(userLoc, shop.geometry);
  const img = photoUrl(shop.photo_reference);
  const dirUrl = shop.geometry?.lat
    ? `https://www.google.com/maps/dir/?api=1&destination=${shop.geometry.lat},${shop.geometry.lng}&destination_place_id=${shop.place_id}`
    : `https://www.google.com/maps/place/?q=place_id:${shop.place_id}`;

  return (
    <div
      onClick={() => onSelect(shop)}
      style={{
        display: "flex", gap: 10, padding: "12px 14px",
        cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: isActive ? "rgba(66,133,244,0.1)" : "transparent",
        borderLeft: isActive ? "3px solid #4285F4" : "3px solid transparent",
        transition: "background 0.15s", boxSizing: "border-box",
      }}
    >
      <div style={{ width: 62, height: 62, borderRadius: 8, flexShrink: 0, overflow: "hidden", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.07)" }}>
        {img ? (
          <img
            src={img}
            alt={shop.name}
            crossOrigin="anonymous"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              console.error("IMG FAILED:", e.target.src);
              e.target.style.display = "none";
            }}
          />
        ) : <span style={{ fontSize: 22 }}>🧴</span>}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#E8EAED", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 175 }}>
            {shop.name}
          </div>
          {dist && <span style={{ fontSize: 11, color: "#9AA0A6", flexShrink: 0 }}>{dist} km</span>}
        </div>

        {shop.rating != null && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#FBBC04" }}>{shop.rating}</span>
            <Stars r={shop.rating} />
            {shop.user_ratings_total != null && (
              <span style={{ fontSize: 11, color: "#9AA0A6" }}>({shop.user_ratings_total.toLocaleString()})</span>
            )}
          </div>
        )}

        <div style={{ fontSize: 11, color: "#9AA0A6", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {shop.vicinity}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
          {shop.open_now != null && (
            <span style={{ fontSize: 11, fontWeight: 700, color: shop.open_now ? "#34A853" : "#EA4335" }}>
              {shop.open_now ? "● Open" : "● Closed"}
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDetails(shop); }}
            style={{ fontSize: 11, color: "#8AB4F8", background: "rgba(138,180,248,0.1)", border: "1px solid rgba(138,180,248,0.2)", padding: "2px 8px", borderRadius: 4, cursor: "pointer", fontWeight: 600 }}
          >Details</button>
          <a
            href={dirUrl} target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ fontSize: 11, color: "#34A853", background: "rgba(52,168,83,0.1)", border: "1px solid rgba(52,168,83,0.2)", padding: "2px 8px", borderRadius: 4, textDecoration: "none", fontWeight: 600 }}
          >Directions ↗</a>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ d }) => (
  <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
    <div style={{ width: 62, height: 62, borderRadius: 8, background: "rgba(255,255,255,0.07)", flexShrink: 0, animation: `shimmer 1.8s ${d}s infinite` }} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
      {[["75%", d], ["55%", d + 0.1], ["88%", d + 0.2]].map(([w, delay], i) => (
        <div key={i} style={{ height: i === 0 ? 13 : 11, width: w, borderRadius: 3, background: `rgba(255,255,255,${i === 0 ? 0.07 : 0.05})`, animation: `shimmer 1.8s ${delay}s infinite` }} />
      ))}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const NearbyShopsMap = () => {
  const mapRef = useRef(null);
  const mapInstRef = useRef(null);
  const markersRef = useRef([]);
  const infoWinRef = useRef(null);
  const fetchedRef = useRef(false);

  const [phase, setPhase] = useState("prompt"); // "prompt" | "locating" | "ready"
  const [shops, setShops] = useState([]);
  const [activeShop, setActiveShop] = useState(null);
  const [detailShop, setDetailShop] = useState(null);
  const [userLoc, setUserLoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Detecting your location…");
  const [locWarn, setLocWarn] = useState(null);

  // ── Fetch shops from backend ────────────────────────────────────────────
  const fetchShops = useCallback(async (lat, lng) => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setStatusMsg("Searching for perfume shops…");

    try {
      const res = await fetch(`${API_BASE}/api/places/nearby?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.results || [];
    } catch (err) {
      console.error("Fetch shops error:", err);
      return [];
    }
  }, []);

  // ── Place markers on map ────────────────────────────────────────────────
  const placeMarkers = useCallback((map, list) => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    list.forEach((shop, i) => {
      const loc = shop.geometry;
      if (!loc?.lat || !loc?.lng) return;
      const top = i < 3;

      const marker = new window.google.maps.Marker({
        map,
        position: { lat: loc.lat, lng: loc.lng },
        title: shop.name,
        zIndex: top ? 200 - i : 50,
        icon: top
          ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
          : "https://maps.google.com/mapfiles/ms/icons/pink-dot.png",
        animation: top ? window.google.maps.Animation.DROP : null,
      });
      marker._pid = shop.place_id;

      marker.addListener("click", () => {
        const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}&destination_place_id=${shop.place_id}`;
        const viewUrl = `https://www.google.com/maps/place/?q=place_id:${shop.place_id}`;

        infoWinRef.current.setContent(`
          <div style="max-width:230px;padding:4px 2px">
            <div style="font-size:14px;font-weight:800;color:#202124;margin-bottom:3px">${shop.name}</div>
            <div style="font-size:12px;color:#70757a;margin-bottom:4px">${shop.vicinity || ""}</div>
            ${shop.rating ? `<div style="font-size:13px;color:#e37400;font-weight:700;margin-bottom:4px">★ ${shop.rating}${shop.user_ratings_total ? ` (${shop.user_ratings_total.toLocaleString()})` : ""}</div>` : ""}
            ${shop.open_now != null ? `<div style="font-size:12px;font-weight:700;color:${shop.open_now ? "#137333" : "#c5221f"};margin-bottom:8px">${shop.open_now ? "● Open Now" : "● Closed"}</div>` : ""}
            <div style="display:flex;gap:6px">
              <a href="${dirUrl}" target="_blank" rel="noopener noreferrer"
                style="flex:1;text-align:center;background:#4285F4;color:white;padding:8px 6px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:700">
                🗺️ Directions
              </a>
              <a href="${viewUrl}" target="_blank" rel="noopener noreferrer"
                style="flex:1;text-align:center;background:#34A853;color:white;padding:8px 6px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:700">
                View on Maps
              </a>
            </div>
          </div>
        `);
        infoWinRef.current.open(map, marker);
        setActiveShop(shop);
      });

      markersRef.current.push(marker);
    });
  }, []);

  // ── Init Google Map ─────────────────────────────────────────────────────
  const initMap = useCallback(
    async (loc) => {
      if (!mapRef.current || mapInstRef.current) return;

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: loc.lat, lng: loc.lng },
        zoom: 14,
        mapTypeControl: false, streetViewControl: false,
        fullscreenControl: false, zoomControl: true,
        gestureHandling: "greedy",
        styles: [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
          { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
          { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
          { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
          { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
          { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
          { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
        ],
      });
      mapInstRef.current = map;
      infoWinRef.current = new window.google.maps.InfoWindow();

      // Blue dot = user location
      new window.google.maps.Marker({
        position: { lat: loc.lat, lng: loc.lng }, map, zIndex: 999,
        icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: "#4285F4", fillOpacity: 1, strokeWeight: 3, strokeColor: "#ffffff" },
      });

      // Fetch shops from backend
      const results = await fetchShops(loc.lat, loc.lng);
      setShops(results);
      setLoading(false);

      if (results.length > 0) {
        setStatusMsg(`${results.length} shops found near you`);
        placeMarkers(map, results);

        // Fit bounds to show all markers
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend({ lat: loc.lat, lng: loc.lng });
        results.slice(0, 12).forEach((s) => {
          if (s.geometry?.lat) bounds.extend({ lat: s.geometry.lat, lng: s.geometry.lng });
        });
        map.fitBounds(bounds, { top: 40, right: 20, bottom: 40, left: 20 });
      } else {
        setStatusMsg("No perfume shops found nearby.");
      }
    },
    [fetchShops, placeMarkers]
  );

  // ── Focus shop on map ───────────────────────────────────────────────────
  const focusShop = useCallback((shop) => {
    const map = mapInstRef.current;
    if (!map || !shop.geometry?.lat) return;
    map.panTo({ lat: shop.geometry.lat, lng: shop.geometry.lng });
    map.setZoom(16);
    const marker = markersRef.current.find((m) => m._pid === shop.place_id);
    if (marker) window.google.maps.event.trigger(marker, "click");
  }, []);

  // ── Bootstrap with location ─────────────────────────────────────────────
  const bootstrap = useCallback(
    (loc, warn = null) => {
      setUserLoc(loc);
      if (warn) setLocWarn(warn);
      setPhase("ready");
      setLoading(true);
      setStatusMsg("Detecting your location…");
      if (!MAPS_KEY) {
        setStatusMsg("⚠ Add VITE_GOOGLE_MAPS_API_KEY to your frontend .env (for map rendering only)");
        setLoading(false);
        return;
      }
      loadGoogleMaps(() => initMap(loc));
    },
    [initMap]
  );

  // ── Handle Allow button ─────────────────────────────────────────────────
  const handleAllow = useCallback(() => {
    setPhase("locating");
    if (!navigator.geolocation) {
      bootstrap({ lat: 11.0168, lng: 76.9558 }, "Geolocation not supported — using Coimbatore");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => bootstrap({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => bootstrap({ lat: 11.0168, lng: 76.9558 }, "Location denied — using approximate location"),
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [bootstrap]);

  // ── Handle Deny (use city fallback) ────────────────────────────────────
  const handleDeny = useCallback(() => {
    bootstrap({ lat: 11.0168, lng: 76.9558 }, "Using Coimbatore — enable location for better results");
  }, [bootstrap]);

  // ─── RENDER ─────────────────────────────────────────────────────────────
  if (phase === "prompt") {
    return <LocationPrompt onAllow={handleAllow} onDeny={handleDeny} />;
  }

  if (phase === "locating") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, gap: 14, background: "#202124", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#4285F4", animation: "spin 0.8s linear infinite" }} />
        <span style={{ fontSize: 13, color: "#9AA0A6" }}>Getting your location…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%,100%{opacity:.3} 50%{opacity:.75} }
        @keyframes slideIn { from { transform: translateX(100%); opacity:0; } to { transform:none; opacity:1; } }
        .psm-list::-webkit-scrollbar       { width: 3px; }
        .psm-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .psm-list::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <div style={{ width: "100%", marginTop: 10, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "#202124", boxShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>
        {/* Header */}
        <div style={{ padding: "10px 14px", background: "#292a2d", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 15 }}>📍</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#E8EAED" }}>Nearby Perfume Shops</div>
              <div style={{ fontSize: 11, color: "#9AA0A6" }}>{statusMsg}</div>
            </div>
          </div>
          {locWarn && (
            <div style={{ fontSize: 11, color: "#FBBC04", background: "rgba(251,188,4,0.1)", padding: "4px 9px", borderRadius: 6, maxWidth: 210, textAlign: "right", lineHeight: 1.4 }}>
              ⚠ {locWarn}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ display: "flex", height: 520 }}>
          {/* LEFT: list */}
          <div style={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", borderRight: "1px solid rgba(255,255,255,0.08)", position: "relative" }}>
            {detailShop && (
              <DetailPanel shop={detailShop} userLoc={userLoc} onBack={() => setDetailShop(null)} />
            )}

            <div style={{ padding: "8px 14px 6px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: "#9AA0A6", fontWeight: 600 }}>{loading ? "Searching…" : `${shops.length} places`}</span>
              {!loading && shops.length > 0 && <span style={{ fontSize: 11, color: "#9AA0A6" }}>Sorted by rating</span>}
            </div>

            <div className="psm-list" style={{ flex: 1, overflowY: "auto" }}>
              {loading ? (
                <>
                  {[0, 0.15, 0.3, 0.45].map((d, i) => <Skeleton key={i} d={d} />)}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 18, gap: 8 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#4285F4", animation: "spin 0.8s linear infinite" }} />
                    <span style={{ fontSize: 12, color: "#9AA0A6" }}>Finding shops near you…</span>
                  </div>
                </>
              ) : shops.length === 0 ? (
                <div style={{ padding: 36, textAlign: "center" }}>
                  <div style={{ fontSize: 34, marginBottom: 10 }}>🔍</div>
                  <p style={{ color: "#9AA0A6", fontSize: 12, lineHeight: 1.6 }}>No perfume shops found nearby.<br />Try enabling precise location.</p>
                </div>
              ) : (
                shops.map((shop) => (
                  <ShopCard
                    key={shop.place_id}
                    shop={shop}
                    userLoc={userLoc}
                    isActive={activeShop?.place_id === shop.place_id}
                    onSelect={(s) => { setActiveShop(s); focusShop(s); }}
                    onDetails={(s) => setDetailShop(s)}
                  />
                ))
              )}

              {!loading && shops.length > 0 && userLoc && (
                <div style={{ padding: "12px 14px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <a href={`https://www.google.com/maps/search/perfume+shop/@${userLoc.lat},${userLoc.lng},14z`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#8AB4F8", textDecoration: "none", fontWeight: 600 }}>
                    More places on Google Maps ↗
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Map — always mounted */}
          <div style={{ flex: 1, position: "relative" }}>
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

            {loading && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(32,33,36,0.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", margin: "0 auto 10px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#4285F4", animation: "spin 0.8s linear infinite" }} />
                  <span style={{ fontSize: 13, color: "#9AA0A6" }}>Loading map…</span>
                </div>
              </div>
            )}

            {!loading && !activeShop && shops.length > 0 && (
              <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", background: "rgba(32,33,36,0.92)", border: "1px solid rgba(255,255,255,0.1)", padding: "7px 14px", borderRadius: 20, fontSize: 12, color: "#9AA0A6", pointerEvents: "none", whiteSpace: "nowrap" }}>
                Click a shop or pin to see details
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NearbyShopsMap;