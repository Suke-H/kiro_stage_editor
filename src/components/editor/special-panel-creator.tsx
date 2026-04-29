import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Panel } from "@/types/panel";
import { Button } from "@/components/ui/button";
import { panelListSlice } from "@/store/slices/panel-list-slice";
import { useDispatch } from "react-redux";

import { PanelCellTypeKey } from "@/types/panel";

export const SpecialPanelCreator: React.FC = () => {
  const dispatch = useDispatch();

  const addFlag = () => {
    const flagGrid: PanelCellTypeKey[][] = Array.from({ length: 1 }, () =>
      Array.from({ length: 1 }, () => "Flag")
    );

    const newPanel: Panel = {
      id: `panel-${Date.now()}`,
      cells: flagGrid,
      type: "Flag",
    };

    dispatch(panelListSlice.actions.createPanel(newPanel));
  };

  const addSwap = () => {
    const swapGrid: PanelCellTypeKey[][] = Array.from({ length: 1 }, () =>
      Array.from({ length: 1 }, () => "Swap")
    );

    const newPanel: Panel = {
      id: `panel-${Date.now()}`,
      cells: swapGrid,
      type: "Swap",
    };

    dispatch(panelListSlice.actions.createPanel(newPanel));
  };

  const addInvert = () => {
    const invertGrid: PanelCellTypeKey[][] = Array.from({ length: 1 }, () =>
      Array.from({ length: 1 }, () => "InvertCell")
    );

    const newPanel: Panel = {
      id: `panel-${Date.now()}`,
      cells: invertGrid,
      type: "Invert",
    };

    dispatch(panelListSlice.actions.createPanel(newPanel));
  };

  return (
    <Card className="w-64 bg-[#B3B9D1] md:self-start">
      <CardHeader>
        <CardTitle>特殊パネル作成</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row gap-2">
          <Button onClick={addFlag} className="w-1/3 flex items-center justify-center gap-2">
            旗
          </Button>
          <Button onClick={addSwap} className="w-1/3 flex items-center justify-center gap-2">
            入れ替え
          </Button>
          <Button onClick={addInvert} className="w-1/3 flex items-center justify-center gap-2">
            反転マス
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
