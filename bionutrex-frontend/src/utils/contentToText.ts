export const truncate = (s: string, n = 240) => (s.length > n ? `${s.slice(0, n)}...` : s);

const isPrimitive = (v: any) => v === null || ["string", "number", "boolean"].includes(typeof v);

const firstStringProp = (obj: any) => {
  if (!obj || typeof obj !== "object") return null;
  const prefer = [
    "label",
    "title",
    "name",
    "text",
    "description",
    "category",
    "categories",
    "productLine",
    "productLines",
    "dateOption",
    "dateOptions",
    "id",
  ];
  for (const k of prefer) {
    if (typeof obj[k] === "string" && obj[k].trim()) return obj[k];
  }
  for (const k of Object.keys(obj)) {
    if (typeof obj[k] === "string" && obj[k].trim()) return obj[k];
  }
  return null;
};

const tryParseJson = (s: string) => {
  try {
    let p: any = JSON.parse(s);
    if (typeof p === "string" && (p.trim().startsWith("{") || p.trim().startsWith("["))) {
      try {
        p = JSON.parse(p);
      } catch {}
    }
    return p;
  } catch {
    return null;
  }
};

export function contentToText(raw?: string | null, maxLen = 240): string {
  if (!raw) return "";
  const parsed = tryParseJson(raw);
  if (parsed === null) return truncate(raw.trim(), maxLen);

  if (isPrimitive(parsed)) return String(parsed);

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) return "";
    if (parsed.every(isPrimitive)) {
      return truncate(parsed.slice(0, 6).map((v) => String(v)).join(", "), maxLen);
    }
    // array of objects: join firstStringProp
    const labels = parsed
      .slice(0, 6)
      .map((it: any, idx: number) => firstStringProp(it) ?? `Ítem ${idx + 1}`);
    const suffix = parsed.length > 6 ? ` +${parsed.length - 6}` : "";
    return truncate(labels.join(", ") + suffix, maxLen);
  }

  if (typeof parsed === "object" && parsed !== null) {
    // Special-case common keys that hold arrays of labels (show short lists)
    const toList = (arr: any[]) =>
      arr
        .slice(0, 6)
        .map((it, idx) => (isPrimitive(it) ? String(it) : firstStringProp(it) ?? `Ítem ${idx + 1}`))
        .join(", ");

    if (Array.isArray((parsed as any).categories)) {
      return truncate(toList((parsed as any).categories), maxLen);
    }
    if (Array.isArray((parsed as any).category)) {
      return truncate(toList((parsed as any).category), maxLen);
    }
    if (Array.isArray((parsed as any).productLines)) {
      return truncate(toList((parsed as any).productLines), maxLen);
    }
    if (Array.isArray((parsed as any).productLine)) {
      return truncate(toList((parsed as any).productLine), maxLen);
    }
    if (Array.isArray((parsed as any).dateOptions)) {
      return truncate(toList((parsed as any).dateOptions), maxLen);
    }
    if (Array.isArray((parsed as any).dateOption)) {
      return truncate(toList((parsed as any).dateOption), maxLen);
    }

    const p = firstStringProp(parsed);
    if (p) return truncate(p, maxLen);
    const keys = Object.keys(parsed).slice(0, 4);
    const parts = keys.map((k) => {
      const v = (parsed as any)[k];
      if (isPrimitive(v)) return `${k}: ${String(v)}`;
      if (Array.isArray(v)) return `${k}: ${v.length} items`;
      return `${k}: object`;
    });
    return truncate(parts.join(" · "), maxLen);
  }

  return truncate(String(parsed), maxLen);
}
