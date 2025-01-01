import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CellType } from '../types';
import { CELL_TYPES } from '../../constants/cell-types';

interface CellTypeSelectorProps {
  selectedCellType: CellType;
  onCellTypeChange: (type: CellType) => void;
}

export const CellTypeSelector: React.FC<CellTypeSelectorProps> = ({ 
  selectedCellType, 
  onCellTypeChange 
}) => {
  return (
    <Card className="w-full max-w-32 mx-auto">
      <CardHeader>
        <CardTitle>セル種類</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {(Object.keys(CELL_TYPES) as CellType[]).map((type) => (
          <Button
            key={type}
            variant={selectedCellType === type ? 'default' : 'outline'}
            className={`w-full ${CELL_TYPES[type].color} ${type === 'white' ? 'text-black' : 'text-white'} truncate`} // 文字の省略を防止
            onClick={() => onCellTypeChange(type)}
          >
            {CELL_TYPES[type].label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};
