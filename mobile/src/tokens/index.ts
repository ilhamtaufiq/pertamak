/**
 * Design Tokens — Pertamak Mobile
 * Single source of truth for typography, buttons, colors, spacing, shadows.
 *
 * Usage:
 *   import { TYPOGRAPHY, BUTTON, COLORS } from '../tokens';
 *
 *   <Text style={TYPOGRAPHY.title}>...</Text>
 *   <TouchableOpacity style={{ ...BUTTON.primary, ...SHADOWS.glow(COLORS.primarySolid) }} ...
 */

export const COLORS = {
  primary: '#38BDF8',
  primarySolid: '#0EA5E9',
  primaryDeep: '#0284C7',
  darkBg: '#020617',
  darkSurface: '#0F172A',
  darkCard: 'rgba(255,255,255,0.03)',
  darkBorder: 'rgba(255,255,255,0.1)',
  emerald: '#10B981',
  rose: '#F43F5E',
  amber: '#F59E0B',
  text: '#FFFFFF',
  textSecondary: '#64748B',
  textTertiary: '#475569',
  textInactive: '#334155',
} as const;

export const TYPOGRAPHY = {
  /** Hero — 48, -2, 900 */
  display: { fontSize: 48, letterSpacing: -2, fontWeight: '900' as const },
  /** Page title — 30, -0.5, 900 */
  title: { fontSize: 30, letterSpacing: -0.5, fontWeight: '900' as const },
  /** Section heading — 24, 900 */
  heading: { fontSize: 24, fontWeight: '900' as const },
  /** Sub heading — 20, 900 */
  subheading: { fontSize: 20, fontWeight: '900' as const, letterSpacing: -0.5 },
  /** Content body — 18, 700 */
  body: { fontSize: 18, fontWeight: '700' as const },
  /** Secondary body — 16, 700 */
  bodySecondary: { fontSize: 16, fontWeight: '700' as const },
  /** Caption — 14, 500 */
  caption: { fontSize: 14, fontWeight: '500' as const },
  /** Label — 10, 900, uppercase, letterSpacing 2 */
  label: { fontSize: 10, fontWeight: '900' as const, textTransform: 'uppercase' as const, letterSpacing: 2 },
  /** Badge — 9, 900, uppercase */
  badge: { fontSize: 9, fontWeight: '900' as const, textTransform: 'uppercase' as const, letterSpacing: 2 },
} as const;

export const BUTTON = {
  primary: { height: 64, borderRadius: 24, fontSize: 20, fontWeight: '900' as const },
  secondary: { height: 56, borderRadius: 20, fontSize: 14, fontWeight: '900' as const, letterSpacing: 2 },
  ghost: { height: 48, borderRadius: 16, fontSize: 14, fontWeight: '700' as const },
  pill: { height: 40, borderRadius: 20, fontSize: 13, fontWeight: '700' as const },
} as const;

export const RADIUS = {
  sm: 8, md: 16, lg: 24, xl: 32, xxl: 40, xxxl: 48, max: 56,
} as const;

export const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, xxxxl: 40,
} as const;

export const SHADOWS = {
  sm: { boxShadow: '0px 4px 12px rgba(0,0,0,0.2)', elevation: 5 },
  md: { boxShadow: '0px 10px 20px rgba(0,0,0,0.3)', elevation: 10 },
  glow: (color: string) => ({ boxShadow: `0px 10px 20px ${color}66`, elevation: 8 }),
} as const;
