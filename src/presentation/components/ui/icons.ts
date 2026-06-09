/**
 * Icon registry — inner SVG markup ported verbatim from the design's icons.jsx.
 * Each entry is rendered inside a 24×24 viewBox stroke icon by <AppIcon>.
 */
export interface IconDef {
  inner: string;
  /** stroke width override (default 1.75) */
  sw?: number;
}

export const ICONS: Record<string, IconDef> = {
  dashboard: { inner: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>' },
  doctors: { inner: '<path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M5 21a7 7 0 0 1 14 0"/><path d="M12 14v3M10.5 15.5h3"/>' },
  services: { inner: '<path d="M11 3 4 7v6c0 4.5 3 7.5 7 8 4-.5 7-3.5 7-8V7l-7-4Z"/><path d="M9.5 11.5h5M12 9v5"/>' },
  locations: { inner: '<path d="M12 21s-6.5-5.5-6.5-10a6.5 6.5 0 0 1 13 0c0 4.5-6.5 10-6.5 10Z"/><circle cx="12" cy="11" r="2.4"/>' },
  appointments: { inner: '<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 3v3M16 3v3M8.5 13.5l2 2 4-4"/>' },
  users: { inner: '<circle cx="9" cy="8" r="3.4"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3.4 3.4 0 0 1 0 6.4M18 14.2a5.5 5.5 0 0 1 3.5 5.1"/>' },
  search: { inner: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>' },
  bell: { inner: '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/>' },
  plus: { inner: '<path d="M12 5v14M5 12h14"/>' },
  edit: { inner: '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="M14.5 7.5l3 3"/>', sw: 1.7 },
  trash: { inner: '<path d="M4 7h16M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2M6 7l1 12.5A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5L18 7"/>', sw: 1.7 },
  power: { inner: '<path d="M12 4v8M7.5 7a7 7 0 1 0 9 0"/>' },
  check: { inner: '<path d="m5 12.5 4.5 4.5L19 7"/>' },
  x: { inner: '<path d="M6 6l12 12M18 6 6 18"/>' },
  chevR: { inner: '<path d="m9 6 6 6-6 6"/>' },
  chevD: { inner: '<path d="m6 9 6 6 6-6"/>' },
  arrowUp: { inner: '<path d="M12 19V5M6 11l6-6 6 6"/>', sw: 2 },
  arrowDn: { inner: '<path d="M12 5v14M6 13l6 6 6-6"/>', sw: 2 },
  trendUp: { inner: '<path d="M3 17l6-6 4 4 8-8M21 11V7h-4"/>', sw: 2 },
  calendar: { inner: '<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 3v3M16 3v3"/>' },
  cash: { inner: '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>' },
  heart: { inner: '<path d="M12 20s-7-4.6-7-9.5A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7 3.5C19 15.4 12 20 12 20Z"/>' },
  clock: { inner: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 1.8"/>' },
  phone: { inner: '<path d="M6.5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4Z"/>', sw: 1.7 },
  mail: { inner: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>', sw: 1.7 },
  building: { inner: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/>' },
  city: { inner: '<path d="M3 21h18M5 21V8l5-3 5 3v13M9 21v-4h2v4M9 11h2M13 11h1.5M9 14h2M13 14h1.5M15 21V13l4 1.5V21"/>' },
  pin: { inner: '<path d="M12 21s-6.5-5.5-6.5-10a6.5 6.5 0 0 1 13 0c0 4.5-6.5 10-6.5 10Z"/><circle cx="12" cy="11" r="2.4"/>' },
  filter: { inner: '<path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z"/>' },
  download: { inner: '<path d="M12 4v10m0 0 4-4m-4 4-4-4M5 18.5h14"/>', sw: 1.7 },
  menu: { inner: '<path d="M4 6h16M4 12h16M4 18h16"/>' },
  user: { inner: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20a7 7 0 0 1 14 0"/>' },
  eye: { inner: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>' },
  stethoscope: { inner: '<path d="M6 4H4.5v5A4.5 4.5 0 0 0 9 13.5 4.5 4.5 0 0 0 13.5 9V4H12"/><path d="M9 13.5V16a4 4 0 0 0 8 0v-2"/><circle cx="18" cy="11" r="2"/>' },
  sparkle: { inner: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/>' },
  dots: { inner: '<circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/>' },
  logout: { inner: '<path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8M17 8l4 4-4 4M21 12H9"/>', sw: 1.7 },
  tooth: { inner: '<path d="M7 3c-2 0-3 1.5-3 4 0 3 1 4 1.5 7S6 21 7.5 21s1.5-3 2-5 1.5-2 2.5-2 2 0 2.5 2 .5 5 2 5 1-4 1.5-7S20 10 20 7c0-2.5-1-4-3-4-1.5 0-2.5 1-4 1S8.5 3 7 3Z"/>' },
  baby: { inner: '<circle cx="12" cy="5.5" r="2.5"/><path d="M8.5 21v-3.5l-2-1.2a3 3 0 0 1 1.2-5.6h4.6a3 3 0 0 1 1.2 5.6L15.5 17.5V21"/><path d="M10.8 6.2h.01M13.2 6.2h.01"/>' },
  brain: { inner: '<path d="M9.5 4.2A2.6 2.6 0 0 0 6.6 7a2.4 2.4 0 0 0-.9 4.4A2.5 2.5 0 0 0 7 16a2.6 2.6 0 0 0 2.5 2.2 1.7 1.7 0 0 0 2.5-1.5V5.8a1.7 1.7 0 0 0-2.5-1.6Z"/><path d="M14.5 4.2A2.6 2.6 0 0 1 17.4 7a2.4 2.4 0 0 1 .9 4.4A2.5 2.5 0 0 1 17 16a2.6 2.6 0 0 1-2.5 2.2 1.7 1.7 0 0 1-2.5-1.5V5.8a1.7 1.7 0 0 1 2.5-1.6Z"/>' },
  ear: { inner: '<path d="M8 9a4 4 0 1 1 7.5 1.9c-1 1.6-2 2.2-2 3.9a2.6 2.6 0 0 1-5 .5"/><path d="M9.6 9a2.2 2.2 0 0 1 3.6 1.7"/>' },
  bone: { inner: '<path d="M10 14l4-4"/><path d="M9.8 10.2 8.6 8.9a2 2 0 1 1 .7-3.3 2 2 0 1 1 3.3 3.3"/><path d="m14.2 13.8 1.2 1.3a2 2 0 1 1-.7 3.3 2 2 0 1 1-3.3-3.3"/>' },
};

export type IconName = keyof typeof ICONS;

export function getIcon(name: string): IconDef {
  return ICONS[name] ?? ICONS.stethoscope;
}
