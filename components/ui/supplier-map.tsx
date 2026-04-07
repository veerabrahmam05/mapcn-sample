"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

/* ───────────────── DATA ───────────────── */

const COUNTRY_DATA: Record<
  string,
  { supplierPct: number; totalSpend: number }
> = {
  US: { supplierPct: 92.9216, totalSpend: 2972455294.29 },
  CA: { supplierPct: 1.4902, totalSpend: 58706903.6 },
  EC: { supplierPct: 0.7843, totalSpend: 2116243.25 },
  GB: { supplierPct: 0.7255, totalSpend: 5316324.02 },
  DE: { supplierPct: 0.4118, totalSpend: 1578048.42 },
  IN: { supplierPct: 0.3333, totalSpend: 11001486.05 },
  MX: { supplierPct: 0.2745, totalSpend: 5717720.63 },
  NL: { supplierPct: 0.2549, totalSpend: 2067239.94 },
  CN: { supplierPct: 0.2353, totalSpend: 5815394.75 },
  CH: { supplierPct: 0.1569, totalSpend: 896456.48 },
  BR: { supplierPct: 0.1176, totalSpend: 1184600.52 },
  SD: { supplierPct: 0.1176, totalSpend: 2546677.51 },
  CO: { supplierPct: 0.1176, totalSpend: 396620.37 },
  PK: { supplierPct: 0.1176, totalSpend: 62178.99 },
  SG: { supplierPct: 0.1176, totalSpend: 287077.3 },
  JP: { supplierPct: 0.1176, totalSpend: 4778249.84 },
  AR: { supplierPct: 0.098, totalSpend: 698331.81 },
  HK: { supplierPct: 0.098, totalSpend: 166891 },
  BE: { supplierPct: 0.098, totalSpend: 113823.24 },
  FR: { supplierPct: 0.098, totalSpend: 280120.81 },
  IL: { supplierPct: 0.0784, totalSpend: 222034 },
  DK: { supplierPct: 0.0784, totalSpend: 186102.53 },
  CL: { supplierPct: 0.0784, totalSpend: 109859.94 },
  KR: { supplierPct: 0.0588, totalSpend: 5559634.09 },
  ES: { supplierPct: 0.0588, totalSpend: 1263358.56 },
  ZA: { supplierPct: 0.0392, totalSpend: 20874.72 },
  NO: { supplierPct: 0.0392, totalSpend: 1515297.02 },
  RO: { supplierPct: 0.0392, totalSpend: 570674.52 },
  SE: { supplierPct: 0.0392, totalSpend: 28003.25 },
  ID: { supplierPct: 0.0392, totalSpend: 5816.52 },
  AT: { supplierPct: 0.0392, totalSpend: 909120.88 },
  IT: { supplierPct: 0.0392, totalSpend: 839103.8 },
  TH: { supplierPct: 0.0392, totalSpend: 128606.85 },
  TD: { supplierPct: 0.0392, totalSpend: 8059936.9 },
  IE: { supplierPct: 0.0392, totalSpend: 1710819.12 },
  PE: { supplierPct: 0.0392, totalSpend: 10558.87 },
  MY: { supplierPct: 0.0392, totalSpend: 1434.95 },
  PY: { supplierPct: 0.0392, totalSpend: 58176 },
  AU: { supplierPct: 0.0392, totalSpend: 352662.4 },
  AE: { supplierPct: 0.0196, totalSpend: 386.82 },
  TT: { supplierPct: 0.0196, totalSpend: 69 },
  LK: { supplierPct: 0.0196, totalSpend: 565.23 },
  RU: { supplierPct: 0.0196, totalSpend: 15104.94 },
  VN: { supplierPct: 0.0196, totalSpend: 823.9 },
  JO: { supplierPct: 0.0196, totalSpend: 769.05 },
  TW: { supplierPct: 0.0196, totalSpend: 2599 },
  NI: { supplierPct: 0.0196, totalSpend: 51000 },
  TR: { supplierPct: 0.0196, totalSpend: 526400 },
  PA: { supplierPct: 0.0196, totalSpend: 142213.42 },
  BM: { supplierPct: 0.0196, totalSpend: 92877 },
  CZ: { supplierPct: 0.0196, totalSpend: 5332122.7 },
  PH: { supplierPct: 0.0196, totalSpend: 52415 },
  NE: { supplierPct: 0.0196, totalSpend: 99767.54 },
  KP: { supplierPct: 0.0196, totalSpend: 1451538.38 },
  HN: { supplierPct: 0.0196, totalSpend: 2000 },
  LB: { supplierPct: 0.0196, totalSpend: 733 },
  LT: { supplierPct: 0.0196, totalSpend: 1198 },
  UY: { supplierPct: 0.0196, totalSpend: 6113.95 },
};

// Capital city bubbles — only countries with spend data
const CITY_POINTS: {
  country: string;
  iso2: string;
  city: string;
  lng: number;
  lat: number;
}[] = [
  { country: "United States", iso2: "US", city: "Washington, D.C.", lng: -77.0369, lat: 38.9072 },
  { country: "Canada", iso2: "CA", city: "Ottawa", lng: -75.6972, lat: 45.4215 },
  { country: "Ecuador", iso2: "EC", city: "Quito", lng: -78.4678, lat: -0.1807 },
  { country: "United Kingdom", iso2: "GB", city: "London", lng: -0.1278, lat: 51.5074 },
  { country: "Germany", iso2: "DE", city: "Berlin", lng: 13.4061, lat: 52.52 },
  { country: "India", iso2: "IN", city: "New Delhi", lng: 77.209, lat: 28.6139 },
  { country: "Mexico", iso2: "MX", city: "Mexico City", lng: -99.1332, lat: 19.4326 },
  { country: "Netherlands", iso2: "NL", city: "Amsterdam", lng: 4.8951, lat: 52.3702 },
  { country: "China", iso2: "CN", city: "Beijing", lng: 116.3975, lat: 39.9042 },
  { country: "Switzerland", iso2: "CH", city: "Bern", lng: 6.1432, lat: 46.2044 },
  { country: "Brazil", iso2: "BR", city: "Brasília", lng: -47.9292, lat: -15.7939 },
  { country: "Sudan", iso2: "SD", city: "Khartoum", lng: 32.5342, lat: 15.5007 },
  { country: "Colombia", iso2: "CO", city: "Bogotá", lng: -74.0721, lat: 4.711 },
  { country: "Pakistan", iso2: "PK", city: "Islamabad", lng: 73.0479, lat: 33.6844 },
  { country: "Singapore", iso2: "SG", city: "Singapore", lng: 103.85, lat: 1.2833 },
  { country: "Japan", iso2: "JP", city: "Tokyo", lng: 139.6917, lat: 35.6895 },
  { country: "Argentina", iso2: "AR", city: "Buenos Aires", lng: -58.3816, lat: -34.6037 },
  { country: "Hong Kong", iso2: "HK", city: "Hong Kong", lng: 114.158, lat: 22.2783 },
  { country: "Belgium", iso2: "BE", city: "Brussels", lng: 4.351, lat: 50.8503 },
  { country: "France", iso2: "FR", city: "Paris", lng: 2.3522, lat: 48.8566 },
  { country: "Israel", iso2: "IL", city: "Jerusalem", lng: 35.2137, lat: 31.7683 },
  { country: "Denmark", iso2: "DK", city: "Copenhagen", lng: 12.5683, lat: 55.6761 },
  { country: "Chile", iso2: "CL", city: "Santiago", lng: -70.6693, lat: -33.4489 },
  { country: "South Korea", iso2: "KR", city: "Seoul", lng: 126.978, lat: 37.5665 },
  { country: "Spain", iso2: "ES", city: "Madrid", lng: -3.7038, lat: 40.4168 },
  { country: "South Africa", iso2: "ZA", city: "Pretoria", lng: 28.0473, lat: -25.7479 },
  { country: "Norway", iso2: "NO", city: "Oslo", lng: 10.7522, lat: 59.9139 },
  { country: "Romania", iso2: "RO", city: "Bucharest", lng: 26.1025, lat: 44.4268 },
  { country: "Sweden", iso2: "SE", city: "Stockholm", lng: 18.0649, lat: 59.3293 },
  { country: "Indonesia", iso2: "ID", city: "Jakarta", lng: 106.8456, lat: -6.2088 },
  { country: "Austria", iso2: "AT", city: "Vienna", lng: 16.3738, lat: 48.2082 },
  { country: "Italy", iso2: "IT", city: "Rome", lng: 12.4964, lat: 41.9028 },
  { country: "Thailand", iso2: "TH", city: "Bangkok", lng: 100.5018, lat: 13.7563 },
  { country: "Chad", iso2: "TD", city: "N'Djamena", lng: 18.7322, lat: 12.1348 },
  { country: "Ireland", iso2: "IE", city: "Dublin", lng: -6.2603, lat: 53.3498 },
  { country: "Peru", iso2: "PE", city: "Lima", lng: -77.0428, lat: -12.0464 },
  { country: "Malaysia", iso2: "MY", city: "Kuala Lumpur", lng: 101.6869, lat: 3.139 },
  { country: "Paraguay", iso2: "PY", city: "Asunción", lng: -57.5759, lat: -25.2637 },
  { country: "Australia", iso2: "AU", city: "Canberra", lng: 149.124, lat: -35.2809 },
  { country: "Turkey", iso2: "TR", city: "Ankara", lng: 28.9784, lat: 41.0082 },
  { country: "Czechia", iso2: "CZ", city: "Prague", lng: 14.4378, lat: 50.0755 },
  { country: "North Korea", iso2: "KP", city: "Pyongyang", lng: 125.7625, lat: 39.0392 },
  { country: "Honduras", iso2: "HN", city: "Tegucigalpa", lng: -87.221, lat: 14.0723 },
  { country: "Nicaragua", iso2: "NI", city: "Managua", lng: -86.2369, lat: 12.1364 },
  { country: "Philippines", iso2: "PH", city: "Manila", lng: 120.9842, lat: 14.5995 },
  { country: "Niger", iso2: "NE", city: "Niamey", lng: 2.1254, lat: 13.5116 },
  { country: "Panama", iso2: "PA", city: "Panama City", lng: -79.5199, lat: 8.9824 },
  { country: "Uruguay", iso2: "UY", city: "Montevideo", lng: -56.1645, lat: -34.9011 },
  { country: "Taiwan", iso2: "TW", city: "Taipei", lng: 121.5654, lat: 25.033 },
  { country: "Jordan", iso2: "JO", city: "Amman", lng: 35.95, lat: 31.95 },
  { country: "Vietnam", iso2: "VN", city: "Hanoi", lng: 105.8342, lat: 21.0285 },
  { country: "Russia", iso2: "RU", city: "Moscow", lng: 37.6173, lat: 55.7558 },
  { country: "Sri Lanka", iso2: "LK", city: "Colombo", lng: 79.8612, lat: 6.9271 },
  { country: "United Arab Emirates", iso2: "AE", city: "Abu Dhabi", lng: 54.3667, lat: 24.4667 },
  { country: "Trinidad and Tobago", iso2: "TT", city: "Port of Spain", lng: -61.5167, lat: 10.6667 },
  { country: "Lebanon", iso2: "LB", city: "Beirut", lng: 35.5018, lat: 33.8938 },
  { country: "Lithuania", iso2: "LT", city: "Vilnius", lng: 25.2797, lat: 54.6872 },
  { country: "Bermuda", iso2: "BM", city: "Hamilton", lng: -64.706, lat: 32.2949 },
];

/* ✅ Fix Turkey coords */

CITY_POINTS.forEach((c) => {
  if (c.iso2 === "TR") {
    c.lng = 32.8597;
    c.lat = 39.9334;
  }
});

/* ───────────────── HELPERS ───────────────── */

function supplierPctToColor(pct?: number | null) {
  if (!pct) return "#F8D5B5";
  const MAX = 92.9216;
  const t = Math.sqrt(pct / MAX);

  const stops = [
    [245, 193, 143],
    [243, 182, 125],
    [241, 172, 106],
    [240, 161, 88],
    [238, 151, 69],
  ];

  const idx = t * (stops.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, stops.length - 1);
  const frac = idx - lo;

  const r = Math.round(stops[lo][0] + frac * (stops[hi][0] - stops[lo][0]));
  const g = Math.round(stops[lo][1] + frac * (stops[hi][1] - stops[lo][1]));
  const b = Math.round(stops[lo][2] + frac * (stops[hi][2] - stops[lo][2]));

  return `rgb(${r},${g},${b})`;
}

function spendToRadius(spend: number) {
  const MIN = 69;
  const MAX = 2972455294;

  const normalized = Math.max(0, (spend - MIN) / (MAX - MIN));
  return 4 + Math.sqrt(normalized) * (22 - 4);
}

function formatSpend(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

/* ───────────────── STYLE ───────────────── */

const GEOJSON_URL =
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

const OCEAN_COLOR = "#2B2418";
const HOVER_COLOR = "#C4547B";

function buildStyle(): maplibregl.StyleSpecification {
  return {
    version: 8,
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf", // ✅ ADD
    sources: {},
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": OCEAN_COLOR },
      },
    ],
  };
}

/* ───────────────── COMPONENT ───────────────── */

export default function SupplierMap() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [tooltip, setTooltip] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  const rafRef = useRef<number | null>(null);

  const showTooltip = (x: number, y: number, content: any) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      setTooltip({ x, y, content });
    });
  };

  const hideTooltip = () => setTooltip(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildStyle(),
      center: [-20, 20],
      zoom: 1.5,
    });

    mapRef.current = map;

    map.on("load", async () => {
      let geojson;
      try {
        const res = await fetch(GEOJSON_URL);
        geojson = await res.json();

        if (!geojson?.features) throw new Error("Invalid GeoJSON");
      } catch (err) {
        console.error("GeoJSON load failed", err);
        return;
      }

      /* ✅ SINGLE PASS ENRICH */
      const features = geojson.features.map((f: any, i: number) => {
        const iso2 = f.properties?.ISO_A2 || "";
        const d = COUNTRY_DATA[iso2];

        return {
          ...f,
          id: i,
          properties: {
            ...f.properties,
            iso2,
            supplierPct: d?.supplierPct ?? null,
            totalSpend: d?.totalSpend ?? null,
            countryName: f.properties?.ADMIN,
            fillColor: supplierPctToColor(d?.supplierPct),
          },
        };
      });

      map.addSource("countries", {
        type: "geojson",
        data: { type: "FeatureCollection", features },
      });

      /* ✅ FEATURE STATE HOVER */
      map.addLayer({
        id: "countries-fill",
        type: "fill",
        source: "countries",
        paint: {
          "fill-color": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            HOVER_COLOR,
            ["get", "fillColor"],
          ],
        },
      });

      map.addLayer({
        id: "countries-line",
        type: "line",
        source: "countries",
        paint: {
          "line-color": "#2B2418",
          "line-width": 0.5,
        },
      });

      let hoveredId: number | null = null;

      map.on("mousemove", "countries-fill", (e) => {
        if (!e.features?.length) return;

        const f = e.features[0];

        if (hoveredId !== null) {
          map.setFeatureState(
            { source: "countries", id: hoveredId },
            { hover: false },
          );
        }

        hoveredId = f.id as number;

        map.setFeatureState(
          { source: "countries", id: hoveredId },
          { hover: true },
        );

        map.getCanvas().style.cursor = "pointer";

        const p = f.properties;

        showTooltip(
          e.originalEvent.clientX,
          e.originalEvent.clientY,
          <div>
            <div className="font-semibold">{p.countryName}</div>
            <div className="text-xs opacity-80">
              Supplier %: {p.supplierPct?.toFixed(2) ?? "No data"}
            </div>
          </div>,
        );
      });

      map.on("mouseleave", "countries-fill", () => {
        if (hoveredId !== null) {
          map.setFeatureState(
            { source: "countries", id: hoveredId },
            { hover: false },
          );
        }
        hoveredId = null;
        hideTooltip();
      });

      /* ─── BUBBLES ─── */

      const cityFeatures = CITY_POINTS.map((c) => {
        const d = COUNTRY_DATA[c.iso2];
        if (!d) return null;

        return {
          type: "Feature",
          geometry: { type: "Point", coordinates: [c.lng, c.lat] },
          properties: {
            city: c.city,
            totalSpend: d.totalSpend,
            radius: spendToRadius(d.totalSpend),
          },
        };
      }).filter(Boolean);

      map.addSource("cities", {
        type: "geojson",
        data: { type: "FeatureCollection", features: cityFeatures },
      });

      map.addLayer({
        id: "cities",
        type: "circle",
        source: "cities",
        paint: {
          "circle-radius": ["get", "radius"],
          "circle-color": "#C4547B",
          "circle-opacity": 0.85,
        },
      });

      map.on("mousemove", "cities", (e) => {
        if (!e.features?.length) return;
        const p = e.features[0].properties;

        showTooltip(
          e.originalEvent.clientX,
          e.originalEvent.clientY,
          <div>
            <div className="font-semibold">{p.city}</div>
            <div className="text-xs">
              Spend: {formatSpend(Number(p.totalSpend))}
            </div>
          </div>,
        );
      });

      map.on("mouseleave", "cities", () => {
        map.getCanvas().style.cursor = ""; // ✅ ADD
        hideTooltip();
      });

      setLoaded(true);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="absolute inset-0" />

      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          Loading map...
        </div>
      )}

      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 bg-black text-white text-sm rounded"
          style={{
            left: Math.min(tooltip.x + 10, window.innerWidth - 220),
            top: Math.min(tooltip.y, window.innerHeight - 100),
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
