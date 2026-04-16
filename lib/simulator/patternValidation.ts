import { MapObject } from "@/types/lab";
import { CANVAS_CENTER, WORLD_SCALE_VALUE, ALTITUDE_SCALE } from "@/lib/config3D/simConfig";

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface FlightValidationResult {
  success: boolean;
  shape: "square" | "rectangle" | "unknown";
  corners: number;
  anglesValid: boolean;
  sideLengthsValid: boolean;
  closedLoop: boolean;
  score: number;
  totalCompletion: number;
  reasons: string[];
  segments: any[];
}


export function simplifyPath(path: Point3D[], tolerance: number = 5): Point3D[] {
  if (path.length < 3) return path;

  const simplified: Point3D[] = [path[0]];
  let lastPoint = path[0];

  for (let i = 1; i < path.length - 1; i++) {
    const dist = Math.sqrt(
      (path[i].x - lastPoint.x) ** 2 +
      (path[i].z - lastPoint.z) ** 2
    );

    if (dist > tolerance) {
      simplified.push(path[i]);
      lastPoint = path[i];
    }
  }

  simplified.push(path[path.length - 1]);
  return simplified;
}

export function calculateAngle(p1: Point3D, p2: Point3D, p3: Point3D): number {
  const v1 = { x: p1.x - p2.x, z: p1.z - p2.z };
  const v2 = { x: p3.x - p2.x, z: p3.z - p2.z };

  const dot = v1.x * v2.x + v1.z * v2.z;
  const mag1 = Math.sqrt(v1.x ** 2 + v1.z ** 2);
  const mag2 = Math.sqrt(v2.x ** 2 + v2.z ** 2);

  if (mag1 === 0 || mag2 === 0) return 0;

  const cos = dot / (mag1 * mag2);
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}

export function detectCorners(vertices: Point3D[], angleTolerance: number = 25): number[] {
  const corners: number[] = [];
  if (vertices.length < 3) return corners;

  for (let i = 1; i < vertices.length - 1; i++) {
    const angle = calculateAngle(vertices[i - 1], vertices[i], vertices[i + 1]);

    if (angle > 90 - angleTolerance && angle < 90 + angleTolerance) {
      corners.push(i);
    }
  }

  return corners;
}


function pointToSegmentDistance(p: { x: number, y: number, z: number }, a: { x: number, y: number, z: number }, b: { x: number, y: number, z: number }): number {
  const vx = b.x - a.x;
  const vy = b.y - a.y;
  const vz = b.z - a.z;
  const wx = p.x - a.x;
  const wy = p.y - a.y;
  const wz = p.z - a.z;

  const dot = wx * vx + wy * vy + wz * vz;
  const lenSq = vx * vx + vy * vy + vz * vz;

  if (lenSq === 0) return Math.sqrt(wx * wx + wy * wy + wz * wz);

  let t = dot / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projX = a.x + t * vx;
  const projY = a.y + t * vy;
  const projZ = a.z + t * vz;

  return Math.sqrt((p.x - projX) ** 2 + (p.y - projY) ** 2 + (p.z - projZ) ** 2);
}

export function validateShape(
  pathHistory: Point3D[],
  targetObj: MapObject,
  isSquare: boolean = true,
  canvasCenter?: { x: number; y: number }
): FlightValidationResult {
  const reasons: string[] = [];
  const result: FlightValidationResult = {
    success: false,
    shape: isSquare ? "square" : "rectangle",
    corners: 0,
    anglesValid: true,
    sideLengthsValid: true,
    closedLoop: false,
    score: 0,
    totalCompletion: 0,
    segments: [],
    reasons: []
  };

  if (pathHistory.length < 2) {
    result.reasons = ["Chưa có dữ liệu bay."];
    return result;
  }

  const center = canvasCenter || CANVAS_CENTER;
  const toWorld = (p: Point3D) => {
    return {
      x: (p.x - center.x) * WORLD_SCALE_VALUE,
      y: p.y * ALTITUDE_SCALE,
      z: (p.z - center.y) * WORLD_SCALE_VALUE
    };
  };

  const worldPath = pathHistory.map(toWorld);
  const targetPos = { x: targetObj.position[0], y: targetObj.position[1], z: targetObj.position[2] };
  const targetScale = targetObj.scale || [100, 0, 100];
  const sx = targetScale[0];
  const sz = targetScale[2];

  const cy = targetPos.y;
  const C0 = { x: targetPos.x - sx / 2, y: cy, z: targetPos.z - sz / 2 };
  const C1 = { x: targetPos.x + sx / 2, y: cy, z: targetPos.z - sz / 2 };
  const C2 = { x: targetPos.x + sx / 2, y: cy, z: targetPos.z + sz / 2 };
  const C3 = { x: targetPos.x - sx / 2, y: cy, z: targetPos.z + sz / 2 };

  const WAYPOINT_THRESHOLD = 7;
  const TRACK_THRESHOLD = 7;
  const MIN_ON_TRACK_PCT = 0.7;

  const checkSequence = (cornerOrder: { x: number, y: number, z: number }[]) => {
    let firstFoundCornerIdx = -1;
    let firstFoundPathIdx = -1;

    for (let i = 0; i < worldPath.length; i++) {
      const p = worldPath[i];
      for (let j = 0; j < 4; j++) {
        const distSq = (p.x - cornerOrder[j].x) ** 2 + (p.y - cornerOrder[j].y) ** 2 + (p.z - cornerOrder[j].z) ** 2;
        if (distSq < WAYPOINT_THRESHOLD * WAYPOINT_THRESHOLD) {
          firstFoundCornerIdx = j;
          firstFoundPathIdx = i;
          break;
        }
      }
      if (firstFoundCornerIdx !== -1) break;
    }

    if (firstFoundCornerIdx === -1) return { corners: 0, segmentPass: [false, false, false, false], closed: false };

    const sequence = [];
    for (let k = 0; k < 5; k++) {
      sequence.push(cornerOrder[(firstFoundCornerIdx + k) % 4]);
    }

    let searchFrom = firstFoundPathIdx;
    const matchPathIndices: number[] = [firstFoundPathIdx];
    const segmentResults: boolean[] = [false, false, false, false];

    for (let k = 0; k < 4; k++) {
      const startNode = sequence[k];
      const endNode = sequence[k + 1];
      let foundNextIdx = -1;

      for (let i = searchFrom + 1; i < worldPath.length; i++) {
        const p = worldPath[i];
        const distSq = (p.x - endNode.x) ** 2 + (p.y - endNode.y) ** 2 + (p.z - endNode.z) ** 2;
        if (distSq < WAYPOINT_THRESHOLD * WAYPOINT_THRESHOLD) {
          foundNextIdx = i;
          break;
        }
      }

      if (foundNextIdx !== -1) {
        let onTrackCount = 0;
        const segmentPoints = worldPath.slice(searchFrom, foundNextIdx + 1);

        for (const p of segmentPoints) {
          const d = pointToSegmentDistance(p, startNode, endNode);
          if (d < TRACK_THRESHOLD) onTrackCount++;
        }

        const onTrackPct = onTrackCount / segmentPoints.length;
        if (onTrackPct >= MIN_ON_TRACK_PCT) {
          segmentResults[k] = true;
          matchPathIndices.push(foundNextIdx);
          searchFrom = foundNextIdx;
        } else {

          break;
        }
      } else {
        break;
      }
    }

    const cornersReached = segmentResults.filter(r => r).length;
    const globalStartCornerIdx = cornerOrder === CW_ARRAY ? firstFoundCornerIdx : (firstFoundCornerIdx === 0 ? 0 : 4 - firstFoundCornerIdx);

    return {
      corners: cornersReached,
      segmentPass: segmentResults,
      closed: segmentResults[3],
      startCornerIdx: globalStartCornerIdx
    };
  };

  const CW_ARRAY = [C0, C1, C2, C3];
  const CCW_ARRAY = [C0, C3, C2, C1];
  const resCW = checkSequence(CW_ARRAY);
  const resCCW = checkSequence(CCW_ARRAY);

  const isCCW = resCCW.corners > resCW.corners;
  const best = isCCW ? resCCW : resCW;

  result.corners = best.corners;
  result.closedLoop = best.closed;
  result.success = best.closed;

  if (result.corners < 1) {
    reasons.push("Bạn chưa bay tới góc nào của hình mẫu mục tiêu.");
  } else if (result.corners < 4) {
    reasons.push("Vệt bay chưa đi qua đủ 4 cạnh hoặc bay lệch quá xa hình mẫu.");
  } else if (!result.closedLoop) {
    reasons.push("Vệt bay đúng hướng nhưng chưa quay về điểm bắt đầu để khép kín hình.");
  }

  result.reasons = reasons;
  result.score = result.success ? 100 : (result.corners * 25);
  result.totalCompletion = result.score / 100;

  (result as any).startCornerIdx = best.startCornerIdx;
  (result as any).isCCW = isCCW;
  (result as any).segmentPass = best.segmentPass;

  result.segments = best.segmentPass.map((passed, i) => ({
    index: i + 1,
    completion: passed ? 1 : 0,
    passed: passed
  }));

  return result;
}


export function validateFlightPattern(
  pathHistory: Point3D[],
  patternObj: MapObject,
  canvasCenter?: { x: number; y: number }
): FlightValidationResult {
  const shape = patternObj.shape;

  if (shape === "square") {
    const res = validateShape(pathHistory, patternObj, true, canvasCenter);
    return res;
  }

  return {
    success: pathHistory.length > 20,
    shape: shape as any,
    corners: 0,
    anglesValid: true,
    sideLengthsValid: true,
    closedLoop: true,
    score: 100,
    totalCompletion: 1,
    segments: [{ index: 1, completion: 1, passed: true }],
    reasons: []
  };
}

export const validatePattern = (path: Point3D[], obj: MapObject, canvasCenter?: { x: number; y: number }) => {
  const res = validateFlightPattern(path, obj, canvasCenter);
  return {
    pass: res.success,
    progress: res.totalCompletion * 100,
    result: res
  };
};
