const COLORS = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7',
  '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
  '#009688', '#4caf50', '#8bc34a', '#cddc39',
  '#ffc107', '#ff9800', '#ff5722', '#795548'
]

export function getColorFromPubkey(pubkey: string): string {
  let hash = 0
  for (let i = 0; i < pubkey.length; i++) {
    hash = pubkey.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

export function generateAvatarSvg(pubkey: string, size: number = 40): string {
  const color = getColorFromPubkey(pubkey)
  const shortKey = pubkey.slice(0, 2).toUpperCase()

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="${color}" rx="${size / 5}"/>
    <text x="50%" y="50%" fill="white" font-family="system-ui, sans-serif" font-size="${size * 0.4}" font-weight="600" text-anchor="middle" dominant-baseline="central">${shortKey}</text>
  </svg>`
}

export function getAvatarDataUrl(pubkey: string, size: number = 40): string {
  const svg = generateAvatarSvg(pubkey, size)
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
