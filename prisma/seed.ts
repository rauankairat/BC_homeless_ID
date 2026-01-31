import { PrismaClient, PersonalStatus, ShelterStatus, ContactPreference, PackageStatus, VerificationResult, Operator } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'test',
  user: 'worker',
  password: 'worker',
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
// Mock profile data from the email
const mockProfiles = [
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

// Helper function to generate UUIDs (in real app, use uuid library)
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper to parse name
function parseName(fullName: string) {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) {
    return { first_name: parts[0], last_name: parts[0] };
  }
  const first_name = parts[0];
  const last_name = parts.slice(1).join(' ');
  return { first_name, last_name };
}

async function main() {
  console.log('Starting seed...');

  // Clear existing data (in reverse order of dependencies)
  await prisma.package.deleteMany();
  await prisma.verificationLog.deleteMany();
  await prisma.locationContact.deleteMany();
  await prisma.personalInfo.deleteMany();
  await prisma.worker.deleteMany();
  await prisma.biometrics.deleteMany();
  await prisma.consent.deleteMany();
  await prisma.shelter.deleteMany();

  console.log('Cleared existing data');

  // Get unique shelters from mock data
  const uniqueShelters = Array.from(
    new Map(
      mockProfiles.map(p => [p.shelter_id, { id: p.shelter_id, name: p.shelter_name }])
    ).values()
  );

  // Shelter addresses for Victoria, BC only
  const shelterAddresses = [
    '123 Douglas Street, Victoria, BC V8W 2E8',
    '456 Government Street, Victoria, BC V8V 2K8',
    '789 Yates Street, Victoria, BC V8W 1L4',
    '321 Pandora Avenue, Victoria, BC V8W 1N6',
    '654 Fort Street, Victoria, BC V8W 1H2',
  ];
  const shelterCoordinates = [
  { latitude: 48.4284, longitude: -123.3656 }, // Downtown-ish
  { latitude: 48.4250, longitude: -123.3697 }, // Government St area
  { latitude: 48.4266, longitude: -123.3609 }, // Yates St area
  { latitude: 48.4289, longitude: -123.3649 }, // Pandora Ave area
  { latitude: 48.4260, longitude: -123.3525 }, // Fort St area
];
  // Create Shelters with UUIDs
  const shelterMap = new Map<number, string>(); // maps shelter_id -> shelter_uuid
  
  for (let i = 0; i < uniqueShelters.length; i++) {
    const shelterUUID = generateUUID();
    const shelter = uniqueShelters[i];

    const coords = shelterCoordinates[i];
    
    await prisma.shelter.create({
      data: {
        shelter_id: shelterUUID,
        address: shelterAddresses[i] || `${shelter.name} Address, Victoria, BC`,
        email: `${shelter.name.toLowerCase().replace(' ', '')}@shelter.bc.ca`,
        phone: `250-555-010${shelter.id}`,
        status: i === 2 ? ShelterStatus.temporarily_closed : ShelterStatus.open,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      },
    });
    
    shelterMap.set(shelter.id, shelterUUID);
  }

  console.log('Created shelters');

  // Create Workers (1-2 per shelter)
  const hashedPassword = await bcrypt.hash('password123', 10);
  const workerNames = [
    { first: 'Sarah', last: 'Johnson' },
    { first: 'Michael', last: 'Chen' },
    { first: 'Emily', last: 'Rodriguez' },
    { first: 'David', last: 'Kim' },
    { first: 'Jennifer', last: 'Thompson' },
    { first: 'Robert', last: 'Martinez' },
  ];

  const workers: string[] = [];
  let workerIndex = 0;

  for (const [shelterId, shelterUUID] of shelterMap.entries()) {
    // Create 1-2 workers per shelter
    const numWorkers = shelterId % 2 === 0 ? 2 : 1;
    
    for (let i = 0; i < numWorkers && workerIndex < workerNames.length; i++) {
      const workerUUID = generateUUID();
      const worker = workerNames[workerIndex];
      
      await prisma.worker.create({
        data: {
          worker_id: workerUUID,
          shelter_id: shelterUUID,
          first_name: worker.first,
          last_name: worker.last,
          email: `${worker.first.toLowerCase()}.${worker.last.toLowerCase()}@shelter.bc.ca`,
          phone: `250-555-02${String(workerIndex + 1).padStart(2, '0')}`,
          hashed_password: hashedPassword,
          active: true,
        },
      });
      
      workers.push(workerUUID);
      workerIndex++;
    }
  }

  console.log('Created workers');

  // Create PersonalInfo, Biometrics, Consent, and LocationContact for each profile
  for (const profile of mockProfiles) {
    const { first_name, last_name } = parseName(profile.name);
    const shelterUUID = shelterMap.get(profile.shelter_id)!;
    
    // Generate UUIDs for related entities
    const personalUUID = generateUUID();
    const biometricsUUID = generateUUID();
    const consentUUID = generateUUID();
    const locationContactUUID = personalUUID; // Same as personal_id

    // Create Biometrics (populate some fields, leave others null)
    await prisma.biometrics.create({
      data: {
        biometrics_id: biometricsUUID,
        photo_id: generateUUID(),
        // Only populate biometrics for some people
        height: profile.personal_id.endsWith('001') || profile.personal_id.endsWith('003') 
          ? 175.5 : undefined,
        weight: profile.personal_id.endsWith('002') 
          ? 70.2 : undefined,
        eye_color: profile.personal_id.endsWith('001') ? 'Brown' : undefined,
        special_features: profile.personal_id.endsWith('006') 
          ? 'Scar on left arm' : undefined,
      },
    });

    // Create Consent
    await prisma.consent.create({
      data: {
        consent_id: consentUUID,
      },
    });

    // Create PersonalInfo
    await prisma.personalInfo.create({
      data: {
        personal_id: personalUUID,
        shelter_id: shelterUUID,
        location_contact_id: locationContactUUID,
        biometrics_id: biometricsUUID,
        consent_id: consentUUID,
        first_name,
        last_name,
        // Add aliases for some people
        aliases: profile.personal_id.endsWith('006') 
          ? ['Elon', 'Iron Man'] : [],
        DOB: new Date(1990, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        responsible_worker_ids: [workers[0]], // Assign first worker
        status: PersonalStatus.active,
        creation_date: new Date(profile.registration_date),
      },
    });

    // Create LocationContact
    await prisma.locationContact.create({
      data: {
        personal_id: personalUUID,
        phone_number: profile.phone || undefined,
        email: profile.email || undefined,
        preferred: profile.phone 
          ? ContactPreference.phone 
          : profile.email 
            ? ContactPreference.email 
            : undefined,
      },
    });

    // Create VerificationLog and Packages based on mail_count
    for (let i = 0; i < profile.mail_count; i++) {
      const verificationUUID = generateUUID();
      const packageUUID = generateUUID();
      
      // Create VerificationLog
      await prisma.verificationLog.create({
        data: {
          verification_log_id: verificationUUID,
          shelter_id: shelterUUID,
          worker_id: workers[Math.floor(Math.random() * workers.length)],
          personal_id: personalUUID,
          documents_ids_provided: ['ID-' + Math.random().toString(36).substr(2, 9)],
          confidence_level: Math.floor(Math.random() * 3) + 3, // 3-5
          result: Math.random() > 0.1 ? VerificationResult.accepted : VerificationResult.rejected,
        },
      });

      // Create Package
      const operators = [
        Operator.canada_post,
        Operator.purolator,
        Operator.fedex,
        Operator.ups,
        Operator.intelcom,
      ];
      
      const statuses = [
        PackageStatus.pending,
        PackageStatus.received,
        PackageStatus.ready,
        PackageStatus.handed_out,
      ];

      const daysAgo = Math.floor(Math.random() * 30);
      const arrivalDate = new Date();
      arrivalDate.setDate(arrivalDate.getDate() - daysAgo);

      await prisma.package.create({
        data: {
          package_id: packageUUID,
          personal_id: personalUUID,
          shelter_id: shelterUUID,
          operator: operators[Math.floor(Math.random() * operators.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          verification_log_id: verificationUUID,
          arrival_date: arrivalDate,
          expected_at: i % 2 === 0 ? arrivalDate : undefined,
          handout_date: statuses[3] === PackageStatus.handed_out ? new Date() : undefined,
        },
      });
    }
  }

  console.log('Created PersonalInfo, Biometrics, Consent, LocationContact, VerificationLogs, and Packages');
  console.log('Seeding complete!');
  
  // Print summary
  const counts = {
    shelters: await prisma.shelter.count(),
    workers: await prisma.worker.count(),
    personalInfo: await prisma.personalInfo.count(),
    packages: await prisma.package.count(),
    verificationLogs: await prisma.verificationLog.count(),
  };
  
  console.log('\nDatabase Summary:');
  console.log(`   Shelters: ${counts.shelters}`);
  console.log(`   Workers: ${counts.workers}`);
  console.log(`   People: ${counts.personalInfo}`);
  console.log(`   Packages: ${counts.packages}`);
  console.log(`   Verification Logs: ${counts.verificationLogs}`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
