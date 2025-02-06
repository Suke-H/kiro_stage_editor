import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, MinusCircle, Plus } from 'lucide-react';
import { Panel } from '../types';

import { panelSlice } from "../../store/slices/panel-slice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";

// interface NewPanelCreatorProps {
  // newPanelGrid: CellType[][];
  // setNewPanelGrid: React.Dispatch<React.SetStateAction<CellType[][]>>;
  // panels: Panel[];
  // setPanels: React.Dispatch<React.SetStateAction<Panel[]>>;
// }

export const NewPanelCreator: React.FC = (
  // newPanelGrid,
  // setNewPanelGrid,
  // panels,
  // setPanels,
) => {
    const dispatch = useDispatch();
    const newPanelGrid = useSelector((state: RootState) => state.panel.newPanelGrid);

    // const adjustNewPanelGridSize = (rowDelta: number, colDelta: number) => {
    //   setNewPanelGrid((prevGrid) => {
    //     const newRows = prevGrid.length + rowDelta;
    //     const newCols = prevGrid[0].length + colDelta;

    //     if (newRows > 0 && newCols > 0) {
    //       if (rowDelta > 0) {
    //         return [...prevGrid, ...Array(rowDelta).fill(Array(newCols).fill('White'))];
    //       } else if (rowDelta < 0) {
    //         return prevGrid.slice(0, newRows).map((row) => row.slice(0, newCols));
    //       }

    //       return prevGrid.map((row) => {
    //         if (colDelta > 0) {
    //           return [...row, ...Array(colDelta).fill('White')];
    //         } else if (colDelta < 0) {
    //           return row.slice(0, newCols);
    //         }
    //         return row;
    //       });
    //     }
    //     return prevGrid;
    //   });
    // };

    // const handleNewPanelCellClick = (rowIndex: number, colIndex: number) => {
    //   const newPanelGridCopy = newPanelGrid.map((row) => [...row]);
    //   newPanelGridCopy[rowIndex][colIndex] = newPanelGridCopy[rowIndex][colIndex] === 'Black' ? 'White' : 'Black';
    //   setNewPanelGrid(newPanelGridCopy);
    // };
  
    const addPanel = () => {
      const nonEmptyCells = newPanelGrid.some((row) => row.some((cell) => cell === 'Black'));
      if (nonEmptyCells) {
        const newPanel: Panel = {
          id: `panel-${Date.now()}`,
          cells: newPanelGrid,
        };
        // setPanels([...panels, newPanel]);
        dispatch(panelSlice.actions.createPanel(newPanel));
        // setNewPanelGrid(Array(3).fill(null).map(() => Array(3).fill('White')));
        dispatch(panelSlice.actions.initPanelGrid());
      }
    };

  return (
    <Card className="w-64 bg-[#B3B9D1]">
      <CardHeader>
        <CardTitle>パネル追加</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Button 
            onClick={() => dispatch(panelSlice.actions.addToPanelGridRow())} 
            className="flex items-center gap-2"
          >
            <PlusCircle size={16} /> 行追加
          </Button>
          <Button 
            onClick={() => dispatch(panelSlice.actions.removeFromPanelGridRow())} 
            className="flex items-center gap-2"
          >
            <MinusCircle size={16} /> 行削除
          </Button>
          <Button 
            onClick={() => dispatch(panelSlice.actions.addToPanelGridCol())} 
            className="flex items-center gap"
          >
            <PlusCircle size={16} /> 列追加
          </Button>
          <Button 
            onClick={() => dispatch(panelSlice.actions.removeFromPanelGridCol())} 
            className="flex items-center gap-2"
          >
            <MinusCircle size={16} /> 列削除
          </Button>
        </div>
        <div
          className="grid mb-4"
          style={{
            gridTemplateColumns: `repeat(${newPanelGrid[0].length}, 40px)`,
            gap: '4px',
          }}
        >
          {newPanelGrid.map((row, rowIndex) =>
            row.map((cellType, colIndex) => (
              <div
                key={`new-${rowIndex}-${colIndex}`}
                className={`h-10 w-10 border ${
                  cellType === 'Black' ? 'bg-gray-500' : 'bg-white'
                }`}
                onClick={() => dispatch(panelSlice.actions.clickToPanelGridCell({ row: rowIndex, col: colIndex }))}
              />
            )),
          )}
        </div>
        <Button onClick={addPanel} className="w-full flex items-center gap-2">
          <Plus size={16} /> パネル追加
        </Button>
      </CardContent>
    </Card>
  );
};