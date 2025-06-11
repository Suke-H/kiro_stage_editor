import { Candidate } from './types';

/**
 * 候補にカラス通過数を付与してソート
 */
export const rankCandidates = (candidates: Candidate[], crowPositions: Set<string>): Candidate[] => {
  // 各候補にカラス数を付与
  for (const candidate of candidates) {
    candidate.crowCount = candidate.path.filter(point => 
      crowPositions.has(`${point.x},${point.y}`)
    ).length;
  }
  
  // ソート: 経路長 → 本物ゴール優先 → カラス多い順
  candidates.sort((a, b) => {
    // 経路長で比較
    if (a.path.length !== b.path.length) {
      return a.path.length - b.path.length;
    }
    // 種類で比較（0(real) < 1(dummy) < 2(rest)）
    if (a.kind !== b.kind) {
      return a.kind - b.kind;
    }
    // カラス数で比較（多い順）
    return b.crowCount - a.crowCount;
  });
  
  return candidates;
};