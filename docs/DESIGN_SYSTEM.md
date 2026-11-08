# OMNI Premium SaaS Design System — XML Validator Online

## Brand Identity & Theme
- **Variant:** Emerald SaaS (Light Theme)
- **Role:** High-productivity browser-native XML validation and e-commerce feed linting engine.
- **Visual Personality:** Clean, precise, accessible, emerald/mint highlights on crisp slate-50/white surfaces.

## Design Tokens
- **Primary Brand Color:** `#059669` (Emerald 600)
- **Primary Hover:** `#047857` (Emerald 700)
- **Primary Soft Tint:** `#ecfdf5` (Emerald 50)
- **Primary Border:** `#a7f3d0` (Emerald 200)
- **Accent Mint:** `#10b981` (Emerald 500)
- **Background Canvas:** `#f8fafc` (Slate 50)
- **Card & Panel Surfaces:** `#ffffff` (White)
- **Card Borders:** `#e2e8f0` (Slate 200)
- **Text Primary:** `#0f172a` (Slate 900, AAA 15.3:1 contrast ratio)
- **Text Secondary:** `#334155` (Slate 700, AAA 9.8:1 contrast ratio)
- **Text Muted:** `#64748b` (Slate 500, AA 4.6:1 contrast ratio)

## Layout Guidelines
- **Desktop (>= 1024px):** Side-by-side workspace:
  - Left column (1.15fr): Editor, format/minify controls, sample selectors, line & size statistics.
  - Right column (0.85fr): Live status banner, tabbed diagnostics (DOM metrics, Heureka feed lint, parser details).
- **Tablet / Mobile (< 1024px):** Vertically stacked layout with preserved side-scrolling and touch-friendly targets (min 44px).
- **Reduced Motion:** Full compliance with `prefers-reduced-motion: reduce`. Animations and transitions scale down to 0.01ms.
- **Accessibility:** Semantic HTML5 elements (`main`, `header`, `footer`, `section`, `article`, `role="tab"`), clear visible focus rings (`:focus-visible`), aria labels on all interactive controls.

## Capabilities Preserved & Extended
1. **W3C XML Validation:** DOMParser-based syntax checking without server roundtrips.
2. **Format (Pretty Print):** Clean 2-space indented hierarchical formatting.
3. **Minify:** Stripping unnecessary whitespace for compact transport.
4. **Heureka Product Feed Linting:** Complete validation of e-commerce product feeds (`<SHOP>`, `<SHOPITEM>`, `<ITEM_ID>`, `<PRODUCTNAME>`, `<DESCRIPTION>`, `<URL>`, `<PRICE_VAT>`, `<DELIVERY_DATE>`, `<IMGURL>`, `<CATEGORYTEXT>`, `<EAN>`).
