import { IPanelStrategy } from "./types";
import { NormalPanelStrategy } from "./normal-strategy";
import { FlagPanelStrategy } from "./flag-strategy";
import { CutPanelStrategy } from "./cut-strategy";
import { PastePanelStrategy } from "./paste-strategy";
import { SwapFirstStrategy } from "./swap-first-strategy";
import { SwapSecondStrategy } from "./swap-second-strategy";

/**
 * パネルタイプに応じたStrategyを取得
 */
export const getStrategy = (panelType?: string): IPanelStrategy => {
  switch (panelType) {
    case "Normal":
    case undefined: // デフォルト
      return new NormalPanelStrategy();
    case "Flag":
      return new FlagPanelStrategy();
    case "Cut":
      return new CutPanelStrategy();
    case "Paste":
      return new PastePanelStrategy();
    case "Swap":
      return new SwapFirstStrategy();
    case "SwapSecond":
      return new SwapSecondStrategy();
    default:
      throw new Error(`Unknown panel type: ${panelType}`);
  }
};