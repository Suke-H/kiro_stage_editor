import { describe, expect, it } from 'vitest';
import panelListReducer, { panelListSlice } from '@/store/slices/panel-list-slice';
import { Panel } from '@/types/panel';

describe('panelListSlice', () => {
  const flagPanel: Panel = {
    id: 'flag-panel',
    cells: [['Flag']],
    type: 'Flag',
  };

  const normalPanel: Panel = {
    id: 'normal-panel',
    cells: [['Black']],
    type: 'Normal',
  };

  const createState = () => {
    const initialState = panelListReducer(undefined, { type: 'init' });
    return panelListReducer(initialState, panelListSlice.actions.loadPanels([flagPanel, normalPanel]));
  };

  it('returns an uncollected Flag panel on reset', () => {
    let state = createState();
    state = panelListReducer(state, panelListSlice.actions.placePanel(flagPanel));

    state = panelListReducer(state, panelListSlice.actions.reset());

    expect(state.panels.map(({ id }) => id)).toEqual(['flag-panel', 'normal-panel']);
    expect(state.removedPanels).toEqual([]);
  });

  it('does not return a collected Flag panel on reset', () => {
    let state = createState();
    state = panelListReducer(state, panelListSlice.actions.placePanel(flagPanel));
    state = panelListReducer(state, panelListSlice.actions.collectPlacedFlag());
    state = panelListReducer(state, panelListSlice.actions.placePanel(normalPanel));

    state = panelListReducer(state, panelListSlice.actions.reset());

    expect(state.panels.map(({ id }) => id)).toEqual(['normal-panel']);
    expect(state.removedPanels).toHaveLength(1);
    expect(state.removedPanels[0].isCollected).toBe(true);
  });

  it('does not return a collected Flag panel on undo', () => {
    let state = createState();
    state = panelListReducer(state, panelListSlice.actions.placePanel(flagPanel));
    state = panelListReducer(state, panelListSlice.actions.collectPlacedFlag());

    state = panelListReducer(state, panelListSlice.actions.undo());

    expect(state.panels.map(({ id }) => id)).toEqual(['normal-panel']);
    expect(state.removedPanels).toHaveLength(1);
  });

  it('returns a collected Flag panel on resetAll', () => {
    let state = createState();
    state = panelListReducer(state, panelListSlice.actions.placePanel(flagPanel));
    state = panelListReducer(state, panelListSlice.actions.collectPlacedFlag());

    state = panelListReducer(state, panelListSlice.actions.resetAll());

    expect(state.panels.map(({ id }) => id)).toEqual(['flag-panel', 'normal-panel']);
    expect(state.removedPanels).toEqual([]);
  });
});
