import { Grid } from '@/types/grid';
import { Panel } from '@/types/panel';
import { PanelPlacement } from '@/types/panel-placement';

export type SolveResponse = {
  placements: PanelPlacement[];
};

export const PlaySolveAsync = async (
  grid: Grid,
  panels: Panel[]
): Promise<SolveResponse | null> => {
  try {
    const res = await fetch('/api/solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grid, panels }),
    });

    if (!res.ok) {
      // 404＝解なしをハンドリング
      if (res.status === 404) {
        alert('クリア可能な配置は見つかりませんでした');
        return null;
      }
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const json: SolveResponse = await res.json();
    console.log('Solve placements:', json.placements);
    return json;
  } catch (err) {
    console.error('Solve API error:', err);
    alert('通信エラーが発生しました');
    return null;
  }
};
