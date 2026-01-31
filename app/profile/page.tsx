"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

type DbShelter = {
  shelter_id: string;
  address: string;
  email: string | null;
  phone: string | null;
  status: string;
  latitude: number | null;
  longitude: number | null;
  updated_at: string;
};

type MapShelter = {
  id: number; // numeric for YOUR map component
  name: string;
  address: string;
  lat: number;
  lng: number;
  // keep uuid so we can map results -> marker id
  shelter_uuid: string;
};

type DbPersonResult = {
  personal_id: string;
  full_name: string;

  first_name: string;
  middle_name: string | null;
  last_name: string;

  DOB: string | null;
  status: string | null;

  shelter_id: string; // UUID

  location_contact_id: string | null;
  biometrics_id: string | null;
  consent_id: string | null;

  updated_at: string; // from API: updated_at: p.update_date
};

type ProfileData = {
  personal_id: string;
  name: string;

  shelter_id: number;
  shelter_uuid: string;
  shelter_name: string;

  updated_at: string;

  DOB?: string | null;
  status?: string | null;
  location_contact_id?: string | null;
  biometrics_id?: string | null;
  consent_id?: string | null;

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
  const [loading, setLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState<number | null>(null);


  const mapSectionRef = useRef<HTMLDivElement>(null);

  // --- 1) Fetch shelters from DB (and adapt to what the map expects)
  const [dbShelters, setDbShelters] = useState<DbShelter[]>([]);
  const [sheltersLoading, setSheltersLoading] = useState(true);

  useEffect(() => {
  if (!selectedProfile) {
    setPendingCount(null);
    return;
  }

  (async () => {
    try {
      const res = await fetch(
        `/api/packages/pending-count?personal_id=${selectedProfile.personal_id}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setPendingCount(data.pending_count ?? 0);
    } catch {
      setPendingCount(0);
    }
  })();
}, [selectedProfile]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setSheltersLoading(true);
      try {
        const res = await fetch("/api/shelters?status=open", { cache: "no-store" });
        const data = (await res.json()) as DbShelter[];
        if (!cancelled) setDbShelters(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setDbShelters([]);
      } finally {
        if (!cancelled) setSheltersLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Build:
  // - shelters array for the map (numeric ids)
  // - uuid -> numeric id map
  // - uuid -> display name/address
  const { sheltersForMap, uuidToNumericId, uuidToLabel } = useMemo(() => {
    const sheltersForMap: MapShelter[] = [];
    const uuidToNumericId = new Map<string, number>();
    const uuidToLabel = new Map<string, string>();

    let n = 1;
    for (const s of dbShelters) {
      if (s.latitude == null || s.longitude == null) continue; // skip if no coords
      const id = n++;

      uuidToNumericId.set(s.shelter_id, id);
      uuidToLabel.set(s.shelter_id, s.address || `Shelter ${s.shelter_id.slice(0, 8)}`);

      sheltersForMap.push({
        id,
        name: `Shelter ${id}`, // your map expects a name
        address: s.address,
        lat: s.latitude,
        lng: s.longitude,
        shelter_uuid: s.shelter_id,
      });
    }

    return { sheltersForMap, uuidToNumericId, uuidToLabel };
  }, [dbShelters]);

  // --- 2) Search people from DB using /api/personal/search
  useEffect(() => {
    let cancelled = false;
    const q = searchQuery.trim();

    if (!q) {
      setSearchResults([]);
      setSelectedProfile(null);
      return;
    }

    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/personal/search?q=${encodeURIComponent(q)}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as DbPersonResult[];
        const arr = Array.isArray(data) ? data : [];

        // Map DB results into your existing UI shape + convert shelter uuid -> numeric id
        const mapped: ProfileData[] = arr.map((p) => {
          const numeric = uuidToNumericId.get(p.shelter_id);

          const fullName =
            p.full_name ??
            [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(" ");

          return {
            personal_id: p.personal_id,
            name: fullName || "",

            shelter_uuid: p.shelter_id,
            shelter_id: numeric ?? -1,
            shelter_name: uuidToLabel.get(p.shelter_id) ?? `Shelter ${p.shelter_id.slice(0, 8)}`,

            updated_at: p.updated_at ?? "",

            // ✅ bring through more personal info (already in API response)
            DOB: p.DOB ?? null,
            status: p.status ?? null,
            location_contact_id: p.location_contact_id ?? null,
            biometrics_id: p.biometrics_id ?? null,
            consent_id: p.consent_id ?? null,

            // these will remain "" unless you add them to the API route
            phone: (p as any).phone ?? "",
            email: (p as any).email ?? "",
          };
        });



        if (!cancelled) {
          setSearchResults(mapped);

          // Auto-select if only 1 result
          if (mapped.length === 1) {
            setSelectedProfile(mapped[0]);
          } else if (!mapped.some((x) => x.personal_id === selectedProfile?.personal_id)) {
            setSelectedProfile(null);
          }
        }
      } catch {
        if (!cancelled) {
          setSearchResults([]);
          setSelectedProfile(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // important: include uuidToNumericId/uuidToLabel so results re-map after shelters load
  }, [searchQuery, uuidToNumericId, uuidToLabel]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleSelectProfile = (profile: ProfileData) => {
    setSelectedProfile(profile);

    setTimeout(() => {
      mapSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }, 300);
  };

  useEffect(() => {
    if (selectedProfile && mapSectionRef.current) {
      setTimeout(() => {
        mapSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }, 300);
    }
  }, [selectedProfile]);

  // IMPORTANT: only highlight when we have a valid numeric id
  const highlightedShelterId =
    selectedProfile && selectedProfile.shelter_id > 0 ? selectedProfile.shelter_id : undefined;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="w-full border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="text-lg font-semibold tracking-tight">BC Homeless ID Portal</div>

          <div className="hidden gap-6 text-sm md:flex">
            <Link href="/" className="text-gray-700 hover:text-black">
              Home
            </Link>
            <Link href="/display" className="text-gray-700 hover:text-black">
              Display
            </Link>
            <Link href="/profile" className="text-gray-700 hover:text-black">
              Profile Lookup
            </Link>
            <Link href="/registration" className="text-gray-700 hover:text-black">
              Registration
            </Link>
            <Link href="/login" className="text-gray-700 hover:text-black">
              Login
            </Link>
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
                {(loading || sheltersLoading) && (
                  <p className="text-xs text-gray-500">
                    {loading ? "Searching people…" : "Loading shelters…"}
                  </p>
                )}
              </div>
            </form>

            {searchResults.length > 0 && (
              <div className="mb-4">
                <h2 className="text-sm font-semibold mb-3 text-gray-700">
                  Results ({searchResults.length})
                </h2>
                <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
                  {searchResults.map((profile) => (
                    <div
                      key={profile.personal_id}
                      onClick={() => handleSelectProfile(profile)}
                      className={`border rounded-md p-3 cursor-pointer transition-all ${
                        selectedProfile?.personal_id === profile.personal_id
                          ? "border-black bg-gray-100 shadow-md"
                          : "border-gray-200 bg-white hover:shadow-md"
                      }`}
                    >
                      <h3 className="font-semibold text-sm mb-1">{profile.name}</h3>
                      <p className="text-xs text-gray-600 mb-1">{profile.personal_id}</p>
                      <p className="text-xs text-gray-700">{profile.shelter_name}</p>

                      {profile.shelter_id <= 0 && (
                        <p className="text-[11px] text-amber-600 mt-1">
                          Shelter not found on map (no coords or not loaded)
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchQuery && !loading && searchResults.length === 0 && (
              <div className="text-center py-8 text-sm text-gray-500">No profiles found</div>
            )}
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-2">
            <div className="sticky top-6">
              <div
                ref={mapSectionRef}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-lg"
              >
                <div className="p-4 bg-gray-50 border-b">
                  <h2 className="text-lg font-semibold">
                    {selectedProfile ? `Mail Location: ${selectedProfile.shelter_name}` : "Victoria BC Homeless Shelters"}
                  </h2>
                  {selectedProfile && (
                    <p className="text-xs text-gray-600 mt-1">
                      Showing where {selectedProfile.name}'s mail is stored
                    </p>
                  )}
                </div>

                {/* ✅ Here is the “send data to the map” part */}
                <InteractiveMap shelters={sheltersForMap} highlightedShelterId={highlightedShelterId} />
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
                <p className="font-medium">
                  {pendingCount === null ? "Loading…" : `${pendingCount} package(s)`}
                </p>
              </div>
              <div>
                <div>
                <p className="text-sm text-gray-500 mb-1">Profile info updated at</p>
                <p className="font-medium">
                  {selectedProfile.updated_at ? new Date(selectedProfile.updated_at).toLocaleString() : "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">DOB</p>
                <p className="font-medium">
                  {selectedProfile.DOB ? new Date(selectedProfile.DOB).toLocaleDateString() : "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <p className="font-medium">{selectedProfile.status || "—"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Location Contact ID</p>
                <p className="font-medium break-all">{selectedProfile.location_contact_id || "—"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Biometrics ID</p>
                <p className="font-medium break-all">{selectedProfile.biometrics_id || "—"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Consent ID</p>
                <p className="font-medium break-all">{selectedProfile.consent_id || "—"}</p>
              </div>

              </div>
            </div>

            {/* optional debug */}
            <div className="text-xs text-gray-500 mt-2">
              shelter_uuid: {selectedProfile.shelter_uuid}
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
