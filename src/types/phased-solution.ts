import { PanelPlacement } from './panel-placement';

/**
 * フェーズ対応のソルバー解
 */
export interface PhasedSolution {
  /** フェーズごとの配置リスト */
  phases: PanelPlacement[][];
}