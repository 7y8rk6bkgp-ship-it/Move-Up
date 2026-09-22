/** Small helpers to author simple anatomical shapes as literal SVG <path> `d` strings. */

export function ellipsePath(cx: number, cy: number, rx: number, ry: number): string {
  return `M ${cx - rx},${cy} a ${rx},${ry} 0 1,0 ${rx * 2},0 a ${rx},${ry} 0 1,0 ${-rx * 2},0 Z`
}

/** A vertical capsule (rounded-rect limb segment) between two y-values at a given center x / half-width. */
export function capsulePath(cx: number, yTop: number, yBottom: number, halfWidth: number): string {
  const r = halfWidth
  return `M ${cx - r},${yTop + r}
    a ${r},${r} 0 0 1 ${r * 2},0
    L ${cx + r},${yBottom - r}
    a ${r},${r} 0 0 1 ${-r * 2},0
    Z`
}

/** A soft rounded blob (chest/lat/glute style) via a quadratic-curve quadrilateral. */
export function blobPath(
  x: number,
  y: number,
  width: number,
  height: number,
  roundness = 0.5,
): string {
  const rx = width * roundness
  const ry = height * roundness
  return `M ${x},${y + ry}
    Q ${x},${y} ${x + rx},${y}
    L ${x + width - rx},${y}
    Q ${x + width},${y} ${x + width},${y + ry}
    L ${x + width},${y + height - ry}
    Q ${x + width},${y + height} ${x + width - rx},${y + height}
    L ${x + rx},${y + height}
    Q ${x},${y + height} ${x},${y + height - ry}
    Z`
}
