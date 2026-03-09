import bcrypt from "bcryptjs";
import prisma from "../src/utils/db.js";

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // Crear un admin por defecto
    const hashedPassword = await bcrypt.hash("admin123", 12);

    const admin = await prisma.admin.upsert({
      where: { email: "admin@bionutrex.com" },
      update: {},
      create: {
        email: "admin@bionutrex.com",
        name: "Admin BioNutrex",
        password: hashedPassword,
      },
    });

    console.log("✅ Admin created:", admin.email);

    // Crear algunas secciones de home por defecto
    const homeSections = [
      {
        sectionKey: "home_video_hero",
        title: "SCIENCE DRIVEN.",
        subtitle: "Rendimiento de Élite",
        content:
          "Nutrición de precisión, formulada con estándares farmacéuticos. Para atletas que se niegan a conformarse con lo promedio.",
        titleSegments: JSON.stringify([
          { text: "SCIENCE", bold: true, italic: true },
          { text: "DRIVEN.", newlineBefore: true, color: "accent", bold: true, italic: true },
        ]),
        accentColor: "#00e5ff",
        mediaType: "video",
        videoUrl: null,
        videoMuted: true,
        buttonText: "Explorar Productos",
        buttonLink: "/",
        order: 0,
        active: true,
      },
      {
        sectionKey: "hero",
        title: "Ciencia Avanzada. Pureza Natural.",
        subtitle: "Innovación en Biotecnología",
        content:
          "Liderando el futuro de la biotecnología con suplementos naturales de alta potencia y estándares de fabricación de grado farmacéutico.",
        order: 1,
        active: true,
      },
      {
        sectionKey: "quality",
        title: "Calidad Superior",
        subtitle: "Estándares Farmacéuticos",
        content:
          "Nuestros productos cumplen con los más altos estándares de calidad y pureza en la industria.",
        order: 2,
        active: true,
      },
      {
        sectionKey: "methodology",
        title: "Metodología Científica",
        subtitle: "Investigación y Desarrollo",
        content:
          "Aplicamos métodos científicos rigurosos en el desarrollo de todos nuestros productos.",
        order: 3,
        active: true,
      },
      {
        sectionKey: "blog",
        title: "Blog y Noticias",
        subtitle: "Mantente Informado",
        content:
          "Descubre las últimas investigaciones y novedades en biotecnología nutricional.",
        order: 4,
        active: true,
      },
      {
        sectionKey: "about_hero",
        title: "Nuestro ADN",
        subtitle: "Establecidos 2018 | Lab-First",
        content:
          "Donde la investigación clínica se une al rendimiento humano élite. Desarrollamos nutrición de precisión para quienes se niegan a conformarse con lo promedio.",
        titleSegments: JSON.stringify([
          { text: "Nuestro ADN: ", color: null },
          { text: "Ciencia en Movimiento", color: "accent" },
        ]),
        accentColor: "#00e5ff",
        mediaType: "image",
        imageUrl: "/images/about-hero.jpg",
        videoUrl: null,
        videoMuted: true,
        buttonText: "Explorar Protocolos",
        buttonLink: "/productos",
        active: true,
        order: 1,
      },
      {
        sectionKey: "about_story",
        title: "Purity is Our Baseline.",
        subtitle: "01. The Foundation",
        content:
          'Bionutrex began in a clinical setting, born from a frustration with "industry standard" formulations. Our foundation is built on the rigorous cross-examination of raw botanical quality and molecular stability.',
        accentColor: "#00e5ff",
        mediaType: "image",
        active: true,
        order: 2,
      },
      {
        sectionKey: "about_stats",
        title: "Stats",
        subtitle: null,
        content: JSON.stringify([
          {
            icon: "verified_user",
            value: "100%",
            label: "Purity Guarantee",
            description:
              "No fillers, zero proprietary blends. Total transparency.",
          },
          {
            icon: "precision_manufacturing",
            value: "INDUSTRIAL",
            label: "Grade Quality",
            description:
              "Manufacturing standards exceeding GMP certifications.",
          },
          {
            icon: "biotech",
            value: "BATCH-ID",
            label: "Tracking System",
            description: "Scan any product to see its specific lab analysis.",
          },
          {
            icon: "monitoring",
            value: "BIO-SYNC",
            label: "Performance Verified",
            description: "Tested against real-world physiological benchmarks.",
          },
        ]),
        accentColor: "#00e5ff",
        mediaType: "image",
        active: true,
        order: 3,
      },
      {
        sectionKey: "about_facilities",
        title: "WORLD-CLASS INFRASTRUCTURE",
        subtitle: "Manufacturing Core",
        content:
          "Scale meets surgical precision. Our facilities are designed to maintain molecular integrity at industrial volumes.",
        accentColor: "#00e5ff",
        mediaType: "image",
        active: true,
        order: 4,
      },
      {
        sectionKey: "about_team",
        title: "Meet the Experts",
        subtitle: "The Board",
        buttonText:
          "Our products are shaped by a board of PhD researchers, elite physiologists, and Olympic-level coaches.",
        content: JSON.stringify([
          {
            name: "Dr. Marcus Vance",
            role: "Chief Performance Scientist",
            description:
              "Leading expert in molecular hypertrophy and cellular resynthesis protocols.",
            imageUrl: "",
          },
          {
            name: "Sarah Chen",
            role: "Head Strength Coach",
            description:
              "Former Olympic conditioning lead, specialized in explosive power output.",
            imageUrl: "",
          },
          {
            name: "Julian Reed",
            role: "Bio-Chemistry Director",
            description:
              "Pioneer in bioavailability engineering for rapid-uptake amino acids.",
            imageUrl: "",
          },
        ]),
        accentColor: "#00e5ff",
        mediaType: "image",
        active: true,
        order: 5,
      },
      {
        sectionKey: "about_mission",
        title: "Our Mission",
        subtitle: "Our Mission",
        buttonText: "Precision Fueling System",
        content:
          "TO RE-ENGINEER HUMAN LIMITS THROUGH THE UNCOMPROMISING APPLICATION OF BIO-MOLECULAR SCIENCE AND HIGH-OUTPUT ATHLETICISM.",
        titleSegments: JSON.stringify([
          {
            text: "TO RE-ENGINEER HUMAN LIMITS THROUGH THE UNCOMPROMISING APPLICATION OF ",
          },
          { text: "BIO-MOLECULAR SCIENCE", color: "#94a3b8" },
          { text: " AND " },
          { text: "HIGH-OUTPUT ATHLETICISM.", color: "accent" },
        ]),
        accentColor: "#00e5ff",
        mediaType: "image",
        active: true,
        order: 6,
      },
    ];

    for (const section of homeSections) {
      await prisma.homeSection.upsert({
        where: { sectionKey: section.sectionKey },
        update: {},
        create: section,
      });
      console.log(`✅ Home section created: ${section.sectionKey}`);
    }

    // Crear un post de blog de ejemplo
    const blogPost = await prisma.blogPost.upsert({
      where: { slug: "bienvenidos-bionutrex" },
      update: {},
      create: {
        title: "Bienvenidos a BioNutrex",
        slug: "bienvenidos-bionutrex",
        excerpt:
          "Conoce más sobre nuestra misión y visión en el mundo de la biotecnología nutricional.",
        content: `
# Bienvenidos a BioNutrex

En BioNutrex, estamos comprometidos con la excelencia en biotecnología nutricional. Nuestro equipo de científicos e investigadores trabaja día a día para desarrollar productos que marquen la diferencia en la salud y bienestar de las personas.

## Nuestra Misión

Proporcionar suplementos naturales de la más alta calidad, respaldados por ciencia sólida y fabricados bajo estándares farmacéuticos.

## Nuestra Visión

Ser líderes mundiales en innovación biotecnológica aplicada a la nutrición, contribuyendo a un mundo más saludable.

¡Gracias por confiar en BioNutrex!
        `,
        imageUrl: "/uploads/blog-default.jpg",
        author: "Equipo BioNutrex",
        published: true,
        publishedAt: new Date(),
        views: 0,
      },
    });

    console.log("✅ Sample blog post created:", blogPost.title);

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📋 Default credentials:");
    console.log("Email: admin@bionutrex.com");
    console.log("Password: admin123");
    console.log("\n⚠️  Remember to change the default password in production!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
