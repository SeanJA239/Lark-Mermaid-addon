/**
 * Convert an SVG string to a PNG data URL via canvas.
 * Renders at 2x for retina sharpness, caps display width at MAX_WIDTH.
 */
export interface ImageResult {
  dataUrl: string;
  width: number;
  height: number;
}

const MAX_WIDTH = 500;
const CANVAS_SCALE = 2;

export function svgToDataUrl(svgString: string): Promise<ImageResult> {
  return new Promise((resolve, reject) => {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgEl = svgDoc.documentElement;

    let width = parseFloat(svgEl.getAttribute('width') || '0');
    let height = parseFloat(svgEl.getAttribute('height') || '0');

    const viewBox = svgEl.getAttribute('viewBox');
    if (viewBox && (!width || !height)) {
      const parts = viewBox.split(/[\s,]+/);
      if (parts.length === 4) {
        width = parseFloat(parts[2]) || 800;
        height = parseFloat(parts[3]) || 600;
      }
    }

    if (!width) width = 800;
    if (!height) height = 600;

    // Cap display size
    if (width > MAX_WIDTH) {
      const ratio = MAX_WIDTH / width;
      height = Math.round(height * ratio);
      width = MAX_WIDTH;
    }

    svgEl.setAttribute('width', String(width));
    svgEl.setAttribute('height', String(height));
    const serializer = new XMLSerializer();
    const fixedSvg = serializer.serializeToString(svgEl);

    const svgBase64 = btoa(unescape(encodeURIComponent(fixedSvg)));
    const svgDataUrl = `data:image/svg+xml;base64,${svgBase64}`;

    const img = new Image();
    img.onload = () => {
      // Render at 2x pixels for retina sharpness
      const canvas = document.createElement('canvas');
      canvas.width = width * CANVAS_SCALE;
      canvas.height = height * CANVAS_SCALE;

      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(CANVAS_SCALE, CANVAS_SCALE);
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/png');
      // Return display dimensions (not canvas dimensions)
      resolve({ dataUrl, width, height });
    };

    img.onerror = () => {
      reject(new Error('Failed to load SVG as image'));
    };

    img.src = svgDataUrl;
  });
}
