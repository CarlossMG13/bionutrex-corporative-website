import prisma from "../src/utils/db.js";

const DEFAULT_CATEGORIES = [
  { name: "Suplementos", slug: "suplementos" },
  { name: "Vitaminas", slug: "vitaminas" },
  { name: "Digestión", slug: "digestion" },
  { name: "Antioxidantes", slug: "antioxidantes" },
  { name: "Energía", slug: "energia" },
  { name: "Sistema Inmunológico", slug: "sistema-inmunologico" },
];

async function initializeCategories() {
  try {
    console.log("Initializing categories...");
    
    for (const category of DEFAULT_CATEGORIES) {
      const existing = await prisma.category.findUnique({
        where: { slug: category.slug },
      });
      
      if (!existing) {
        const created = await prisma.category.create({
          data: category,
        });
        console.log(`✓ Created category: ${created.name}`);
      } else {
        console.log(`✓ Category already exists: ${existing.name}`);
      }
    }
    
    console.log("\n✓ All categories initialized successfully!");
    
    // List all categories
    const allCategories = await prisma.category.findMany();
    console.log(`\nTotal categories: ${allCategories.length}`);
    allCategories.forEach((cat) => {
      console.log(`  - ${cat.name} (${cat.slug})`);
    });
    
  } catch (error) {
    console.error("Error initializing categories:", error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeCategories();
