import { describe, it, expect } from 'vitest';
import { placePanels } from '@/logic/panels';
import { Panel } from '@/types/panel';
import { PanelPlacement } from '@/types/panel-placement';
import { gridFrom } from './test-utils';

describe('panel placement logic', () => {
  const blackPanel: Panel = {
    id: 'test-panel',
    cells: [
      ['Black', 'White'],
      ['White', 'Black'],
    ],
  };

  const simpleBlackPanel: Panel = {
    id: 'simple-panel',
    cells: [['Black']],
  };

  const invertPanel: Panel = {
    id: 'invert-panel',
    cells: [['InvertCell']],
    type: 'Invert',
  };

  describe('placement validity', () => {
    it('can place on Normal(front)', () => {
      const grid = gridFrom(['S...', '....', '...G']);

      const placement: PanelPlacement = {
        panel: simpleBlackPanel,
        highlight: { x: 0, y: 0 },
        point: { x: 1, y: 1 },
      };

      const [resultGrid, success] = placePanels(grid, [placement]);
      expect(success).toBe(true);
      expect(resultGrid[1][1].side).toBe('back');
    });

    it('can place on Normal(back)', () => {
      const grid = gridFrom(['S...', '.x..', '...G']);

      const placement: PanelPlacement = {
        panel: simpleBlackPanel,
        highlight: { x: 0, y: 0 },
        point: { x: 1, y: 1 },
      };

      const [, success] = placePanels(grid, [placement]);
      expect(success).toBe(true);
    });

    it('cannot place on Empty', () => {
      const grid = gridFrom(['S...', '.#..', '...G']);

      const placement: PanelPlacement = {
        panel: simpleBlackPanel,
        highlight: { x: 0, y: 0 },
        point: { x: 1, y: 1 },
      };

      const [, success] = placePanels(grid, [placement]);
      expect(success).toBe(false);
    });

    it('cannot place out of bounds', () => {
      const grid = gridFrom(['S..', '...', '..G']);

      const placement: PanelPlacement = {
        panel: blackPanel,
        highlight: { x: 0, y: 0 },
        point: { x: 2, y: 2 },
      };

      const [, success] = placePanels(grid, [placement]);
      expect(success).toBe(false);
    });
  });

  describe('side flip', () => {
    it('front to back', () => {
      const grid = gridFrom(['S...', '....', '...G']);

      const placement: PanelPlacement = {
        panel: simpleBlackPanel,
        highlight: { x: 0, y: 0 },
        point: { x: 1, y: 1 },
      };

      const [resultGrid, success] = placePanels(grid, [placement]);
      expect(success).toBe(true);
      expect(resultGrid[1][1].side).toBe('back');
    });

    it('back to front', () => {
      const grid = gridFrom(['S...', '....', '...G']);
      grid[1][1] = { type: 'Normal', side: 'back' };

      const placement: PanelPlacement = {
        panel: simpleBlackPanel,
        highlight: { x: 0, y: 0 },
        point: { x: 1, y: 1 },
      };

      const [resultGrid, success] = placePanels(grid, [placement]);
      expect(success).toBe(true);
      expect(resultGrid[1][1].side).toBe('front');
    });

    it('neutral is not changed', () => {
      const grid = gridFrom(['S...', '....', '...G']);

      const placement: PanelPlacement = {
        panel: simpleBlackPanel,
        highlight: { x: 0, y: 0 },
        point: { x: 0, y: 0 },
      };

      const [, success] = placePanels(grid, [placement]);
      expect(success).toBe(false);
    });
  });

  describe('Invert panel', () => {
    it('turns a Normal(front) cell into InvertCell', () => {
      const grid = gridFrom(['S...', '....', '...G']);

      const placement: PanelPlacement = {
        panel: invertPanel,
        highlight: { x: 0, y: 0 },
        point: { x: 1, y: 1 },
      };

      const [resultGrid, success] = placePanels(grid, [placement]);
      expect(success).toBe(true);
      expect(resultGrid[1][1].type).toBe('InvertCell');
      expect(resultGrid[1][1].side).toBe('front');
    });
  });

  describe('multiple placements', () => {
    it('applies panels in sequence', () => {
      const grid = gridFrom(['S....', '.....', '.....', '....G']);

      const placements: PanelPlacement[] = [
        {
          panel: simpleBlackPanel,
          highlight: { x: 0, y: 0 },
          point: { x: 1, y: 1 },
        },
        {
          panel: simpleBlackPanel,
          highlight: { x: 0, y: 0 },
          point: { x: 3, y: 2 },
        },
      ];

      const [resultGrid, success] = placePanels(grid, placements);
      expect(success).toBe(true);
      expect(resultGrid[1][1].side).toBe('back');
      expect(resultGrid[2][3].side).toBe('back');
    });

    it('fails if one placement is invalid', () => {
      const grid = gridFrom(['S...', '....', '..G.']);

      const placements: PanelPlacement[] = [
        {
          panel: simpleBlackPanel,
          highlight: { x: 0, y: 0 },
          point: { x: 1, y: 1 },
        },
        {
          panel: simpleBlackPanel,
          highlight: { x: 0, y: 0 },
          point: { x: 0, y: 0 },
        },
      ];

      const [, success] = placePanels(grid, placements);
      expect(success).toBe(false);
    });
  });

  describe('mutate option', () => {
    it('does not mutate original when false', () => {
      const originalGrid = gridFrom(['S...', '....', '...G']);

      const placement: PanelPlacement = {
        panel: simpleBlackPanel,
        highlight: { x: 0, y: 0 },
        point: { x: 1, y: 1 },
      };

      const [resultGrid, success] = placePanels(originalGrid, [placement], false);
      expect(success).toBe(true);
      expect(resultGrid[1][1].side).toBe('back');
      expect(originalGrid[1][1].side).toBe('front');
    });

    it('mutates original when true', () => {
      const originalGrid = gridFrom(['S...', '....', '...G']);

      const placement: PanelPlacement = {
        panel: simpleBlackPanel,
        highlight: { x: 0, y: 0 },
        point: { x: 1, y: 1 },
      };

      const [resultGrid, success] = placePanels(originalGrid, [placement], true);
      expect(success).toBe(true);
      expect(resultGrid[1][1].side).toBe('back');
      expect(originalGrid[1][1].side).toBe('back');
      expect(resultGrid).toBe(originalGrid);
    });
  });
});
