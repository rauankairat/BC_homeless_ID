export interface Package {
  package_id: string;
  personal_id: string;
  recipient_name: string;
  status: "Arrived" | "In Transit" | "Pending";
  arrival_date?: string;
  sender?: string;
}

export const mockPackages: Package[] = [
  {
    package_id: "PKG-001",
    personal_id: "BC-2024-001",
    recipient_name: "Rauan Kairat",
    status: "Arrived",
    arrival_date: "2026-01-28",
    sender: "Service Canada"
  },
  {
    package_id: "PKG-002",
    personal_id: "BC-2024-002",
    recipient_name: "Max Saltykov",
    status: "Arrived",
    arrival_date: "2026-01-29",
    sender: "ICBC"
  },
  {
    package_id: "PKG-003",
    personal_id: "BC-2024-003",
    recipient_name: "Nawfal Lodhi",
    status: "In Transit",
    sender: "Canada Post"
  },
  {
    package_id: "PKG-004",
    personal_id: "BC-2024-001",
    recipient_name: "Abdullah bin Azeem",
    status: "Arrived",
    arrival_date: "2026-01-30",
    sender: "CRA"
  },
  {
    package_id: "PKG-005",
    personal_id: "BC-2024-004",
    recipient_name: "Arya Punjabi",
    status: "Arrived",
    arrival_date: "2026-01-27",
    sender: "BC Housing"
  },
  {
    package_id: "PKG-006",
    personal_id: "BC-2024-005",
    recipient_name: "Ilon Musk",
    status: "Pending",
    sender: "Legal Aid BC"
  },
  {
    package_id: "PKG-007",
    personal_id: "BC-2024-006",
    recipient_name: "Bob Marley",
    status: "Arrived",
    arrival_date: "2026-01-31",
    sender: "WorkBC"
  },
  {
    package_id: "PKG-008",
    personal_id: "BC-2024-008",
    recipient_name: "Jeff Bezos",
    status: "Arrived",
    arrival_date: "2026-01-26",
    sender: "Ministry of Social Development"
  }
];