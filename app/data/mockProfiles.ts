export interface ProfileData {
    personal_id: string;
    name: string;
    shelter_id: number;
    shelter_name: string;
    mail_count: number;
    registration_date: string;
    phone?: string;
    email?: string;
  }
  
  export const mockProfiles: ProfileData[] = [
    {
      personal_id: "BC-2024-001",
      name: "Rauan Kairat",
      shelter_id: 1,
      shelter_name: "Shelter 1",
      mail_count: 3,
      registration_date: "2024-01-15",
      phone: "250-555-0101"
    },
    {
      personal_id: "BC-2024-002",
      name: "Max Saltykov",
      shelter_id: 2,
      shelter_name: "Shelter 2",
      mail_count: 1,
      registration_date: "2024-02-20",
      email: "mary.j@email.com"
    },
    {
      personal_id: "BC-2024-003",
      name: "Nawfal Lodhi",
      shelter_id: 3,
      shelter_name: "Shelter 3",
      mail_count: 5,
      registration_date: "2024-01-10"
    },
    {
      personal_id: "BC-2024-004",
      name: "Abdullah bin Azeem",
      shelter_id: 4,
      shelter_name: "Shelter 4",
      mail_count: 2,
      registration_date: "2024-03-05",
      phone: "250-555-0104"
    },
    {
      personal_id: "BC-2024-005",
      name: "Arya Punjabi",
      shelter_id: 5,
      shelter_name: "Shelter 5",
      mail_count: 4,
      registration_date: "2024-02-01",
      email: "mbrown@email.com"
    },
    {
      personal_id: "BC-2024-006",
      name: "Ilon Musk",
      shelter_id: 1,
      shelter_name: "Shelter 1",
      mail_count: 7,
      registration_date: "2024-01-25"
    },
    {
        personal_id: "BC-2024-007",
        name: "Bob Marley",
        shelter_id: 2,
        shelter_name: "Shelter 2",
        mail_count: 4,
        registration_date: "2024-02-01",
        email: "mbrown@email.com"
      },
       {
      personal_id: "BC-2024-008",
      name: "Jeff Bezos",
      shelter_id: 5,
      shelter_name: "Shelter 5",
      mail_count: 1,
      registration_date: "2024-02-01",
      email: "mbrown@email.com"
    },
  ];