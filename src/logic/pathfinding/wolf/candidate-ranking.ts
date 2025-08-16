import { Candidate } from '../types';

/**
 * オオカミ用の候補ソート処理
 * 優先度: 経路長（短い順） → ゴール種類（本物ゴール優先）
 */
export const rankWolfCandidates = (candidates: Candidate[]): Candidate[] => {
  return candidates.sort((a, b) => {
    // 第一優先: 経路長（短い順）
    if (a.path.length !== b.path.length) {
      return a.path.length - b.path.length;
    }
    // 第二優先: 種類（本物ゴール優先: kind 0 < kind 1）
    return a.kind - b.kind;
  });
};