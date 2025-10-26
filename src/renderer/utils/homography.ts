import { Vec2 } from '@shared/types';

/**
 * Calculate homography matrix using Direct Linear Transform (DLT)
 * Maps 4 source points to 4 destination points
 */
export function calculateHomography(src: Vec2[], dst: Vec2[]): Float32Array {
  if (src.length !== 4 || dst.length !== 4) {
    throw new Error('Homography requires exactly 4 point pairs');
  }

  // Build the matrix A for DLT algorithm
  const A: number[][] = [];

  for (let i = 0; i < 4; i++) {
    const x = src[i].x;
    const y = src[i].y;
    const X = dst[i].x;
    const Y = dst[i].y;

    // First row: -x, -y, -1, 0, 0, 0, x*X, y*X, X
    A.push([-x, -y, -1, 0, 0, 0, x * X, y * X, X]);
    // Second row: 0, 0, 0, -x, -y, -1, x*Y, y*Y, Y
    A.push([0, 0, 0, -x, -y, -1, x * Y, y * Y, Y]);
  }

  // Solve Ah = 0 using SVD
  const h = solveSVD(A);

  // Return as 3x3 matrix in column-major order for WebGL
  return new Float32Array([
    h[0], h[3], h[6],
    h[1], h[4], h[7],
    h[2], h[5], h[8]
  ]);
}

/**
 * Solve homogeneous linear system using SVD
 * Find h such that Ah = 0
 */
function solveSVD(A: number[][]): number[] {
  // For a proper implementation, we would use a full SVD library
  // For now, we'll use a simplified approach using pseudo-inverse

  const At = transpose(A);
  const AtA = multiply(At, A);

  // Find eigenvector corresponding to smallest eigenvalue
  // This is a simplified version - in production use a proper linear algebra library
  const eigenvector = findSmallestEigenvector(AtA);

  // Normalize so that h[8] = 1
  const scale = eigenvector[8] || 1;
  return eigenvector.map(v => v / scale);
}

function transpose(A: number[][]): number[][] {
  const rows = A.length;
  const cols = A[0].length;
  const At: number[][] = [];

  for (let j = 0; j < cols; j++) {
    At[j] = [];
    for (let i = 0; i < rows; i++) {
      At[j][i] = A[i][j];
    }
  }

  return At;
}

function multiply(A: number[][], B: number[][]): number[][] {
  const rowsA = A.length;
  const colsA = A[0].length;
  const colsB = B[0].length;
  const C: number[][] = [];

  for (let i = 0; i < rowsA; i++) {
    C[i] = [];
    for (let j = 0; j < colsB; j++) {
      C[i][j] = 0;
      for (let k = 0; k < colsA; k++) {
        C[i][j] += A[i][k] * B[k][j];
      }
    }
  }

  return C;
}

/**
 * Simplified eigenvector finder using power iteration
 * In production, use a proper numerical library like numeric.js or ml-matrix
 */
function findSmallestEigenvector(A: number[][]): number[] {
  const n = A.length;
  let v = new Array(n).fill(0);
  v[n - 1] = 1; // Start with last basis vector

  // Inverse power iteration to find smallest eigenvalue
  for (let iter = 0; iter < 100; iter++) {
    // Apply inverse (approximated by transpose for symmetric matrices)
    const newV = new Array(n).fill(0);

    // Simple Gauss-Seidel iteration as approximation
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          sum += A[i][j] * v[j];
        }
      }
      newV[i] = -sum / (A[i][i] || 1);
    }

    // Normalize
    const norm = Math.sqrt(newV.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
      v = newV.map(val => val / norm);
    }
  }

  return v;
}

/**
 * Apply homography transformation to a point
 */
export function transformPoint(point: Vec2, homography: Float32Array): Vec2 {
  const x = point.x;
  const y = point.y;

  // Apply homography matrix (in column-major order)
  const w = homography[6] * x + homography[7] * y + homography[8];
  const tx = (homography[0] * x + homography[1] * y + homography[2]) / w;
  const ty = (homography[3] * x + homography[4] * y + homography[5]) / w;

  return { x: tx, y: ty };
}

/**
 * Calculate inverse homography for reverse transformation
 */
export function invertHomography(h: Float32Array): Float32Array {
  // Calculate determinant
  const det =
    h[0] * (h[4] * h[8] - h[5] * h[7]) -
    h[1] * (h[3] * h[8] - h[5] * h[6]) +
    h[2] * (h[3] * h[7] - h[4] * h[6]);

  if (Math.abs(det) < 1e-10) {
    console.warn('Homography matrix is singular');
    return new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  }

  // Calculate adjugate matrix
  const adj = new Float32Array([
    h[4] * h[8] - h[5] * h[7],
    h[2] * h[7] - h[1] * h[8],
    h[1] * h[5] - h[2] * h[4],
    h[5] * h[6] - h[3] * h[8],
    h[0] * h[8] - h[2] * h[6],
    h[2] * h[3] - h[0] * h[5],
    h[3] * h[7] - h[4] * h[6],
    h[1] * h[6] - h[0] * h[7],
    h[0] * h[4] - h[1] * h[3]
  ]);

  // Divide by determinant
  return adj.map(v => v / det) as Float32Array;
}

/**
 * Create a perspective transform for preview
 */
export function createPerspectiveTransform(
  corners: Vec2[],
  width: number,
  height: number
): Float32Array {
  const src = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height }
  ];

  return calculateHomography(src, corners);
}

/**
 * Bilinear interpolation for smooth warping
 */
export function bilinearInterpolate(
  corners: Vec2[],
  u: number,
  v: number
): Vec2 {
  // corners order: top-left, top-right, bottom-right, bottom-left
  const p00 = corners[0];
  const p10 = corners[1];
  const p11 = corners[2];
  const p01 = corners[3];

  const x =
    (1 - u) * (1 - v) * p00.x +
    u * (1 - v) * p10.x +
    u * v * p11.x +
    (1 - u) * v * p01.x;

  const y =
    (1 - u) * (1 - v) * p00.y +
    u * (1 - v) * p10.y +
    u * v * p11.y +
    (1 - u) * v * p01.y;

  return { x, y };
}