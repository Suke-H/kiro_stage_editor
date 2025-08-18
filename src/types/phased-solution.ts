import { PanelPlacement } from './panel-placement';
import { Grid } from './grid';

/**
 * フェーズ対応のソルバー解
 */
export interface PhasedSolution {
  /** フェーズごとの配置リスト */
  phases: PanelPlacement[][];
  /** フェーズごとの初期グリッド履歴 */
  phaseHistory: Grid[];
}