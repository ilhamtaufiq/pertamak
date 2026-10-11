/**
 * Design Tokens — Pertamak Mobile
 * Single source of truth for typography, buttons, colors, spacing, radii, elevation.
 *
 * Principles: flat surfaces, 1px borders instead of shadows, one accent colour
 * (primary) reserved for actions and active states, sentence case by default.
 *
 * Usage:
 *   import { TYPOGRAPHY, BUTTON, COLORS, RADIUS, SHADOWS } from '../tokens';
 *
 *   <View style={{ backgroundColor: COLORS.darkSurface, borderColor: COLORS.darkBorder, borderWidth: 1, borderRadius: RADIUS.lg }} />
 *   <Text style={TYPOGRAPHY.title}>...</Text>
 */

export const COLORS = {
  /** Accent for icons, links and active tab on dark surfaces */
  primary: '#38BDF8',
  /** Brand sky blue */
  primarySolid: '#0EA5E9',
  /** Filled action backgrounds — white label on this passes WCAG AA */
  primaryDeep: '#0284C7',
  darkBg: '#020617',
  /** Cards, sheets, modals */
  darkSurface: '#0F172A',
  /** Alias kept for existing call sites: cards are solid, not translucent */
  darkCard: '#0F172A',
  /** Solid 1px hairline */
  darkBorder: '#1E293B',
  emerald: '#10B981',
  rose: '#F43F5E',
  amber: '#F59E0B',
  text: '#FFFFFF',
  /** Body and meta text. Not dimmer than this on dark surfaces. */
  textSecondary: '#94A3B8',
  /** Tertiary meta and placeholder text (still >= 4.5:1 on darkBg) */
  textTertiary: '#64748B',
  /** Decorative / disabled only. Never for readable text. */
  textInactive: '#475569',
} as const;

/** Radius scale: 8 (chips), 12 (buttons, inputs), 16 (cards, sheets). */
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

export const TYPOGRAPHY = {
  /** Hero — 40, 800 */
  display: { fontSize: 40, lineHeight: 46, fontWeight: '800' as const },
  /** Page title — 28, 800 */
  title: { fontSize: 28, lineHeight: 34, fontWeight: '800' as const },
  /** Section heading — 22, 700 */
  heading: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  /** Sub heading — 18, 700 */
  subheading: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const },
  /** Content body — 16, 500 */
  body: { fontSize: 16, lineHeight: 24, fontWeight: '500' as const },
  /** Secondary body — 15, 600 */
  bodySecondary: { fontSize: 15, lineHeight: 22, fontWeight: '600' as const },
  /** Caption — 13, 500 */
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  /** Field / value label — 13, 600, sentence case */
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const },
  /** Small section label — the only place uppercase is used */
  sectionLabel: { fontSize: 11, lineHeight: 14, fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: 0.8 },
  /** Badge / chip text — 12, 600, sentence case */
  badge: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const },
} as const;

export const BUTTON = {
  /** Main action — 52 tall, 12 radius */
  primary: { height: 52, borderRadius: RADIUS.md, fontSize: 16, fontWeight: '600' as const },
  secondary: { height: 48, borderRadius: RADIUS.md, fontSize: 15, fontWeight: '600' as const },
  ghost: { height: 44, borderRadius: RADIUS.md, fontSize: 15, fontWeight: '600' as const },
  /** Compact control — 44 minimum touch target */
  pill: { height: 44, borderRadius: RADIUS.md, fontSize: 14, fontWeight: '600' as const },
} as const;

export const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, xxxxl: 40,
} as const;

/**
 * Elevation. Cards and buttons use a 1px border instead.
 * Only true floating elements (tab bar, primary submit/export) get `floating`.
 */
export const SHADOWS = {
  none: {},
  floating: { boxShadow: '0px 6px 16px rgba(0,0,0,0.25)', elevation: 6 },
} as const;
