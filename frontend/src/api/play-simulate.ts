
import { Grid } from '@/types/grid';
import { PathResult, resultMessages } from '@/types/path';

export const PlaySimulateAsync = async (grid: Grid): Promise<PathResult> => {
  try {
    // Gridを引数にしてAPIを呼び出す
    const response = await fetch('/api/judge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',},
      body: JSON.stringify(grid),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const response_json = await response.json();
    const pathResult: PathResult = response_json.data as PathResult;
    console.log('API疎通確認成功:', pathResult);

    // 対応するResultMessageをポップアップ
    const resultMessage = resultMessages[pathResult.result];
    alert(resultMessage);

    return pathResult;

  } catch (error) {
    console.error('API疎通確認エラー:', error);
    throw error;
  }
}