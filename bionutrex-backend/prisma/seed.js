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
          {
            text: "DRIVEN.",
            newlineBefore: true,
            color: "accent",
            bold: true,
            italic: true,
          },
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
      {
        sectionKey: "products_hero",
        title: "Push Beyond Evolution",
        subtitle: "Engineered for Performance",
        content:
          "Precision-engineered supplements designed for those who refuse to settle. Elevate your biological ceiling with Bionutrex.",
        titleSegments: JSON.stringify([
          { text: "Push Beyond ", bold: true, italic: true },
          { text: "Evolution", color: "accent", bold: true, italic: true },
        ]),
        accentColor: "#00e5ff",
        mediaType: "image",
        imageUrl: "/images/heroSection-img.jpg",
        videoUrl: null,
        videoMuted: true,
        buttonText: "Ver Líneas de Productos",
        buttonLink: "/products",
        button2Text: "La Ciencia",
        button2Link: "/about",
        active: true,
        order: 1,
      },
      {
        sectionKey: "products_feature",
        title: "ISO-FUEL PROTEIN",
        subtitle: "Foundation",
        content: JSON.stringify({
          description:
            "Ultra-filtered whey isolate con biodisponibilidad biológica de alto rendimiento. 28g de combustible anabólico puro por scoop, enriquecido con péptidos esenciales.",
          badges: [
            { value: "28G", label: "Pure Isolate" },
            { value: "0G", label: "Sugar / Fat" },
          ],
        }),
        titleSegments: JSON.stringify([
          { text: "ISO-FUEL", bold: true, italic: true },
          {
            text: "PROTEIN",
            newlineBefore: true,
            color: "accent",
            bold: true,
            italic: true,
          },
        ]),
        accentColor: "#00e5ff",
        mediaType: "image",
        videoUrl: null,
        videoMuted: true,
        buttonText: "Explorar Sabores",
        buttonLink: "/",
        active: true,
        order: 2,
      },
      {
        sectionKey: "products_feature_alt",
        title: "CELL-VOL CREATINE",
        subtitle: "Strength",
        content: JSON.stringify({
          description:
            "Matriz de regeneración ATP micronizada. Aumenta la potencia de salida hasta un 15% en los primeros 7 días de carga. Sin retención, máxima densidad muscular.",
          features: [
            { icon: "verified", label: "Pharmaceutical Grade" },
            { icon: "analytics", label: "Lab Tested" },
            { icon: "bolt", label: "Rapid Absorption" },
            { icon: "science", label: "Micronized Formula" },
          ],
        }),
        titleSegments: JSON.stringify([
          { text: "CELL-VOL", bold: true, italic: true },
          {
            text: "CREATINE",
            newlineBefore: true,
            color: "accent",
            bold: true,
            italic: true,
          },
        ]),
        accentColor: "#00e5ff",
        mediaType: "image",
        videoUrl: null,
        videoMuted: true,
        buttonText: "Boost Performance",
        buttonLink: "/",
        active: true,
        order: 3,
      },
      {
        sectionKey: "products_preworkout",
        title: "NEURO-DRIVE",
        subtitle: "Intensity",
        content: JSON.stringify({
          description:
            "A neurological catalyst designed to bridge the gap between mind and muscle. Zero crash technology with sustained release caffeine and peak O2 enhancers.",
          icon: "offline_bolt",
          productName: "Hyper-Focus Pre-Workout",
          stats: [
            { value: "PUMP", label: "Nitrate Blend" },
            { value: "DRIVE", label: "Noatropic Stack" },
            { value: "FLOW", label: "O2 Delivery" },
          ],
        }),
        titleSegments: JSON.stringify([
          { text: "NEURO-DRIVE", bold: true, italic: true },
        ]),
        accentColor: "#00e5ff",
        mediaType: "image",
        videoUrl: null,
        videoMuted: true,
        buttonText: "Ignite Your Session",
        buttonLink: "/",
        active: true,
        order: 4,
      },
      {
        sectionKey: "products_cta",
        title: "Ready to Outperform your peers?",
        subtitle: null,
        content:
          "Join 50,000+ elite athletes who rely on Bionutrex to fuel their potential.",
        titleSegments: JSON.stringify([
          { text: "Ready to " },
          { text: "Outperform", color: "accent" },
          { text: " your peers?" },
        ]),
        accentColor: "#00e5ff",
        mediaType: "image",
        videoUrl: null,
        videoMuted: true,
        buttonText: "Shop All Products",
        buttonLink: "/products",
        button2Text: "Join the Elite Club",
        button2Link: "/",
        active: true,
        order: 5,
      },
      {
        sectionKey: "categories_hero",
        title: "Unleash Your Potential",
        subtitle: "Peak Human Performance",
        content:
          "Science-backed nutrition engineered for those who demand more from themselves. Select your mission below to begin your transformation.",
        titleSegments: JSON.stringify([
          { text: "Unleash Your " },
          { text: "Potential", color: "accent", bold: true, italic: true },
        ]),
        accentColor: "#00e5ff",
        mediaType: "image",
        videoUrl: null,
        videoMuted: true,
        buttonText: "Start Your Journey",
        buttonLink: "/categories",
        button2Text: "View Scientific Studies",
        button2Link: "/about",
        active: true,
        order: 1,
      },
      {
        sectionKey: "categories_goals",
        title: "Select Your Mission",
        subtitle:
          "Precision-formulated stacks designed to accelerate results for specific performance objectives.",
        content: JSON.stringify([
          {
            title: "Muscle Building",
            description:
              "Hypertrophy-focused formulas designed for maximum protein synthesis and size gains.",
            link: "/",
            productIds: [],
          },
          {
            title: "Fat Loss",
            description:
              "Thermogenic blends that accelerate metabolism while preserving lean muscle mass.",
            link: "/",
            productIds: [],
          },
          {
            title: "Rapid Recovery",
            description:
              "Repair muscle fibers faster and reduce soreness with clinical-grade micronutrients.",
            link: "/",
            productIds: [],
          },
          {
            title: "Endurance Elite",
            description:
              "Optimized cellular energy and VO2 max support for long-distance performance.",
            link: "/",
            productIds: [],
          },
        ]),
        titleSegments: null,
        accentColor: "#00e5ff",
        mediaType: "image",
        videoUrl: null,
        videoMuted: true,
        buttonText: null,
        buttonLink: null,
        active: true,
        order: 2,
      },
      {
        sectionKey: "categories_stack",
        title: "Muscle Building Stack",
        subtitle: null,
        content: JSON.stringify({
          bundleTitle: "The Ultimate Hypertrophy Stack",
          bundleText: "Save 15% when you buy all three together.",
          originalPrice: "$132.97",
          salePrice: "$112.99",
          icon: "inventory_2",
        }),
        titleSegments: null,
        accentColor: "#00e5ff",
        mediaType: "image",
        videoUrl: null,
        videoMuted: true,
        buttonText: "Buy Stack",
        buttonLink: "/",
        active: true,
        order: 3,
      },
      {
        sectionKey: "categories_why",
        title: "Engineered for the 1% of Performance",
        subtitle: null,
        content: JSON.stringify({
          description:
            "We don't do generic. Every Bionutrex formula is clinical-strength, third-party tested, and designed for athletes who refuse to settle for average.",
          bullets: [
            {
              icon: "verified",
              title: "Third Party Tested",
              description: "Certified for sport, no banned substances, ever.",
            },
            {
              icon: "science",
              title: "Clinical Dosages",
              description:
                "No proprietary blends. Exactly what you need, in the right amount.",
            },
            {
              icon: "bolt",
              title: "Bioavailability Priority",
              description:
                "Advanced delivery systems for maximum nutrient absorption.",
            },
          ],
          testimonial: {
            name: "Dr. Elena Vance",
            role: "Head of Performance Science",
            quote:
              "Our goal isn't just to make supplements; it's to push the boundaries of what the human body is capable of through precise molecular nutrition.",
            imageUrl: "",
          },
        }),
        titleSegments: JSON.stringify([
          { text: "Engineered for the " },
          {
            text: "1% of Performance",
            color: "accent",
            bold: true,
            italic: true,
          },
        ]),
        accentColor: "#00e5ff",
        mediaType: "image",
        videoUrl: null,
        videoMuted: true,
        buttonText: null,
        buttonLink: null,
        active: true,
        order: 4,
      },
      {
        sectionKey: "resources_hero",
        title: "CENTRO DE RECURSOS CIENTÍFICOS",
        subtitle: "Portal Profesional",
        content:
          "Documentación técnica avanzada para distribuidores y profesionales de la salud. Accede a guías clínicas, protocolos de suplementación y catálogos interactivos.",
        titleSegments: JSON.stringify([
          { text: "CENTRO DE " },
          { text: "RECURSOS", color: "accent", bold: true },
          { text: " CIENTÍFICOS", newlineBefore: true, bold: true },
        ]),
        accentColor: "#00e5ff",
        mediaType: "image",
        videoUrl: null,
        videoMuted: true,
        buttonText: "Solicitar Especificaciones",
        buttonLink: "/",
        button2Text: null,
        button2Link: null,
        active: true,
        order: 1,
      },
      {
        sectionKey: "resources_filter",
        title: "Filtros",
        subtitle: null,
        content: JSON.stringify({
          categories: [
            "Todos los Recursos",
            "Guías Clínicas",
            "Manuales Técnicos",
            "Certificaciones",
          ],
          productLines: [
            "Todas las Líneas",
            "ISO-FORGE Series",
            "CELL-VOL Series",
            "NEURO-DRIVE Series",
          ],
          dateOptions: ["Más Recientes", "Últimos 6 meses", "2024"],
        }),
        titleSegments: null,
        accentColor: "#00e5ff",
        mediaType: "image",
        videoUrl: null,
        videoMuted: true,
        buttonText: null,
        buttonLink: null,
        active: true,
        order: 2,
      },
      {
        sectionKey: "resources_catalogs",
        title: "Catálogos Destacados",
        subtitle: null,
        content: JSON.stringify([
          {
            title: "Guía de Suplementación Elite",
            version: "V2.1",
            description:
              "Protocolo completo de periodización nutricional con dosis clínicas y tiempos de administración.",
            fileSize: "18.5 MB",
            fileIcon: "picture_as_pdf",
            downloadUrl: "/",
            category: "Guías Clínicas",
            productLine: "ISO-FORGE Series",
          },
          {
            title: "Manual Técnico Creatina",
            version: "V1.4",
            description:
              "Especificaciones de pureza, biodisponibilidad y protocolos de carga para CELL-VOL.",
            fileSize: "12.2 MB",
            fileIcon: "science",
            downloadUrl: "/",
            category: "Manuales Técnicos",
            productLine: "CELL-VOL Series",
          },
          {
            title: "Certificaciones de Calidad",
            version: "V3.0",
            description:
              "Documentación de certificación farmacéutica, pruebas de terceros y registros sanitarios.",
            fileSize: "8.7 MB",
            fileIcon: "verified",
            downloadUrl: "/",
            category: "Certificaciones",
            productLine: "Todas las Líneas",
          },
        ]),
        titleSegments: null,
        accentColor: "#00e5ff",
        mediaType: "image",
        videoUrl: null,
        videoMuted: true,
        buttonText: null,
        buttonLink: null,
        active: true,
        order: 3,
      },
      {
        sectionKey: "resources_table",
        title: "Technical Data Sheets (TDS)",
        subtitle: null,
        content: JSON.stringify([
          {
            icon: "picture_as_pdf",
            iconColor: "red",
            name: "Protocolo Clínico Whey Isolate",
            reference: "TDS-9902-B",
            category: "CLÍNICO",
            date: "12 Oct 2024",
            downloadUrl: "/",
          },
          {
            icon: "table_chart",
            iconColor: "green",
            name: "Especificaciones Creatina Micronizada",
            reference: "TDS-8812-C",
            category: "INGENIERÍA",
            date: "05 Nov 2024",
            downloadUrl: "/",
          },
          {
            icon: "description",
            iconColor: "blue",
            name: "Certificación ISO 22000 — Bionutrex",
            reference: "CERT-1022-A",
            category: "LEGAL",
            date: "20 Ene 2025",
            downloadUrl: "/",
          },
        ]),
        titleSegments: null,
        accentColor: "#00e5ff",
        mediaType: "image",
        videoUrl: null,
        videoMuted: true,
        buttonText: null,
        buttonLink: null,
        active: true,
        order: 4,
      },
      {
        sectionKey: "resources_cta",
        title: "¿No encuentras un documento?",
        subtitle: null,
        content:
          "Nuestro equipo técnico está disponible para generar especificaciones personalizadas o recuperar archivos históricos fuera del catálogo actual.",
        titleSegments: JSON.stringify([
          { text: "¿No encuentras un " },
          { text: "documento", color: "accent" },
          { text: "?" },
        ]),
        accentColor: "#00e5ff",
        mediaType: "image",
        videoUrl: null,
        videoMuted: true,
        buttonText: "Soporte en Vivo",
        buttonLink: "/",
        button2Text: "Enviar Ticket",
        button2Link: "/",
        active: true,
        order: 5,
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
