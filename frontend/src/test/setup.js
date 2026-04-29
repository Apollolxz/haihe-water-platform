import '@testing-library/jest-dom/vitest';

const canvasContext = {
  arc: () => {},
  beginPath: () => {},
  bezierCurveTo: () => {},
  clearRect: () => {},
  closePath: () => {},
  createLinearGradient: () => ({ addColorStop: () => {} }),
  createPattern: () => null,
  createRadialGradient: () => ({ addColorStop: () => {} }),
  drawImage: () => {},
  fill: () => {},
  fillRect: () => {},
  fillText: () => {},
  getImageData: () => ({ data: [] }),
  lineTo: () => {},
  measureText: (text) => ({ width: String(text || '').length * 8 }),
  moveTo: () => {},
  putImageData: () => {},
  quadraticCurveTo: () => {},
  rect: () => {},
  restore: () => {},
  rotate: () => {},
  save: () => {},
  scale: () => {},
  setLineDash: () => {},
  setTransform: () => {},
  stroke: () => {},
  strokeRect: () => {},
  strokeText: () => {},
  transform: () => {},
  translate: () => {},
};

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  configurable: true,
  value: () => canvasContext,
});
