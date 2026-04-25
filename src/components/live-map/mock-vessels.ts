// Mock vessel positions for the Live Map. Each record is a snapshot of
// a vessel carrying one of our tracked MBLs — lat/lng + heading (0–360°)
// + status. When the paid AIS feed (Spire / MarineTraffic / VesselFinder)
// is wired, swap this export for the query-hook result. Component
// contract stays identical.

export type VesselStatus = "underway" | "anchored" | "at-port" | "delayed";

export type Vessel = {
  id: string;
  name: string;
  mbl: string;
  carrierName: string;
  /** degrees, clockwise from north */
  heading: number;
  lat: number;
  lng: number;
  speedKnots: number;
  status: VesselStatus;
  origin: string;
  destination: string;
  etaLabel: string;
};

export const MOCK_VESSELS: Vessel[] = [
  {
    id: "v1",
    name: "X-PRESS PHOENIX",
    mbl: "MAEU265099858",
    carrierName: "Maersk",
    heading: 72,
    lat: 34.5,
    lng: -140.5,
    speedKnots: 18.2,
    status: "underway",
    origin: "Busan",
    destination: "Baltimore",
    etaLabel: "Mar 31",
  },
  {
    id: "v2",
    name: "KOTA LUKIS",
    mbl: "SMLMSEL6A6437700",
    carrierName: "SM Line",
    heading: 48,
    lat: 39.2,
    lng: -155.8,
    speedKnots: 16.9,
    status: "underway",
    origin: "Busan",
    destination: "Vancouver",
    etaLabel: "Mar 23",
  },
  {
    id: "v3",
    name: "MAERSK SENTOSA",
    mbl: "MAEU266492226",
    carrierName: "Maersk",
    heading: 120,
    lat: 13.7,
    lng: 100.5,
    speedKnots: 0,
    status: "at-port",
    origin: "Bangkok",
    destination: "Los Angeles",
    etaLabel: "Apr 10",
  },
  {
    id: "v4",
    name: "SM SHANGHAI",
    mbl: "SMLMSEL6A8407600",
    carrierName: "SM Line",
    heading: 90,
    lat: 33.8,
    lng: -118.2,
    speedKnots: 3.1,
    status: "at-port",
    origin: "Busan",
    destination: "Long Beach",
    etaLabel: "Mar 22",
  },
  {
    id: "v5",
    name: "YM TRILLION",
    mbl: "HDMUSELM55873400",
    carrierName: "HMM",
    heading: 60,
    lat: 32.1,
    lng: -80.0,
    speedKnots: 14.5,
    status: "underway",
    origin: "Busan",
    destination: "Savannah",
    etaLabel: "Apr 4",
  },
  {
    id: "v6",
    name: "SM QINGDAO",
    mbl: "SMLMSEL6A6436600",
    carrierName: "SM Line",
    heading: 250,
    lat: 35.1,
    lng: -135.2,
    speedKnots: 17.8,
    status: "underway",
    origin: "Busan",
    destination: "Vancouver",
    etaLabel: "Mar 17",
  },
  {
    id: "v7",
    name: "MUNDRA EXPRESS",
    mbl: "MAEU266823558",
    carrierName: "Maersk",
    heading: 30,
    lat: 25.8,
    lng: -80.2,
    speedKnots: 12.3,
    status: "underway",
    origin: "Busan",
    destination: "Miami",
    etaLabel: "Apr 8",
  },
  {
    id: "v8",
    name: "YM WELCOME",
    mbl: "HDMUSELM30605400",
    carrierName: "HMM",
    heading: 80,
    lat: 28.4,
    lng: -85.0,
    speedKnots: 15.6,
    status: "underway",
    origin: "Busan",
    destination: "Savannah",
    etaLabel: "Apr 10",
  },
  {
    id: "v9",
    name: "OOCL SHENZHEN",
    mbl: "OOLU2320947080",
    carrierName: "OOCL",
    heading: 0,
    lat: 22.5,
    lng: 114.1,
    speedKnots: 0,
    status: "anchored",
    origin: "Shenzhen",
    destination: "—",
    etaLabel: "—",
  },
  {
    id: "v10",
    name: "COSCO PRIDE",
    mbl: "COSU6001234567",
    carrierName: "COSCO",
    heading: 210,
    lat: 31.2,
    lng: 122.6,
    speedKnots: 11.0,
    status: "delayed",
    origin: "Shanghai",
    destination: "LA",
    etaLabel: "Apr 2",
  },
  {
    id: "v11",
    name: "ONE DAPHNE",
    mbl: "ONEY3501234",
    carrierName: "ONE",
    heading: 70,
    lat: 45.3,
    lng: -125.4,
    speedKnots: 19.1,
    status: "underway",
    origin: "Kobe",
    destination: "Seattle",
    etaLabel: "Mar 29",
  },
  {
    id: "v12",
    name: "EVER GIVEN",
    mbl: "EGLV142856001",
    carrierName: "Evergreen",
    heading: 290,
    lat: 30.5,
    lng: 32.4,
    speedKnots: 10.4,
    status: "underway",
    origin: "Jeddah",
    destination: "Rotterdam",
    etaLabel: "Apr 14",
  },
];

export const STATUS_COLORS: Record<VesselStatus, string> = {
  underway: "#10B981", // emerald
  anchored: "#F59E0B", // amber
  "at-port": "#3B82F6", // blue
  delayed: "#EF4444", // red
};
