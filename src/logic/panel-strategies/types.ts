import { Grid } from '@/types/grid';
import { Panel, CopyPanel } from '@/types/panel';

/**
 * パネル配置・適用のStrategy Interface
 */
export interface IPanelStrategy {
  /**
   * 指定された位置にパネルを配置できるかを判定する
   */
  canPlace(grid: Grid, rowIdx: number, colIdx: number, panel: Panel | CopyPanel): boolean;

  /**
   * パネルの効果を適用する
   * @returns [変更後Grid, 作成されたCopyPanel（Cutの場合のみ）]
   */
  applyEffect(grid: Grid, rowIdx: number, colIdx: number, panel: Panel | CopyPanel): [Grid, CopyPanel?];
}