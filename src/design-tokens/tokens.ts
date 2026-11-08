/**
 * OMNI Design System — Shared Design Tokens
 * Brand Variant: Emerald SaaS (XML Validator Online)
 * WCAG 2.1 AA / AAA Compliant
 */

export const DESIGN_TOKENS = {
  brand: 'emerald',
  name: 'Emerald SaaS',
  colors: {
    // Primary Emerald Scale
    primary50: '#ecfdf5',
    primary100: '#d1fae5',
    primary200: '#a7f3d0',
    primary300: '#6ee7b7',
    primary400: '#34d399',
    primary500: '#10b981',
    primary600: '#059669', // Main brand
    primary700: '#047857', // Hover state
    primary800: '#065f46', // Deep emerald
    primary900: '#064e3b',

    // Neutrals (Slate Light)
    bgCanvas: '#f8fafc',
    surface: '#ffffff',
    surfaceSubtle: '#f1f5f9',
    surfaceBorder: '#e2e8f0',
    surfaceBorderFocus: '#10b981',

    // Text & Content
    textPrimary: '#0f172a',    // 15.3:1 contrast on white (AAA)
    textSecondary: '#334155',  // 9.8:1 contrast on white (AAA)
    textMuted: '#64748b',      // 4.6:1 contrast on white (AA)
    textInverse: '#ffffff',

    // Feedback States
    successBg: '#ecfdf5',
    successText: '#065f46',
    successBorder: '#a7f3d0',
    errorBg: '#fef2f2',
    errorText: '#991b1b',
    errorBorder: '#fecaca',
    warningBg: '#fffbeb',
    warningText: '#92400e',
    warningBorder: '#fde68a',
  },
  typography: {
    fontSans: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontMono: '"JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace',
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
    card: '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
    elevated: '0 20px 40px -12px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.03)',
    emeraldGlow: '0 0 20px -4px rgba(16, 185, 129, 0.25)',
  },
  transitions: {
    fast: '150ms cubic-bezier(0.16, 1, 0.3, 1)',
    normal: '250ms cubic-bezier(0.16, 1, 0.3, 1)',
  },
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;
