import { CellType, Panel } from '@/components/types';

export const exportStageToJson = ( 
    grid: CellType[][], 
    panels: Panel[] 
) => {
    const stageData = {
      rows: grid.length,
      cols: grid[0].length,
      cells: grid,
      panels: panels,
    };
    const jsonString = JSON.stringify(stageData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stage.json';
    link.click();
  };
  
export const importStageFromJson = (
    event: React.ChangeEvent<HTMLInputElement>,
    setGrid: (grid: CellType[][]) => void,
    setPanels: (panels: Panel[]) => void
) => {
  const file = event.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const stageData = JSON.parse(e.target?.result as string);
      setGrid(stageData.cells);
      setPanels(stageData.panels || []);
    };
    reader.readAsText(file);
  }
};