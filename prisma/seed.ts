// scripts/seed-avatars.ts or add this to your existing seed file

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedAvatars() {
  console.log('Seeding avatars...')

  // Sample avatars data
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

  // Create avatars (upsert to avoid duplicates)
  for (const avatar of avatars) {
    await prisma.avatar.upsert({
      where: { name: avatar.name },
      update: {
        imagePath: avatar.imagePath,
        pointsCost: avatar.pointsCost
      },
      create: {
        name: avatar.name,
        imagePath: avatar.imagePath,
        pointsCost: avatar.pointsCost
      }
    })
    console.log(`✅ Created/Updated avatar: ${avatar.name}`)
  }

  console.log('Avatar seeding completed!')
}

// Run the function if this file is executed directly
if (require.main === module) {
  seedAvatars()
    .catch((e) => {
      console.error('Error seeding avatars:', e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

export { seedAvatars }