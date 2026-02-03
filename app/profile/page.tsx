"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { mockProfiles } from "../data/mockProfiles";
import dynamic from "next/dynamic";

type ProfileData = {
  personal_id: string;
  name: string;
  shelter_id: number;
  shelter_name: string;
  mail_count: number;
  registration_date: string;
  phone?: string;
  email?: string;
};

const InteractiveMap = dynamic(() => import("../InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

export default function ProfileLookup() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null);
  const [searchResults, setSearchResults] = useState<ProfileData[]>([]);
  const mapSectionRef = useRef<HTMLDivElement>(null);

  const shelters = [
    {
      id: 1,
      name: "Shelter 1",
      address: "919 Pandora Ave, Victoria, BC",
      lat: 48.4284,
      lng: -123.3656,

    },
    {
      id: 2,
      name: "Shelter 2",
      address: "625 Queens Ave, Victoria, BC",
      lat: 48.4312,
      lng: -123.3589,

    },
    {
      id: 3,
      name: "Shelter 3",
      address: "713 Johnson St, Victoria, BC",
      lat: 48.4275,
      lng: -123.3621,

    },
    {
      id: 4,
      name: "Shelter 4",
      address: "231 Regina Ave, Victoria, BC",
      lat: 48.4398,
      lng: -123.3542,

    },
    {
      id: 5,
      name: "Shelter 5",
      address: "3318 Oak St, Victoria, BC",
      lat: 48.4521,
      lng: -123.3298,

    }
  ];

  const handleSearch = (value: string) => {
    setSearchQuery(value);

    if (!value.trim()) {
      setSearchResults([]);
      setSelectedProfile(null);
      return;
    }

    const filtered = mockProfiles.filter(
      (profile) =>
        profile.name.toLowerCase().includes(value.toLowerCase()) ||
        profile.personal_id.toLowerCase().includes(value.toLowerCase())
    );

    setSearchResults(filtered);

    if (filtered.length === 1) {
      setSelectedProfile(filtered[0]);
    } else if (!filtered.some(p => p.personal_id === selectedProfile?.personal_id)) {
      setSelectedProfile(null);
    }
  };

  const handleSelectProfile = (profile: ProfileData) => {
    setSelectedProfile(profile);

    setTimeout(() => {
      mapSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }, 300);
  };

  useEffect(() => {
    if (selectedProfile && mapSectionRef.current) {
      setTimeout(() => {
        mapSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }, 300);
    }
  }, [selectedProfile]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="w-full border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="text-lg font-semibold tracking-tight">
            BC Homeless ID Portal
          </div>

          <div className="hidden gap-6 text-sm md:flex">
            <Link href="/" className="text-gray-700 hover:text-black">Home</Link>
            <Link href="/display" className="text-gray-700 hover:text-black">Display</Link>
            <Link href="/profile" className="text-gray-700 hover:text-black">Profile Lookup</Link>
            <Link href="/registration" className="text-gray-700 hover:text-black">Registration</Link>
            <Link href="/login" className="text-gray-700 hover:text-black">Login</Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Search */}
          <div className="lg:col-span-1">
            <h1 className="text-2xl font-semibold mb-2">Profile Lookup</h1>
            <p className="text-gray-600 text-sm mb-6">Search for an individual</p>

            <form onSubmit={(e) => e.preventDefault()} className="mb-6">
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
                />
              </div>
            </form>

            {searchResults.length > 0 && (
              <div className="mb-4">
                <h2 className="text-sm font-semibold mb-3 text-gray-700">Results ({searchResults.length})</h2>
                <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
                  {searchResults.map((profile) => (
                    <div
                      key={profile.personal_id}
                      onClick={() => handleSelectProfile(profile)}
                      className={`border rounded-md p-3 cursor-pointer transition-all ${selectedProfile?.personal_id === profile.personal_id
                          ? "border-black bg-gray-100 shadow-md"
                          : "border-gray-200 bg-white hover:shadow-md"
                        }`}
                    >
                      <h3 className="font-semibold text-sm mb-1">{profile.name}</h3>
                      <p className="text-xs text-gray-600 mb-1">{profile.personal_id}</p>
                      <p className="text-xs text-gray-700">{profile.shelter_name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchQuery && searchResults.length === 0 && (
              <div className="text-center py-8 text-sm text-gray-500">
                No profiles found
              </div>
            )}
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-2">
            <div className="sticky top-6">
              <div ref={mapSectionRef} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-lg">
                <div className="p-4 bg-gray-50 border-b">
                  <h2 className="text-lg font-semibold">
                    {selectedProfile
                      ? `Mail Location: ${selectedProfile.shelter_name}`
                      : "Victoria BC Homeless Shelters"}
                  </h2>
                  {selectedProfile && (
                    <p className="text-xs text-gray-600 mt-1">
                      Showing where {selectedProfile.name}&apos;s mail is stored
                    </p>
                  )}
                </div>
                <InteractiveMap
                  shelters={shelters}
                  highlightedShelterId={selectedProfile?.shelter_id}
                />
              </div>
            </div>
          </div>
        </div>

        {selectedProfile && (
          <div className="mt-8 border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Profile Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Full Name</p>
                <p className="font-medium">{selectedProfile.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Personal ID</p>
                <p className="font-medium">{selectedProfile.personal_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Mail Location</p>
                <p className="font-medium text-blue-600">{selectedProfile.shelter_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Pending Mail</p>
                <p className="font-medium">{selectedProfile.mail_count} package(s)</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Registration Date</p>
                <p className="font-medium">{new Date(selectedProfile.registration_date).toLocaleDateString()}</p>
              </div>
              {selectedProfile.phone && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="font-medium">{selectedProfile.phone}</p>
                </div>
              )}
              {selectedProfile.email && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-medium">{selectedProfile.email}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t bg-white py-6 text-center text-xs text-gray-500 mt-12">
        © 2026 Random Company! · Built for Inspire Hackathon 2026
      </footer>
    </div>
  );
}