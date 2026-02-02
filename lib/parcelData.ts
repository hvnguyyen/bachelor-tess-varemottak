// Mock data for parcels/shipments
export interface Package {
  id: string;
  description: string;
  status: "delivered" | "pending" | "in_transit";
}

export interface Parcel {
  id: string;
  referenceNumber: string;
  sender: string;
  status: "in_transit" | "not_started" | "partial_delivery" | "delivered";
  location: string;
  arrivalDate: string;
  packages: Package[];
  lastUpdate: string;
}

const norwegianCities = [
  "Oslo",
  "Bergen",
  "Trondheim",
  "Stavanger",
  "Kristiansand",
  "Drammen",
  "Fredrikstad",
  "Tromsø",
  "Skien",
  "Lillehammer",
];

const norwegianMunicipalities = [
  "Sentrum",
  "Grünerløkka",
  "Østensjø",
  "Nordstrand",
  "Frogner",
  "Vesthøyen",
  "Åsane",
  "Laksevåg",
  "Byfjorden",
  "Strinda",
];

function getRandomCity(): string {
  return norwegianCities[
    Math.floor(Math.random() * norwegianCities.length)
  ];
}

function getRandomMunicipality(): string {
  return norwegianMunicipalities[
    Math.floor(Math.random() * norwegianMunicipalities.length)
  ];
}

function generatePackages(
  count: number,
  status: "in_transit" | "partial"
): Package[] {
  const packages: Package[] = [];
  for (let i = 1; i <= count; i++) {
    let packageStatus: "delivered" | "pending" | "in_transit" = "pending";
    if (status === "in_transit") {
      packageStatus = "in_transit";
    } else if (status === "partial") {
      // Random distribution for partial delivery
      const rand = Math.random();
      if (rand < 0.5) packageStatus = "delivered";
      else if (rand < 0.8) packageStatus = "pending";
      else packageStatus = "in_transit";
    }
    packages.push({
      id: `pkg-${count}-${i}`,
      description: `Pakke ${i}`,
      status: packageStatus,
    });
  }
  return packages;
}

export const mockParcels: Parcel[] = [
  {
    id: "1",
    referenceNumber: "PKG-2026-001",
    sender: "Supplier A",
    status: "in_transit",
    location: `${getRandomCity()} - ${getRandomMunicipality()}`,
    arrivalDate: "2026-02-03",
    lastUpdate: "2026-01-31 14:30",
    packages: generatePackages(1, "in_transit"),
  },
  {
    id: "2",
    referenceNumber: "PKG-2026-002",
    sender: "Supplier B",
    status: "partial_delivery",
    location: `${getRandomCity()} - ${getRandomMunicipality()}`,
    arrivalDate: "2026-02-02",
    lastUpdate: "2026-01-31 11:15",
    packages: generatePackages(15, "partial"),
  },
  {
    id: "3",
    referenceNumber: "PKG-2026-003",
    sender: "Supplier C",
    status: "not_started",
    location: `${getRandomCity()} - ${getRandomMunicipality()}`,
    arrivalDate: "2026-02-04",
    lastUpdate: "2026-01-30 09:45",
    packages: generatePackages(8, "in_transit"),
  },
  {
    id: "4",
    referenceNumber: "PKG-2026-004",
    sender: "Supplier A",
    status: "in_transit",
    location: `${getRandomCity()} - ${getRandomMunicipality()}`,
    arrivalDate: "2026-02-05",
    lastUpdate: "2026-01-31 16:20",
    packages: generatePackages(1, "in_transit"),
  },
  {
    id: "5",
    referenceNumber: "PKG-2026-005",
    sender: "Supplier D",
    status: "not_started",
    location: `${getRandomCity()} - ${getRandomMunicipality()}`,
    arrivalDate: "2026-02-06",
    lastUpdate: "2026-01-29 13:00",
    packages: generatePackages(5, "in_transit"),
  },
  {
    id: "6",
    referenceNumber: "PKG-2026-006",
    sender: "Supplier E",
    status: "partial_delivery",
    location: `${getRandomCity()} - ${getRandomMunicipality()}`,
    arrivalDate: "2026-01-28",
    lastUpdate: "2026-01-31 10:00",
    packages: generatePackages(50, "partial"),
  },
  {
    id: "7",
    referenceNumber: "PKG-2026-007",
    sender: "Supplier F",
    status: "delivered",
    location: `${getRandomCity()} - ${getRandomMunicipality()}`,
    arrivalDate: "2026-01-25",
    lastUpdate: "2026-01-30 15:45",
    packages: [
      { id: "pkg-7-1", description: "Pakke 1", status: "delivered" },
      { id: "pkg-7-2", description: "Pakke 2", status: "delivered" },
      { id: "pkg-7-3", description: "Pakke 3", status: "delivered" },
    ],
  },
  {
    id: "8",
    referenceNumber: "PKG-2026-008",
    sender: "Supplier B",
    status: "delivered",
    location: `${getRandomCity()} - ${getRandomMunicipality()}`,
    arrivalDate: "2026-01-20",
    lastUpdate: "2026-01-28 12:30",
    packages: generatePackages(25, "in_transit").map((p) => ({
      ...p,
      status: "delivered" as const,
    })),
  },
];
