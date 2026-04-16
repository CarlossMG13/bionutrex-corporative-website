---
name: overlay-animations
description: "CSS transition pattern for drawers, modals, and overlays in React/Tailwind projects. Replaces Framer Motion AnimatePresence with always-mounted elements driven by inline style transforms and opacity. Use this whenever implementing: drawer, sidebar, modal, dialog, bottom sheet, toast overlay, or any animated panel. Avoids jittery/broken animations caused by Framer Motion lifecycle in this project."
---

# Overlay Animations — CSS Transition Pattern

## The Problem with Framer Motion AnimatePresence

`AnimatePresence` + `motion.div` with `initial/animate/exit` causes a known issue in this project:
- The component unmounts before the exit animation can run (React re-renders race against the animation)
- Results in jittery, instant-disappear, or completely broken animations
- Especially visible in drawers that slide from the edge

**Never use `AnimatePresence` or `motion.div` for overlays in this project.**

---

## The Pattern: Always-Mounted + CSS Transitions

Mount the overlay unconditionally. Control visibility with CSS `transform` / `opacity` via inline `style`. The browser compositor handles the animation — zero JS overhead, zero timing issues.

### Key principles
1. **Always in DOM** — no conditional rendering (`{isOpen && <Drawer />}`)
2. **`pointerEvents: isOpen ? "auto" : "none"`** — blocks interaction when hidden
3. **GPU-compositable properties only** — `transform` and `opacity` (never `height`, `display`, `visibility`)
4. **`transition` on both open and close** — inline style carries the CSS transition string

---

## Side Drawer (slides from right)

```tsx
// ✅ Always mounted — call it unconditionally in the parent
function SideDrawer({
  isOpen,
  content,      // last non-null value — keep visible during close animation
  onClose,
}: {
  isOpen: boolean;
  content: MyData | null;
  onClose: () => void;
}) {
  // Preserve last non-null value so content stays during close animation
  const lastRef = useRef<MyData | null>(null);
  if (content) lastRef.current = content;
  const data = lastRef.current;
  if (!data) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.28s ease",
        }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="fixed right-0 top-0 h-screen w-full sm:w-[480px] bg-white z-50 flex flex-col shadow-2xl"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* content */}
      </div>
    </>
  );
}

// ✅ In parent — no AnimatePresence, no conditional mount
<SideDrawer isOpen={!!selected} content={selected} onClose={() => setSelected(null)} />
```

### Left drawer variant
```tsx
style={{ transform: isOpen ? "translateX(0)" : "translateX(-100%)" }}
```

### Bottom sheet variant
```tsx
style={{ transform: isOpen ? "translateY(0)" : "translateY(100%)" }}
```

---

## Center Modal (scale + fade)

```tsx
function CenterModal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "auto" : "none",
        transition: "opacity 0.2s ease",
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
        style={{
          transform: isOpen ? "scale(1) translateY(0)" : "scale(0.95) translateY(8px)",
          opacity: isOpen ? 1 : 0,
          transition: "transform 0.2s ease, opacity 0.2s ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ✅ Always mounted
<CenterModal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
  {/* form content */}
</CenterModal>
```

---

## Timing Reference

| Type            | Duration | Easing                          |
|-----------------|----------|---------------------------------|
| Side drawer     | 0.28s    | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Center modal    | 0.2s     | `ease`                          |
| Backdrop fade   | 0.28s    | `ease`                          |
| Bottom sheet    | 0.32s    | `cubic-bezier(0.4, 0, 0.2, 1)` |

---

## The `lastRef` Pattern (preserve content during close)

When `isOpen` becomes `false`, you usually set the data to `null` simultaneously:
```tsx
const closeDrawer = () => {
  setSelected(null); // data goes null
  // BUT the close animation takes 0.28s — content would flash away instantly
};
```

Fix: keep the last non-null value in a ref so the panel renders its content during the close animation.

```tsx
const lastRef = useRef<Order | null>(null);
if (order) lastRef.current = order;  // update only when non-null
const renderOrder = lastRef.current; // always the last known value
```

---

## What NOT to do

```tsx
// ❌ WRONG — AnimatePresence / motion.div
import { AnimatePresence, motion } from "framer-motion";

<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
    />
  )}
</AnimatePresence>

// ❌ WRONG — conditional render without animation
{isOpen && <Drawer />}

// ❌ WRONG — animating non-compositable properties
style={{ height: isOpen ? "400px" : "0px" }}   // causes layout thrash
style={{ display: isOpen ? "flex" : "none" }}  // no transition possible
```

---

## Removing Framer Motion

After migrating, remove unused imports:

```tsx
// Remove this line if no motion.* or AnimatePresence remain in the file
import { AnimatePresence, motion } from "framer-motion";
```

Check with: `grep -n "motion\." src/pages/YourPage.tsx`

---

## Applied in this project

| File | Component | Pattern |
|------|-----------|---------|
| `src/pages/UserProfile.tsx` | `OrderDetailDrawer` | Side drawer (right) |
| `src/pages/UserProfile.tsx` | `AddressModal` | Center modal |
| *(other drawers in Navbar, Cart, etc.)* | — | Same pattern |
