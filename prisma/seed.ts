import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // 1. Seed Random Words for Username Generation
  console.log('📝 Seeding random words...')
  const randomWords = [
    "Storoberry", " Buluberry",  "Afagatto",  " Avacado",  "Baenana", " Gatto",  "MoklesKhan"
  ]

  for (const word of randomWords) {
    await prisma.randomWord.upsert({
      where: { word },
      update: {},
      create: { word }
    })
  }
  console.log(`✅ Added ${randomWords.length} random words`)

  // 2. Seed Moods
  console.log('😊 Seeding moods...')
  const moods = [
    { name: 'happy', color: '#FFD700' },
    { name: 'sad', color: '#4682B4' },
    { name: 'energetic', color: '#FF6347' },
    { name: 'calm', color: '#98FB98' },
    { name: 'romantic', color: '#FF69B4' },
    { name: 'nostalgic', color: '#DDA0DD' }
  ]

  for (const mood of moods) {
    await prisma.mood.upsert({
      where: { name: mood.name },
      update: { color: mood.color },
      create: mood
    })
  }
  console.log(`✅ Added ${moods.length} moods`)

  // 3. Seed Avatars
  console.log('🎭 Seeding avatars...')
  const avatars = [
    {
      name: 'Avagato',
      imagePath: '/images/avatars/Avagato.jpg',
      pointsCost: 5
    },
    {
      name: 'Baenana',
      imagePath: '/images/avatars/Baenana.jpg',
      pointsCost: 8
    },
    {
      name: 'Buluberry',
      imagePath: '/images/avatars/Buluberry.jpg',
      pointsCost: 10
    },
    {
      name: 'Peeckaboo',
      imagePath: '/images/avatars/Peeckaboo.jpg',
      pointsCost: 12
    },
    {
      name: 'Storoberry',
      imagePath: '/images/avatars/Storoberry.jpg',
      pointsCost: 12
    }
  ]

  for (const avatar of avatars) {
    await prisma.avatar.upsert({
      where: { name: avatar.name },
      update: {
        imagePath: avatar.imagePath,
        pointsCost: avatar.pointsCost
      },
      create: avatar
    })
  }
  console.log(`✅ Added ${avatars.length} avatars`)

  // 4. Seed Filtered Words (for chat moderation)
  console.log('🚫 Seeding filtered words...')
  const filteredWords = [
    'spam', 'abuse', 'harassment', 'inappropriate', 'offensive'
    // Add more as needed
  ]

  for (const word of filteredWords) {
    await prisma.filteredWord.upsert({
      where: { word },
      update: {},
      create: { word }
    })
  }
  console.log(`✅ Added ${filteredWords.length} filtered words`)

  // 5. Create Admin User with Password
console.log('👑 Creating admin user...')
const bcrypt = require('bcryptjs')
const adminEmail = 'admin@moodly.com'
const adminPassword = '111111' 

const existingAdmin = await prisma.user.findUnique({
  where: { email: adminEmail }
})

if (!existingAdmin) {
  const hashedPassword = await bcrypt.hash(adminPassword, 12)
  await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword, // Add hashed password
      anonymousName: 'AdminUser',
      isAdmin: true,
      points: 1000,
      mood: 'happy',
      note: 'System Administrator'
    }
  })
  console.log('✅ Created admin user with credentials')
} else {
  console.log('⚠️ Admin user already exists')
}

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })