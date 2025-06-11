import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Panel } from "@/types/panel";
import { Button } from "@/components/ui/button";
import { panelListSlice } from "@/store/slices/panel-list-slice";
import { useDispatch, } from "react-redux";

import { PanelCellTypeKey } from "@/types/panel";


export const FlagCreator: React.FC = () => {
  const dispatch = useDispatch();

  const addFlag = () => {
    // 1セルにFlagがある高さ1幅1のPanelGridを作成
    const flagGrid: PanelCellTypeKey[][] = Array.from({ length: 1 }, () =>
      Array.from({ length: 1 }, () => "Flag")
    );

    const newPanel: Panel = {
      id: `panel-${Date.now()}`,
      cells: flagGrid,
      type: "Flag",
    };

    // パネル追加
    dispatch(panelListSlice.actions.createPanel(newPanel));
  };

  return (
    <Card className="w-64 bg-[#B3B9D1] md:self-start">
      <CardHeader>
        <CardTitle>🚩作成</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={addFlag} className="w-full flex items-center gap-2">
          <Plus size={16} /> 🚩追加
        </Button>
      </CardContent>
    </Card>
  );
};
