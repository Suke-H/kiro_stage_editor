import { PanelInventory } from '@/types/panel-inventory';
import { Panel } from '@/types/panel';

export const createPanelInventory = (panels: Panel[]): PanelInventory => ({
  panels: [...panels],
  removedPanels: [],
});

export const placePanelInInventory = (inventory: PanelInventory, panel: Panel): PanelInventory => {
  const index = inventory.panels.findIndex((availablePanel) => availablePanel.id === panel.id);
  if (index === -1) return inventory;

  return {
    panels: inventory.panels.filter((_, panelIndex) => panelIndex !== index),
    removedPanels: [...inventory.removedPanels, { panel, index, isCollected: false }],
  };
};

export const collectPlacedFlagInInventory = (inventory: PanelInventory): PanelInventory => {
  let collected = false;
  const removedPanels = inventory.removedPanels.map((removedPanel) => {
    if (collected || removedPanel.panel.type !== 'Flag' || removedPanel.isCollected) return removedPanel;
    collected = true;
    return { ...removedPanel, isCollected: true };
  });

  return { panels: [...inventory.panels], removedPanels };
};

export const undoPanelPlacementInInventory = (inventory: PanelInventory): PanelInventory => {
  for (let historyIndex = inventory.removedPanels.length - 1; historyIndex >= 0; historyIndex--) {
    const removedPanel = inventory.removedPanels[historyIndex];
    if (removedPanel.isCollected) continue;

    const panels = [...inventory.panels];
    panels.splice(removedPanel.index, 0, removedPanel.panel);
    return {
      panels,
      removedPanels: inventory.removedPanels.filter((_, index) => index !== historyIndex),
    };
  }

  return inventory;
};

export const resetPanelInventory = (inventory: PanelInventory): PanelInventory => {
  const panels = [...inventory.panels];
  const collectedPanels = [];

  for (let index = inventory.removedPanels.length - 1; index >= 0; index--) {
    const removedPanel = inventory.removedPanels[index];
    if (removedPanel.isCollected) {
      collectedPanels.unshift(removedPanel);
      continue;
    }
    panels.splice(removedPanel.index, 0, removedPanel.panel);
  }

  return { panels, removedPanels: collectedPanels };
};

export const resetAllPanelInventory = (inventory: PanelInventory): PanelInventory => {
  const panels = [...inventory.panels];
  for (let index = inventory.removedPanels.length - 1; index >= 0; index--) {
    const removedPanel = inventory.removedPanels[index];
    panels.splice(removedPanel.index, 0, removedPanel.panel);
  }
  return { panels, removedPanels: [] };
};
