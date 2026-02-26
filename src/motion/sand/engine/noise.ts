const fract = (value: number) => value - Math.floor(value);

const lerp = (from: number, to: number, amount: number) => {
  return from + (to - from) * amount;
};

const smooth = (t: number) => t * t * (3 - 2 * t);

const hash3 = (x: number, y: number, z: number, seed: number) => {
  let hash = seed ^ Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 2147483647);
  hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
  hash ^= hash >>> 16;
  return ((hash >>> 0) / 4294967296) * 2 - 1;
};

const hash1 = (x: number, seed: number) => {
  let hash = seed ^ Math.imul(x, 1597334677);
  hash = Math.imul(hash ^ (hash >>> 15), 2246822519);
  hash ^= hash >>> 13;
  return ((hash >>> 0) / 4294967296) * 2 - 1;
};

export const valueNoise1D = (x: number, seed: number) => {
  const x0 = Math.floor(x);
  const x1 = x0 + 1;
  const tx = smooth(fract(x));

  return lerp(hash1(x0, seed), hash1(x1, seed), tx);
};

export const valueNoise3D = (x: number, y: number, z: number, seed: number) => {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const z0 = Math.floor(z);

  const x1 = x0 + 1;
  const y1 = y0 + 1;
  const z1 = z0 + 1;

  const tx = smooth(fract(x));
  const ty = smooth(fract(y));
  const tz = smooth(fract(z));

  const c000 = hash3(x0, y0, z0, seed);
  const c100 = hash3(x1, y0, z0, seed);
  const c010 = hash3(x0, y1, z0, seed);
  const c110 = hash3(x1, y1, z0, seed);
  const c001 = hash3(x0, y0, z1, seed);
  const c101 = hash3(x1, y0, z1, seed);
  const c011 = hash3(x0, y1, z1, seed);
  const c111 = hash3(x1, y1, z1, seed);

  const x00 = lerp(c000, c100, tx);
  const x10 = lerp(c010, c110, tx);
  const x01 = lerp(c001, c101, tx);
  const x11 = lerp(c011, c111, tx);

  const y0Mix = lerp(x00, x10, ty);
  const y1Mix = lerp(x01, x11, ty);

  return lerp(y0Mix, y1Mix, tz);
};

export const sampleFlowVector = (
  x: number,
  y: number,
  timeSec: number,
  seed: number,
  spatialScale: number,
  temporalScale: number,
) => {
  const nx = x * spatialScale;
  const ny = y * spatialScale;
  const nz = timeSec * temporalScale;
  const epsilon = 0.55;

  const dnDx = valueNoise3D(nx + epsilon, ny, nz, seed) - valueNoise3D(nx - epsilon, ny, nz, seed);
  const dnDy = valueNoise3D(nx, ny + epsilon, nz, seed) - valueNoise3D(nx, ny - epsilon, nz, seed);

  let flowX = dnDy;
  let flowY = -dnDx;

  const length = Math.hypot(flowX, flowY) || 1;
  flowX /= length;
  flowY /= length;

  return { x: flowX, y: flowY };
};
