import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

const users = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    email: 'admin@demo.com',
    fullName: 'Alex Thompson',
    role: 'ADMIN' as const,
    avatarUrl: null,
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    email: 'lo@demo.com',
    fullName: 'Jordan Davis',
    role: 'LOAN_OFFICER' as const,
    avatarUrl: null,
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    email: 'lo2@demo.com',
    fullName: 'Morgan Lee',
    role: 'LOAN_OFFICER' as const,
    avatarUrl: null,
  },
]

const loanOfficerIds = [users[1].id, users[2].id]

// ---------------------------------------------------------------------------
// Loan seed data (28 loans)
// ---------------------------------------------------------------------------

interface LoanSeed {
  borrowerFirstName: string
  borrowerLastName: string
  borrowerEmail: string
  borrowerPhone: string
  loanAmount: number
  loanType: 'CONVENTIONAL' | 'FHA' | 'VA' | 'JUMBO' | 'USDA'
  loanTerm: 'FIFTEEN_YEAR' | 'THIRTY_YEAR'
  propertyAddress: string
  propertyCity: string
  propertyState: string
  propertyZip: string
  stage: 'LEAD' | 'APPLICATION' | 'PROCESSING' | 'UNDERWRITING' | 'APPROVED' | 'CLOSED'
  daysInStage: number
  notes?: string
}

const loans: LoanSeed[] = [
  // ---- LEAD (5) ----
  {
    borrowerFirstName: 'Maria',
    borrowerLastName: 'Santos',
    borrowerEmail: 'maria.santos@email.com',
    borrowerPhone: '555-0101',
    loanAmount: 425000,
    loanType: 'CONVENTIONAL',
    loanTerm: 'THIRTY_YEAR',
    propertyAddress: '1234 Oak Street',
    propertyCity: 'Austin',
    propertyState: 'TX',
    propertyZip: '78701',
    stage: 'LEAD',
    daysInStage: 2,
  },
  {
    borrowerFirstName: 'James',
    borrowerLastName: 'Wilson',
    borrowerEmail: 'james.wilson@email.com',
    borrowerPhone: '555-0102',
    loanAmount: 310000,
    loanType: 'FHA',
    loanTerm: 'THIRTY_YEAR',
    propertyAddress: '567 Maple Ave',
    propertyCity: 'Denver',
    propertyState: 'CO',
    propertyZip: '80202',
    stage: 'LEAD',
    daysInStage: 1,
  },
  {
    borrowerFirstName: 'Priya',
    borrowerLastName: 'Patel',
    borrowerEmail: 'priya.patel@email.com',
    borrowerPhone: '555-0103',
    loanAmount: 520000,
    loanType: 'CONVENTIONAL',
    loanTerm: 'THIRTY_YEAR',
    propertyAddress: '890 Birch Lane',
    propertyCity: 'Raleigh',
    propertyState: 'NC',
    propertyZip: '27601',
    stage: 'LEAD',
    daysInStage: 7,
    notes: 'Referred by existing client. Very interested in quick pre-approval.',
  },
  {
    borrowerFirstName: 'DeShawn',
    borrowerLastName: 'Brooks',
    borrowerEmail: 'deshawn.brooks@email.com',
    borrowerPhone: '555-0104',
    loanAmount: 275000,
    loanType: 'VA',
    loanTerm: 'THIRTY_YEAR',
    propertyAddress: '345 Pine Court',
    propertyCity: 'San Antonio',
    propertyState: 'TX',
    propertyZip: '78205',
    stage: 'LEAD',
    daysInStage: 12,
    notes: 'Veteran, eligible for VA loan. Follow up ASAP.',
  },
  {
    borrowerFirstName: 'Yuki',
    borrowerLastName: 'Tanaka',
    borrowerEmail: 'yuki.tanaka@email.com',
    borrowerPhone: '555-0105',
    loanAmount: 385000,
    loanType: 'CONVENTIONAL',
    loanTerm: 'FIFTEEN_YEAR',
    propertyAddress: '678 Cedar Drive',
    propertyCity: 'Portland',
    propertyState: 'OR',
    propertyZip: '97201',
    stage: 'LEAD',
    daysInStage: 4,
  },

  // ---- APPLICATION (6) ----
  {
    borrowerFirstName: 'Carlos',
    borrowerLastName: 'Mendez',
    borrowerEmail: 'carlos.mendez@email.com',
    borrowerPhone: '555-0201',
    loanAmount: 450000,
    loanType: 'CONVENTIONAL',
    loanTerm: 'THIRTY_YEAR',
    propertyAddress: '1100 Elm Street',
    propertyCity: 'Charlotte',
    propertyState: 'NC',
    propertyZip: '28202',
    stage: 'APPLICATION',
    daysInStage: 3,
  },
  {
    borrowerFirstName: 'Sarah',
    borrowerLastName: 'O\'Brien',
    borrowerEmail: 'sarah.obrien@email.com',
    borrowerPhone: '555-0202',
    loanAmount: 290000,
    loanType: 'FHA',
    loanTerm: 'THIRTY_YEAR',
    propertyAddress: '2200 Willow Way',
    propertyCity: 'Nashville',
    propertyState: 'TN',
    propertyZip: '37201',
    stage: 'APPLICATION',
    daysInStage: 1,
    notes: 'First-time homebuyer. Needs assistance with documentation.',
  },
  {
    borrowerFirstName: 'Amir',
    borrowerLastName: 'Hassan',
    borrowerEmail: 'amir.hassan@email.com',
    borrowerPhone: '555-0203',
    loanAmount: 615000,
    loanType: 'JUMBO',
    loanTerm: 'THIRTY_YEAR',
    propertyAddress: '450 Magnolia Blvd',
    propertyCity: 'Scottsdale',
    propertyState: 'AZ',
    propertyZip: '85251',
    stage: 'APPLICATION',
    daysInStage: 6,
  },
  {
    borrowerFirstName: 'Linda',
    borrowerLastName: 'Nguyen',
    borrowerEmail: 'linda.nguyen@email.com',
    borrowerPhone: '555-0204',
    loanAmount: 340000,
    loanType: 'CONVENTIONAL',
    loanTerm: 'THIRTY_YEAR',
    propertyAddress: '789 Spruce Ave',
    propertyCity: 'Minneapolis',
    propertyState: 'MN',
    propertyZip: '55401',
    stage: 'APPLICATION',
    daysInStage: 9,
    notes: 'Waiting on W-2 from employer.',
  },
  {
    borrowerFirstName: 'Robert',
    borrowerLastName: 'Kim',
    borrowerEmail: 'robert.kim@email.com',
    borrowerPhone: '555-0205',
    loanAmount: 475000,
    loanType: 'CONVENTIONAL',
    loanTerm: 'FIFTEEN_YEAR',
    propertyAddress: '321 Hickory Lane',
    propertyCity: 'Seattle',
    propertyState: 'WA',
    propertyZip: '98101',
    stage: 'APPLICATION',
    daysInStage: 14,
  },
  {
    borrowerFirstName: 'Fatima',
    borrowerLastName: 'Al-Rashid',
    borrowerEmail: 'fatima.alrashid@email.com',
    borrowerPhone: '555-0206',
    loanAmount: 225000,
    loanType: 'USDA',
    loanTerm: 'THIRTY_YEAR',
    propertyAddress: '5500 Country Road 12',
    propertyCity: 'Bentonville',
    propertyState: 'AR',
    propertyZip: '72712',
    stage: 'APPLICATION',
    daysInStage: 2,
  },

  // ---- PROCESSING (5) ----
  {
    borrowerFirstName: 'Michael',
    borrowerLastName: 'Johnson',
    borrowerEmail: 'michael.johnson@email.com',
    borrowerPhone: '555-0301',
    loanAmount: 380000,
    loanType: 'CONVENTIONAL',
    loanTerm: 'THIRTY_YEAR',
    propertyAddress: '900 Aspen Way',
    propertyCity: 'Tampa',
    propertyState: 'FL',
    propertyZip: '33602',
    stage: 'PROCESSING',
    daysInStage: 3,
  },
  {
    borrowerFirstName: 'Elena',
    borrowerLastName: 'Volkov',
    borrowerEmail: 'elena.volkov@email.com',
    borrowerPhone: '555-0302',
    loanAmount: 550000,
    loanType: 'CONVENTIONAL',
    loanTerm: 'THIRTY_YEAR',
    propertyAddress: '1450 Redwood Circle',
    propertyCity: 'San Jose',
    propertyState: 'CA',
    propertyZip: '95112',
    stage: 'PROCESSING',
    daysInStage: 8,
    notes: 'Appraisal scheduled for next week.',
  },
  {
    borrowerFirstName: 'Tyrone',
    borrowerLastName: 'Washington',
    borrowerEmail: 'tyrone.washington@email.com',
    borrowerPhone: '555-0303',
    loanAmount: 315000,
    loanType: 'FHA',
    loanTerm: 'THIRTY_YEAR',
    propertyAddress: '2678 Chestnut Street',
    propertyCity: 'Atlanta',
    propertyState: 'GA',
    propertyZip: '30301',
    stage: 'PROCESSING',
    daysInStage: 5,
  },
  {
    borrowerFirstName: 'Jennifer',
    borrowerLastName: 'Garcia',
    borrowerEmail: 'jennifer.garcia@email.com',
    borrowerPhone: '555-0304',
    loanAmount: 720000,
    loanType: 'JUMBO',
    loanTerm: 'THIRTY_YEAR',
    propertyAddress: '88 Palm Beach Drive',
    propertyCity: 'Miami',
    propertyState: 'FL',
    propertyZip: '33101',
    stage: 'PROCESSING',
    daysInStage: 15,
    notes: 'Title search revealed an old lien. Working with title company to resolve.',
  },
  {
    borrowerFirstName: 'David',
    borrowerLastName: 'Chen',
    borrowerEmail: 'david.chen@email.com',
    borrowerPhone: '555-0305',
    loanAmount: 410000,
    loanType: 'CONVENTIONAL',
    loanTerm: 'FIFTEEN_YEAR',
    propertyAddress: '3300 Summit Ave',
    propertyCity: 'Boston',
    propertyState: 'MA',
    propertyZip: '02101',
    stage: 'PROCESSING',
    daysInStage: 2,
  },

  // ---- UNDERWRITING (4) ----
  {
    borrowerFirstName: 'Angela',
    borrowerLastName: 'Robinson',
    borrowerEmail: 'angela.robinson@email.com',
    borrowerPhone: '555-0401',
    loanAmount: 365000,
    loanType: 'CONVENTIONAL',
    loanTerm: 'THIRTY_YEAR',
    propertyAddress: '4100 Dogwood Lane',
    propertyCity: 'Phoenix',
    propertyState: 'AZ',
    propertyZip: '85001',
    stage: 'UNDERWRITING',
    daysInStage: 2,
  },
  {
    borrowerFirstName: 'Wei',
    borrowerLastName: 'Zhang',
    borrowerEmail: 'wei.zhang@email.com',
    borrowerPhone: '555-0402',
    loanAmount: 580000,
    loanType: 'CONVENTIONAL',
    loanTerm: 'THIRTY_YEAR',
    propertyAddress: '7700 Lakeview Terrace',
    propertyCity: 'Chicago',
    propertyState: 'IL',
    propertyZip: '60601',
    stage: 'UNDERWRITING',
    daysInStage: 6,
    notes: 'Underwriter requested additional bank statements.',
  },
  {
    borrowerFirstName: 'Marcus',
    borrowerLastName: 'Thompson',
    borrowerEmail: 'marcus.thompson@email.com',
    borrowerPhone: '555-0403',
    loanAmount: 290000,
    loanType: 'VA',
    loanTerm: 'THIRTY_YEAR',
    propertyAddress: '555 Veterans Blvd',
    propertyCity: 'Virginia Beach',
    propertyState: 'VA',
    propertyZip: '23451',
    stage: 'UNDERWRITING',
    daysInStage: 12,
  },
  {
    borrowerFirstName: 'Sofia',
    borrowerLastName: 'Reyes',
    borrowerEmail: 'sofia.reyes@email.com',
    borrowerPhone: '555-0404',
    loanAmount: 440000,
    loanType: 'CONVENTIONAL',
    loanTerm: 'THIRTY_YEAR',
    propertyAddress: '1920 Sunset Blvd',
    propertyCity: 'Los Angeles',
    propertyState: 'CA',
    propertyZip: '90028',
    stage: 'UNDERWRITING',
    daysInStage: 4,
  },

  // ---- APPROVED (4) ----
  {
    borrowerFirstName: 'Rachel',
    borrowerLastName: 'Cohen',
    borrowerEmail: 'rachel.cohen@email.com',
    borrowerPhone: '555-0501',
    loanAmount: 510000,
    loanType: 'CONVENTIONAL',
    loanTerm: 'THIRTY_YEAR',
    propertyAddress: '600 Harbor View Road',
    propertyCity: 'San Diego',
    propertyState: 'CA',
    propertyZip: '92101',
    stage: 'APPROVED',
    daysInStage: 3,
  },
  {
    borrowerFirstName: 'Kwame',
    borrowerLastName: 'Asante',
    borrowerEmail: 'kwame.asante@email.com',
    borrowerPhone: '555-0502',
    loanAmount: 345000,
    loanType: 'FHA',
    loanTerm: 'THIRTY_YEAR',
    propertyAddress: '234 Peachtree Street',
    propertyCity: 'Atlanta',
    propertyState: 'GA',
    propertyZip: '30303',
    stage: 'APPROVED',
    daysInStage: 1,
    notes: 'Closing date set. Buyer is very excited!',
  },
  {
    borrowerFirstName: 'Hannah',
    borrowerLastName: 'Mueller',
    borrowerEmail: 'hannah.mueller@email.com',
    borrowerPhone: '555-0503',
    loanAmount: 790000,
    loanType: 'JUMBO',
    loanTerm: 'THIRTY_YEAR',
    propertyAddress: '12 Beacon Hill Place',
    propertyCity: 'Boston',
    propertyState: 'MA',
    propertyZip: '02108',
    stage: 'APPROVED',
    daysInStage: 7,
  },
  {
    borrowerFirstName: 'Omar',
    borrowerLastName: 'Diallo',
    borrowerEmail: 'omar.diallo@email.com',
    borrowerPhone: '555-0504',
    loanAmount: 265000,
    loanType: 'CONVENTIONAL',
    loanTerm: 'FIFTEEN_YEAR',
    propertyAddress: '4400 River Road',
    propertyCity: 'Louisville',
    propertyState: 'KY',
    propertyZip: '40202',
    stage: 'APPROVED',
    daysInStage: 5,
  },

  // ---- CLOSED (4) ----
  {
    borrowerFirstName: 'Emily',
    borrowerLastName: 'Anderson',
    borrowerEmail: 'emily.anderson@email.com',
    borrowerPhone: '555-0601',
    loanAmount: 355000,
    loanType: 'CONVENTIONAL',
    loanTerm: 'THIRTY_YEAR',
    propertyAddress: '800 Meadow Lane',
    propertyCity: 'Columbus',
    propertyState: 'OH',
    propertyZip: '43215',
    stage: 'CLOSED',
    daysInStage: 1,
  },
  {
    borrowerFirstName: 'Hiroshi',
    borrowerLastName: 'Yamamoto',
    borrowerEmail: 'hiroshi.yamamoto@email.com',
    borrowerPhone: '555-0602',
    loanAmount: 480000,
    loanType: 'CONVENTIONAL',
    loanTerm: 'THIRTY_YEAR',
    propertyAddress: '1500 Cherry Blossom Way',
    propertyCity: 'Sacramento',
    propertyState: 'CA',
    propertyZip: '95814',
    stage: 'CLOSED',
    daysInStage: 5,
  },
  {
    borrowerFirstName: 'Aaliyah',
    borrowerLastName: 'Jackson',
    borrowerEmail: 'aaliyah.jackson@email.com',
    borrowerPhone: '555-0603',
    loanAmount: 210000,
    loanType: 'USDA',
    loanTerm: 'THIRTY_YEAR',
    propertyAddress: '7890 Farm Road 44',
    propertyCity: 'Tulsa',
    propertyState: 'OK',
    propertyZip: '74103',
    stage: 'CLOSED',
    daysInStage: 10,
  },
  {
    borrowerFirstName: 'Patrick',
    borrowerLastName: 'O\'Connor',
    borrowerEmail: 'patrick.oconnor@email.com',
    borrowerPhone: '555-0604',
    loanAmount: 625000,
    loanType: 'JUMBO',
    loanTerm: 'THIRTY_YEAR',
    propertyAddress: '250 Lakeshore Drive',
    propertyCity: 'Chicago',
    propertyState: 'IL',
    propertyZip: '60611',
    stage: 'CLOSED',
    daysInStage: 18,
  },
]

// ---------------------------------------------------------------------------
// Stage progression order (for generating activity records)
// ---------------------------------------------------------------------------

const STAGE_ORDER: Array<
  'LEAD' | 'APPLICATION' | 'PROCESSING' | 'UNDERWRITING' | 'APPROVED' | 'CLOSED'
> = ['LEAD', 'APPLICATION', 'PROCESSING', 'UNDERWRITING', 'APPROVED', 'CLOSED']

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function main() {
  console.log('Seeding database...')

  // 1. Upsert users
  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      create: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    })
  }
  console.log(`  Created/updated ${users.length} users`)

  // 2. Create loans and activities
  let loanCount = 0
  let activityCount = 0

  for (const loanData of loans) {
    const loanOfficerId = randomItem(loanOfficerIds)
    const stageIndex = STAGE_ORDER.indexOf(loanData.stage)

    // Calculate dates:
    //  - createdAt: far enough back to allow stage progression
    //  - stageEnteredAt: daysInStage ago from now
    const totalDaysFromCreation = (stageIndex + 1) * 5 + loanData.daysInStage
    const createdAt = daysAgo(totalDaysFromCreation)
    const stageEnteredAt = daysAgo(loanData.daysInStage)

    const loan = await prisma.loan.upsert({
      where: {
        // Use a deterministic ID based on borrower email so re-runs are idempotent
        id: deterministicUuid(loanData.borrowerEmail),
      },
      update: {
        borrowerFirstName: loanData.borrowerFirstName,
        borrowerLastName: loanData.borrowerLastName,
        borrowerEmail: loanData.borrowerEmail,
        borrowerPhone: loanData.borrowerPhone,
        loanAmount: loanData.loanAmount,
        loanType: loanData.loanType,
        loanTerm: loanData.loanTerm,
        propertyAddress: loanData.propertyAddress,
        propertyCity: loanData.propertyCity,
        propertyState: loanData.propertyState,
        propertyZip: loanData.propertyZip,
        stage: loanData.stage,
        stageEnteredAt,
        loanOfficerId,
        notes: loanData.notes ?? null,
      },
      create: {
        id: deterministicUuid(loanData.borrowerEmail),
        borrowerFirstName: loanData.borrowerFirstName,
        borrowerLastName: loanData.borrowerLastName,
        borrowerEmail: loanData.borrowerEmail,
        borrowerPhone: loanData.borrowerPhone,
        loanAmount: loanData.loanAmount,
        loanType: loanData.loanType,
        loanTerm: loanData.loanTerm,
        propertyAddress: loanData.propertyAddress,
        propertyCity: loanData.propertyCity,
        propertyState: loanData.propertyState,
        propertyZip: loanData.propertyZip,
        stage: loanData.stage,
        stageEnteredAt,
        loanOfficerId,
        notes: loanData.notes ?? null,
        createdAt,
      },
    })
    loanCount++

    // ---- Activities ----

    // Delete existing activities for this loan (idempotent re-run)
    await prisma.loanActivity.deleteMany({ where: { loanId: loan.id } })

    // LOAN_CREATED activity
    await prisma.loanActivity.create({
      data: {
        loanId: loan.id,
        userId: loanOfficerId,
        action: 'LOAN_CREATED',
        description: `Loan created for ${loanData.borrowerFirstName} ${loanData.borrowerLastName}`,
        createdAt,
      },
    })
    activityCount++

    // STAGE_CHANGE activities for each stage transition up to current stage
    for (let i = 0; i < stageIndex; i++) {
      const fromStage = STAGE_ORDER[i]
      const toStage = STAGE_ORDER[i + 1]
      // Space transitions evenly between creation and stageEnteredAt
      const transitionDate = new Date(
        createdAt.getTime() +
          ((stageEnteredAt.getTime() - createdAt.getTime()) / stageIndex) * (i + 1)
      )

      await prisma.loanActivity.create({
        data: {
          loanId: loan.id,
          userId: loanOfficerId,
          action: 'STAGE_CHANGE',
          fromStage,
          toStage,
          description: `Moved from ${fromStage} to ${toStage}`,
          createdAt: transitionDate,
        },
      })
      activityCount++
    }

    // NOTE_ADDED activity for loans that have notes
    if (loanData.notes) {
      const noteDate = new Date(
        stageEnteredAt.getTime() + (Date.now() - stageEnteredAt.getTime()) / 2
      )
      await prisma.loanActivity.create({
        data: {
          loanId: loan.id,
          userId: loanOfficerId,
          action: 'NOTE_ADDED',
          description: loanData.notes,
          createdAt: noteDate,
        },
      })
      activityCount++
    }
  }

  console.log(`  Created/updated ${loanCount} loans`)
  console.log(`  Created ${activityCount} activity records`)

  // 3. Enable Supabase Realtime publication for relevant tables
  const tables = ['Loan', 'LoanActivity', 'User']
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime' AND tablename = '${table}'
          ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE "${table}";
          END IF;
        END $$;
      `)
      console.log(`  Enabled realtime for ${table}`)
    } catch (e) {
      // Publication may not exist in non-Supabase environments
      console.log(`  Skipped realtime for ${table} (publication may not exist)`)
    }
  }

  console.log('Seeding complete!')
}

// ---------------------------------------------------------------------------
// Deterministic UUID generator (from a string key)
// Produces a valid v4-shaped UUID deterministically so re-runs are idempotent.
// ---------------------------------------------------------------------------

function deterministicUuid(key: string): string {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  // Use the hash to build a deterministic but valid-looking UUID
  const hex = Math.abs(hash).toString(16).padStart(8, '0')
  const hex2 = Math.abs(hash * 31).toString(16).padStart(8, '0')
  const hex3 = Math.abs(hash * 97).toString(16).padStart(8, '0')
  const hex4 = Math.abs(hash * 127).toString(16).padStart(8, '0')
  return `${hex.slice(0, 8)}-${hex2.slice(0, 4)}-4${hex3.slice(0, 3)}-a${hex4.slice(0, 3)}-${(hex + hex2 + hex3).slice(0, 12)}`
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
