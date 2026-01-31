import bcrypt from 'bcryptjs';
import prisma from '../src/utils/db.js';

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Crear un admin por defecto
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.admin.upsert({
      where: { email: 'admin@bionutrex.com' },
      update: {},
      create: {
        email: 'admin@bionutrex.com',
        name: 'Admin BioNutrex',
        password: hashedPassword
      }
    });

    console.log('✅ Admin created:', admin.email);

    // Crear algunas secciones de home por defecto
    const homeSections = [
      {
        sectionKey: 'hero',
        title: 'Ciencia Avanzada. Pureza Natural.',
        subtitle: 'Innovación en Biotecnología',
        content: 'Liderando el futuro de la biotecnología con suplementos naturales de alta potencia y estándares de fabricación de grado farmacéutico.',
        order: 1,
        active: true
      },
      {
        sectionKey: 'quality',
        title: 'Calidad Superior',
        subtitle: 'Estándares Farmacéuticos',
        content: 'Nuestros productos cumplen con los más altos estándares de calidad y pureza en la industria.',
        order: 2,
        active: true
      },
      {
        sectionKey: 'methodology',
        title: 'Metodología Científica',
        subtitle: 'Investigación y Desarrollo',
        content: 'Aplicamos métodos científicos rigurosos en el desarrollo de todos nuestros productos.',
        order: 3,
        active: true
      },
      {
        sectionKey: 'blog',
        title: 'Blog y Noticias',
        subtitle: 'Mantente Informado',
        content: 'Descubre las últimas investigaciones y novedades en biotecnología nutricional.',
        order: 4,
        active: true
      }
    ];

    for (const section of homeSections) {
      await prisma.homeSection.upsert({
        where: { sectionKey: section.sectionKey },
        update: {},
        create: section
      });
      console.log(`✅ Home section created: ${section.sectionKey}`);
    }

    // Crear un post de blog de ejemplo
    const blogPost = await prisma.blogPost.upsert({
      where: { slug: 'bienvenidos-bionutrex' },
      update: {},
      create: {
        title: 'Bienvenidos a BioNutrex',
        slug: 'bienvenidos-bionutrex',
        excerpt: 'Conoce más sobre nuestra misión y visión en el mundo de la biotecnología nutricional.',
        content: `
# Bienvenidos a BioNutrex

En BioNutrex, estamos comprometidos con la excelencia en biotecnología nutricional. Nuestro equipo de científicos e investigadores trabaja día a día para desarrollar productos que marquen la diferencia en la salud y bienestar de las personas.

## Nuestra Misión

Proporcionar suplementos naturales de la más alta calidad, respaldados por ciencia sólida y fabricados bajo estándares farmacéuticos.

## Nuestra Visión

Ser líderes mundiales en innovación biotecnológica aplicada a la nutrición, contribuyendo a un mundo más saludable.

¡Gracias por confiar en BioNutrex!
        `,
        imageUrl: '/uploads/blog-default.jpg',
        author: 'Equipo BioNutrex',
        published: true,
        publishedAt: new Date(),
        views: 0
      }
    });

    console.log('✅ Sample blog post created:', blogPost.title);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Default credentials:');
    console.log('Email: admin@bionutrex.com');
    console.log('Password: admin123');
    console.log('\n⚠️  Remember to change the default password in production!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();