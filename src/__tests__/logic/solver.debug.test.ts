import { describe, it } from 'vitest';
import { exploreSolutions, clearDebugLogs, saveDebugLogsToFile } from '../../logic/solution-explorer';
import { decodeStageFromUrl } from '../../utils/url';

describe('ソルバーデバッグ', () => {
  it('問題ステージのログ出力', () => {
    // ログクリア
    clearDebugLogs();
    
    // 問題のステージをデコード
    const stageData = "cells=h6w6geeeeeeewwgeeewwweeswdeeeeeeeeeeeeeee&panels=h2w2gbbwb_h2w2gbwbb_c-h1w1gb_c-h1w1gb&mode=play";
    const { cells: grid, panels } = decodeStageFromUrl(stageData);
    
    console.log("=== 問題ステージの構成 ===");
    console.log("グリッド:", grid.length, "x", grid[0].length);
    console.log("パネル数:", panels.length);
    panels.forEach((panel, i) => {
      console.log(`パネル${i}: ${panel.type} ${panel.cells.length}x${panel.cells[0].length}`);
    });
    
    console.log("\n=== ソルバー実行開始（反復回数制限あり） ===");
    
    try {
      const startTime = Date.now();
      const solutions = exploreSolutions({
        initialGrid: grid,
        panels: panels,
        findAll: false
      });
      const endTime = Date.now();
      
      console.log("=== ソルバー実行完了 ===");
      console.log(`実行時間: ${endTime - startTime}ms`);
      console.log(`解の数: ${solutions.length}`);
      
      // ログをファイルに保存
      saveDebugLogsToFile('solver-debug-success.log');
      
    } catch (error) {
      console.log("=== ソルバーでエラー発生 ===");
      console.error(error);
      
      // エラー時もログを保存
      saveDebugLogsToFile('solver-debug-error.log');
    }
  });
});