import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const BLUE  = "#0d40a5";
const DARK  = "#060d1a";
const CYAN  = "#00e5ff";
const GRAY  = "#6b7280";

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    paddingBottom: 32,
  },

  /* Header */
  header: {
    backgroundColor: DARK,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand:       { fontSize: 8, color: CYAN, letterSpacing: 2.5, textTransform: "uppercase" },
  productName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#ffffff", marginTop: 3 },
  badgeBox:    { backgroundColor: BLUE, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 3, marginTop: 6, alignSelf: "flex-start" },
  badgeText:   { color: "#ffffff", fontSize: 6, fontFamily: "Helvetica-Bold", letterSpacing: 1.2, textTransform: "uppercase" },
  docTitle:    { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#ffffff", letterSpacing: 1, textTransform: "uppercase", textAlign: "right" },
  docDate:     { fontSize: 6.5, color: "#ffffff", opacity: 0.4, textAlign: "right", marginTop: 3 },

  body: { paddingHorizontal: 32, paddingTop: 18 },

  sectionTitle: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 7,
  },

  /* Info rápida */
  infoGrid: { flexDirection: "row", gap: 8, marginBottom: 14 },
  infoCard: { flex: 1, backgroundColor: "#f3f4f6", borderRadius: 5, padding: 10 },
  infoLabel: { fontSize: 6, color: GRAY, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 },
  infoValue: { fontSize: 11, fontFamily: "Helvetica-Bold", color: DARK },
  infoUnit:  { fontSize: 6.5, color: GRAY, marginTop: 1 },

  /* Descripción */
  descBox: {
    backgroundColor: "#f3f4f6",
    borderRadius: 5,
    padding: 10,
    marginBottom: 14,
    borderLeft: `3 solid ${BLUE}`,
  },
  descText: { fontSize: 8, color: GRAY, lineHeight: 1.6 },

  /* Tabla */
  table: { borderRadius: 5, overflow: "hidden", border: "1 solid #e5e7eb", marginBottom: 14 },
  tableHeader: { backgroundColor: BLUE, flexDirection: "row", paddingVertical: 6, paddingHorizontal: 12 },
  tableHeaderCell: { fontSize: 6.5, fontFamily: "Helvetica-Bold", color: "#ffffff", letterSpacing: 1.2, textTransform: "uppercase" },
  tableRow: { flexDirection: "row", paddingVertical: 7, paddingHorizontal: 12, borderBottom: "1 solid #f3f4f6" },
  tableRowAlt: { backgroundColor: "#fafafa" },
  tableCellName:   { flex: 1, fontSize: 8, color: "#111827" },
  tableCellAmount: { width: 80, fontSize: 8, fontFamily: "Helvetica-Bold", color: BLUE, textAlign: "right" },

  /* Beneficios */
  featureGrid: { flexDirection: "row", gap: 8, marginBottom: 14 },
  featureCard: { flex: 1, borderRadius: 5, border: "1 solid #e5e7eb", padding: 10 },
  featureTitle: { fontSize: 7, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 3 },
  featureDesc:  { fontSize: 7, color: GRAY, lineHeight: 1.5 },

  /* Certs */
  certRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  certCard: { flex: 1, border: "1 solid #e5e7eb", borderRadius: 5, padding: 8, alignItems: "center" },
  certTitle: { fontSize: 7, fontFamily: "Helvetica-Bold", color: DARK, textAlign: "center", marginBottom: 1 },
  certSub:   { fontSize: 6, color: GRAY, textAlign: "center" },

  divider: { height: 1, backgroundColor: "#e5e7eb", marginBottom: 12 },

  legalText: { fontSize: 6, color: GRAY, lineHeight: 1.6, opacity: 0.7 },

  /* Footer */
  footer: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: DARK,
    paddingVertical: 9,
    paddingHorizontal: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerBrand: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#ffffff", letterSpacing: 2, textTransform: "uppercase" },
  footerNote:  { fontSize: 6.5, color: "#ffffff", opacity: 0.4 },
  footerPage:  { fontSize: 7, color: CYAN, fontFamily: "Helvetica-Bold" },
});

/* ── Tipos y helpers ─────────────────────────────── */
interface Ingredient { name: string; amount: string; }
interface Feature    { icon: string; title: string; description: string; color: string; }

function parse<T>(raw: string | undefined): T[] {
  try { return JSON.parse(raw || "[]"); } catch { return []; }
}

const FALLBACK_INGREDIENTS: Ingredient[] = [
  { name: "Bio-Peptide Complex",           amount: "15,000mg" },
  { name: "L-Glutamine (Micronized)",      amount: "5,000mg"  },
  { name: "Electrolyte Neural-Shield",     amount: "2,400mg"  },
  { name: "AstraGin® Absorption Enhancer", amount: "50mg"     },
  { name: "BCAA 2:1:1 Ratio",             amount: "8,000mg"  },
];

const FALLBACK_FEATURES: Feature[] = [
  { icon: "", title: "Peak Intensity",   description: "Supports ATP regeneration during high-output sessions.",     color: BLUE      },
  { icon: "", title: "Rapid Recovery",   description: "Decreases DOMS by reducing inflammation markers.",           color: "#00b894" },
  { icon: "", title: "Absorción Rápida", description: "Fórmula de disolución rápida para máxima biodisponibilidad.", color: "#fd79a8" },
  { icon: "", title: "Pureza Clínica",   description: "Testado en laboratorio. Sin aditivos ni rellenos.",          color: "#6c5ce7" },
];

/* ── Componente ──────────────────────────────────── */
interface Props {
  productName?: string;
  categoryName?: string;
  description?: string;
  longDescription?: string;
  ingredients?: string;
  features?: string;
  badge?: string;
}

export function FichaTecnicaPDF({
  productName  = "Producto Bionutrex",
  categoryName = "Suplemento",
  description,
  longDescription,
  ingredients,
  features,
  badge,
}: Props) {
  const rows  = parse<Ingredient>(ingredients);
  const cards = parse<Feature>(features);

  const displayRows  = rows.length  ? rows  : FALLBACK_INGREDIENTS;
  const displayCards = cards.length ? cards : FALLBACK_FEATURES;
  const displayDesc  = longDescription || description ||
    "Nuestra fórmula de extracción propietaria preserva las fracciones bioactivas que se pierden en procesos de fabricación estándar. Cada porción aporta una matriz limpia, sin rellenos, diseñada para soportar la síntesis muscular y la gestión del estrés oxidativo.";

  const today = new Date().toLocaleDateString("es-MX", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.brand}>Bionutrex</Text>
            <Text style={s.productName}>{productName}</Text>
            {badge && <View style={s.badgeBox}><Text style={s.badgeText}>{badge}</Text></View>}
          </View>
          <View>
            <Text style={s.docTitle}>Ficha Técnica</Text>
            <Text style={s.docDate}>Emitido: {today}</Text>
          </View>
        </View>

        <View style={s.body}>

          {/* Info rápida */}
          <View style={[s.infoGrid, { marginTop: 16 }]}>
            <View style={s.infoCard}>
              <Text style={s.infoLabel}>Categoría</Text>
              <Text style={s.infoValue}>{categoryName}</Text>
            </View>
            <View style={s.infoCard}>
              <Text style={s.infoLabel}>Porciones</Text>
              <Text style={s.infoValue}>30</Text>
              <Text style={s.infoUnit}>por envase</Text>
            </View>
            <View style={s.infoCard}>
              <Text style={s.infoLabel}>Tamaño de porción</Text>
              <Text style={s.infoValue}>1 scoop</Text>
              <Text style={s.infoUnit}>≈ 30g</Text>
            </View>
            <View style={s.infoCard}>
              <Text style={s.infoLabel}>Calorías</Text>
              <Text style={s.infoValue}>120</Text>
              <Text style={s.infoUnit}>kcal / porción</Text>
            </View>
          </View>

          {/* Layout dos columnas: descripción + tabla | beneficios + certs */}
          <View style={{ flexDirection: "row", gap: 16 }}>

            {/* Columna izquierda */}
            <View style={{ flex: 1 }}>
              <Text style={s.sectionTitle}>Descripción</Text>
              <View style={s.descBox}>
                <Text style={s.descText}>{displayDesc}</Text>
              </View>

              <Text style={s.sectionTitle}>Composición molecular</Text>
              <View style={s.table}>
                <View style={s.tableHeader}>
                  <Text style={[s.tableHeaderCell, { flex: 1 }]}>Ingrediente</Text>
                  <Text style={[s.tableHeaderCell, { width: 80, textAlign: "right" }]}>Cantidad</Text>
                </View>
                {displayRows.map((row, i) => (
                  <View key={i} style={[s.tableRow, i % 2 !== 0 ? s.tableRowAlt : {}]}>
                    <Text style={s.tableCellName}>{row.name}</Text>
                    <Text style={s.tableCellAmount}>{row.amount}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Columna derecha */}
            <View style={{ flex: 1 }}>
              <Text style={s.sectionTitle}>Beneficios clave</Text>
              <View style={s.featureGrid}>
                {displayCards.slice(0, 2).map((card, i) => (
                  <View key={i} style={s.featureCard}>
                    <Text style={[s.featureTitle, { color: card.color || BLUE }]}>{card.title}</Text>
                    <Text style={s.featureDesc}>{card.description}</Text>
                  </View>
                ))}
              </View>
              <View style={s.featureGrid}>
                {displayCards.slice(2, 4).map((card, i) => (
                  <View key={i} style={s.featureCard}>
                    <Text style={[s.featureTitle, { color: card.color || BLUE }]}>{card.title}</Text>
                    <Text style={s.featureDesc}>{card.description}</Text>
                  </View>
                ))}
              </View>

              <View style={s.divider} />

              <Text style={s.sectionTitle}>Certificaciones y calidad</Text>
              <View style={s.certRow}>
                {[
                  { title: "Informed Sport", sub: "Certificado"      },
                  { title: "Lab Tested",     sub: "Pureza verificada" },
                ].map((c, i) => (
                  <View key={i} style={s.certCard}>
                    <Text style={s.certTitle}>{c.title}</Text>
                    <Text style={s.certSub}>{c.sub}</Text>
                  </View>
                ))}
              </View>
              <View style={s.certRow}>
                {[
                  { title: "100% Vegano",   sub: "Fórmula limpia"  },
                  { title: "GMP Certified", sub: "Buenas prácticas" },
                ].map((c, i) => (
                  <View key={i} style={s.certCard}>
                    <Text style={s.certTitle}>{c.title}</Text>
                    <Text style={s.certSub}>{c.sub}</Text>
                  </View>
                ))}
              </View>

              <View style={s.divider} />

              <Text style={s.legalText}>
                * Los valores diarios no están establecidos. † Estos enunciados no han sido evaluados por la FDA. Este producto no está destinado a diagnosticar, tratar, curar o prevenir ninguna enfermedad.
              </Text>
            </View>

          </View>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerBrand}>Bionutrex</Text>
          <Text style={s.footerNote}>bionutrex.com · {today}</Text>
          <Text style={s.footerPage}>Ficha Técnica Oficial</Text>
        </View>

      </Page>
    </Document>
  );
}
