import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CellDefinitions } from '../types';
import { CELL_DEFINITIONS } from '../../constants/cell-types';

interface CellTypeSelectorProps {
  selectedCellType: CellDefinitions;
  onCellTypeChange: (type: CellDefinitions) => void;
}

export const CellTypeSelector: React.FC<CellTypeSelectorProps> = ({ 
  selectedCellType, 
  onCellTypeChange 
}) => {
  return (
    <Card className="w-full max-w-32 mx-auto bg-[#B3B9D1]">
      <CardHeader>
        <CardTitle>セル種類</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {(Object.keys(CELL_DEFINITIONS) as CellDefinitions[]).map((type) => (
          <Button
            key={type}
            variant={selectedCellType === type ? 'default' : 'outline'}
            className={`w-full ${CELL_DEFINITIONS[type].color} ${CELL_DEFINITIONS[type].color === "bg-white" ? 'text-black' : 'text-white'} truncate`} // 文字の省略を防止
            onClick={() => onCellTypeChange(type)}
          >
            {CELL_DEFINITIONS[type].label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};
