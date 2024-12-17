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
    <Card className="w-64">
      <CardHeader>
        <CardTitle>セル種類</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {(Object.keys(CELL_TYPES) as CellType[]).map((type) => (
          <Button
            key={type}
            variant={selectedCellType === type ? 'default' : 'outline'}
            className={`${CELL_TYPES[type].color} text-white`}
            onClick={() => onCellTypeChange(type)}
          >
            {CELL_TYPES[type].label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};