import type { Grid } from "@/types/grid";
import type { Panel, CopyPanel } from "@/types/panel";
import type { PanelPlacement, PhasedSolution } from "@/types/panel-placement";

// solutions を返す直前に通すだけ
export const filterDuplicateSolutions = (
  solutions: PhasedSolution[]
): PhasedSolution[] => {
  const seen = new Set<string>();
  const out: PhasedSolution[] = [];
  for (const s of solutions) {
    const k = makeSolutionKey(s);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(s);
  }
  return out;
};

// Normal 判定
const isNormal = (p: Panel | CopyPanel): p is Panel =>
  p.type === "Normal";

// 「同じパネル、同じ場所」かを識別するキー
const placementKey = (pl: PanelPlacement): string => {
  const pid = "id" in pl.panel ? pl.panel.id : "no-id";
  return `${pid}@${pl.point.x},${pl.point.y}`;
};

// Normal だけの連続ブロックを検出し、その内部は順序を潰して正規化する
const normalizePlacements = (seq: PanelPlacement[]): PanelPlacement[] => {
  const out: PanelPlacement[] = [];
  let normalBlock: PanelPlacement[] = [];

  const flush = () => {
    if (normalBlock.length === 0) return;
    const sorted = [...normalBlock].sort((a, b) =>
      placementKey(a).localeCompare(placementKey(b))
    );
    out.push(...sorted);
    normalBlock = [];
  };

  for (const pl of seq) {
    if (isNormal(pl.panel)) {
      normalBlock.push(pl);
    } else {
      flush();
      out.push(pl); // 非 Normal は順序そのまま
    }
  }
  flush();
  return out;
};

// 解（複数フェーズ）をキー化：
//  - 各フェーズの placements は Normal ブロック正規化後に placementKey の列へ
//  - 最終盤面（final grid）もキーに入れて衝突確率を下げる
const makeSolutionKey = (sol: PhasedSolution): string => {
  const phaseKeys = sol.phases.map((placements) => {
    const norm = normalizePlacements(placements);
    return norm.map(placementKey).join("|");
  });

  const finalGrid: Grid =
    sol.phaseGrids?.length
      ? sol.phaseGrids[sol.phaseGrids.length - 1].after
      : sol.phaseHistory[sol.phaseHistory.length - 1];

  const finalGridKey = JSON.stringify(finalGrid);

  return `${finalGridKey}::${phaseKeys.join("||")}`;
};




