// Garment silhouettes are defined as the RIGHT half (x >= 0), from the neckline centre
// going clockwise down to the hem centre. They get mirrored into a full outline.

export const GARMENTS = {
  tshirt: {
    label: 'T-shirt',
    half: [
      [0, 1.0], [0.16, 1.03], [0.28, 1.11], [0.36, 1.22],
      [0.78, 1.12], [1.38, 0.62], [1.08, 0.24], [0.82, 0.46],
      [0.82, -1.2], [0.4, -1.23], [0, -1.24],
    ],
    rib: { hem: false, cuffs: null },
    details: ['neckRib'],
    defaultMaterial: 'cotton',
  },
  hoodie: {
    label: 'Hoodie',
    half: [
      [0, 0.98], [0.15, 1.01], [0.27, 1.08], [0.34, 1.18],
      [0.84, 1.08], [1.22, 0.4], [1.42, -1.02], [1.12, -1.1],
      [0.98, -0.2], [0.86, 0.36],
      [0.86, -1.28], [0.4, -1.31], [0, -1.32],
    ],
    rib: { hem: 0.16, cuffs: [[1.42, -1.02], [1.12, -1.1]] },
    details: ['pocket', 'strings'],
    hood: true,
    defaultMaterial: 'fleece',
  },
  jacket: {
    label: 'Jacket',
    half: [
      [0, 1.06], [0.14, 1.12], [0.24, 1.26], [0.3, 1.36], [0.4, 1.3],
      [0.88, 1.12], [1.26, 0.42], [1.46, -1.04], [1.14, -1.12],
      [1.0, -0.2], [0.88, 0.36],
      [0.88, -1.26], [0.4, -1.29], [0, -1.3],
    ],
    rib: { hem: 0.12, cuffs: [[1.46, -1.04], [1.14, -1.12]] },
    details: ['zip', 'chestPockets', 'collar'],
    defaultMaterial: 'nylon',
  },
};

export const MATERIALS = {
  cotton:   { label: 'Cotton',   roughness: 0.92, metalness: 0,    sheen: 0.4, clearcoat: 0,   pattern: 'jersey', bump: 0.6 },
  fleece:   { label: 'Fleece',   roughness: 1,    metalness: 0,    sheen: 1,   clearcoat: 0,   pattern: 'knit',   bump: 1.2 },
  denim:    { label: 'Denim',    roughness: 0.85, metalness: 0,    sheen: 0.2, clearcoat: 0,   pattern: 'twill',  bump: 1.6 },
  nylon:    { label: 'Nylon',    roughness: 0.38, metalness: 0,    sheen: 0,   clearcoat: 0.4, pattern: 'ripstop',bump: 0.8 },
  leather:  { label: 'Leather',  roughness: 0.5,  metalness: 0,    sheen: 0,   clearcoat: 0.6, pattern: 'grain',  bump: 1.4 },
  metallic: { label: 'Metallic', roughness: 0.28, metalness: 0.85, sheen: 0,   clearcoat: 0.5, pattern: 'jersey', bump: 0.3 },
};

export const COLORS = [
  '#f5f5f2', '#111214', '#2b2f36', '#8a8f98', '#1f3a5f', '#2f4a3a',
  '#7a1f2b', '#c8a97e', '#e8dcc6', '#d9534f', '#f0b429', '#4a90d9',
];

export const PLACEMENTS = {
  center:   { label: 'Center chest', side: 'front', x: 0,     y: 0.35,  size: 0.7 },
  left:     { label: 'Left chest',   side: 'front', x: 0.38,  y: 0.62,  size: 0.3 },
  full:     { label: 'Full front',   side: 'front', x: 0,     y: -0.05, size: 1.2 },
  back:     { label: 'Back',         side: 'back',  x: 0,     y: 0.3,   size: 1.0 },
};

export function fullOutline(half) {
  const mirrored = half.slice(1, -1).map(([x, y]) => [-x, y]).reverse();
  return [...half, ...mirrored];
}
