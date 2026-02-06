import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding categories...');

  const categories = [
    {
      name: 'Rings',
      slug: 'rings',
      description: 'Engagement rings, wedding bands, fashion rings, and more',
    },
    {
      name: 'Necklaces',
      slug: 'necklaces',
      description: 'Pendants, chains, chokers, and statement necklaces',
    },
    {
      name: 'Earrings',
      slug: 'earrings',
      description: 'Studs, hoops, drops, and chandelier earrings',
    },
    {
      name: 'Bracelets',
      slug: 'bracelets',
      description: 'Bangles, cuffs, chains, and charm bracelets',
    },
    {
      name: 'Anklets',
      slug: 'anklets',
      description: 'Ankle bracelets and foot jewelry',
    },
    {
      name: 'Brooches & Pins',
      slug: 'brooches-pins',
      description: 'Decorative pins, brooches, and lapel accessories',
    },
    {
      name: 'Watches',
      slug: 'watches',
      description: 'Luxury watches, fashion watches, and timepieces',
    },
    {
      name: 'Wedding & Engagement',
      slug: 'wedding-engagement',
      description: 'Engagement rings, wedding bands, and bridal sets',
    },
    {
      name: 'Fine Jewelry',
      slug: 'fine-jewelry',
      description: 'Premium jewelry with precious metals and gemstones',
    },
    {
      name: 'Fashion Jewelry',
      slug: 'fashion-jewelry',
      description: 'Trendy and affordable fashion accessories',
    },
    {
      name: 'Gemstones',
      slug: 'gemstones',
      description: 'Loose gemstones, diamonds, and precious stones',
    },
    {
      name: 'Body Jewelry',
      slug: 'body-jewelry',
      description: 'Nose rings, belly rings, and piercing jewelry',
    },
    {
      name: "Men's Jewelry",
      slug: 'mens-jewelry',
      description: "Cufflinks, tie bars, rings, and men's accessories",
    },
    {
      name: "Children's Jewelry",
      slug: 'childrens-jewelry',
      description: 'Safe and age-appropriate jewelry for kids',
    },
    {
      name: 'Jewelry Sets',
      slug: 'jewelry-sets',
      description: 'Matching sets of earrings, necklaces, and bracelets',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    console.log(`Created/Updated category: ${category.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
