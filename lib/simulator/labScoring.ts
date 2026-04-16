export interface LabMetrics {
  timeSpent: number;
  fuelConsumed: number;
  logicalDistance: number;
  blockCount: number;
}

export function calculateLabScore(studentMetrics: LabMetrics, adminMetrics?: LabMetrics): number {
  const benchmarks = adminMetrics || {
    timeSpent: studentMetrics.timeSpent * 0.8,
    fuelConsumed: studentMetrics.fuelConsumed * 0.8,
    logicalDistance: studentMetrics.logicalDistance * 0.8,
    blockCount: Math.max(1, studentMetrics.blockCount - 2),
  };

  const calc = (mine: number, target: number) =>
    Math.min(25, Math.max(0, (target / (mine || 1)) * 25));

  const scores = {
    time: Math.round(calc(studentMetrics.timeSpent, benchmarks.timeSpent)),
    fuel: Math.round(calc(studentMetrics.fuelConsumed, benchmarks.fuelConsumed)),
    dist: Math.round(calc(studentMetrics.logicalDistance, benchmarks.logicalDistance)),
    blocks: Math.round(calc(studentMetrics.blockCount, benchmarks.blockCount)),
  };

  return scores.time + scores.fuel + scores.dist + scores.blocks;
}

export function getRankDetails(totalScore: number) {
  if (totalScore >= 95) return { label: 'S', color: 'text-yellow-400', bg: 'bg-yellow-500', glow: 'rgba(234,179,8,0.5)', desc: 'BẬC THẦY PHI CÔNG' };
  if (totalScore >= 80) return { label: 'A', color: 'text-emerald-400', bg: 'bg-emerald-500', glow: 'rgba(16,185,129,0.5)', desc: 'XUẤT SẮC' };
  if (totalScore >= 60) return { label: 'B', color: 'text-sky-400', bg: 'bg-sky-500', glow: 'rgba(14,165,233,0.5)', desc: 'HOÀN THÀNH TỐT' };
  return { label: 'C', color: 'text-orange-400', bg: 'bg-orange-500', glow: 'rgba(249,115,22,0.5)', desc: 'CẦN CẢI THIỆN' };
}
