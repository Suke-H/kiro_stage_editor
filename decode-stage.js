// 問題のステージをデコードして確認
const stageParams = "cells=h6w6geeeeeeewwgeeewwweeswdeeeeeeeeeeeeeee&panels=h2w2gbbwb_h2w2gbwbb_c-h1w1gb_c-h1w1gb&mode=play";

console.log("ステージパラメータを分析:");
console.log("cells:", stageParams.match(/cells=([^&]+)/)?.[1]);
console.log("panels:", stageParams.match(/panels=([^&]+)/)?.[1]);

// セルの詳細
const cellsEncoded = "h6w6geeeeeeewwgeeewwweeswdeeeeeeeeeeeeeee";
const height = cellsEncoded.match(/h(\d+)/)?.[1];
const width = cellsEncoded.match(/w(\d+)/)?.[1];
const gridData = cellsEncoded.match(/g(.+)/)?.[1];

console.log("\nグリッド詳細:");
console.log(`高さ: ${height}, 幅: ${width}`);
console.log(`グリッドデータ: ${gridData}`);

// グリッドを可視化
console.log("\nグリッド可視化:");
for (let y = 0; y < height; y++) {
  let row = "";
  for (let x = 0; x < width; x++) {
    const char = gridData[y * width + x];
    row += char;
  }
  console.log(`行${y}: ${row}`);
}

// パネルの詳細
const panelsEncoded = "h2w2gbbwb_h2w2gbwbb_c-h1w1gb_c-h1w1gb";
const panels = panelsEncoded.split("_");
console.log("\nパネル詳細:");
panels.forEach((panel, i) => {
  const iscut = panel.startsWith("c-");
  const panelData = iscut ? panel.slice(2) : panel;
  const h = panelData.match(/h(\d+)/)?.[1];
  const w = panelData.match(/w(\d+)/)?.[1]; 
  const g = panelData.match(/g(.+)/)?.[1];
  console.log(`パネル${i}: ${iscut ? "Cut" : "Normal"} h${h}w${w} データ:${g}`);
});