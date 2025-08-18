// URLデータ解析
const urlParams = "cells=h4w4gcwwewwwgwswwewww&panels=h2w2gbbwb_h1w1gf";

// cellsパラメータ解析
const cellsParam = "h4w4gcwwewwwgwswwewww";
// h4 = height 4, w4 = width 4, g以降がグリッドデータ
const gridData = "cwwewwwgwswwewww";

console.log("グリッド情報:");
console.log("高さ: 4, 幅: 4");
console.log("グリッドデータ:", gridData);

// グリッドを4x4に配置
const grid = [];
for (let i = 0; i < 16; i += 4) {
    const row = gridData.slice(i, i + 4);
    grid.push(row);
}

console.log("\nグリッド配置:");
grid.forEach((row, i) => {
    console.log(`行${i}: ${row}`);
});

// セルタイプの解釈（推定）
// c = ? (何かのセル)
// w = Wall?
// e = Empty?  
// g = Goal?
// s = Start?

console.log("\nセルタイプ推定:");
console.log("c: Crow? Clear?");
console.log("w: Wall or White");  
console.log("e: Empty");
console.log("g: Goal");
console.log("s: Start");

// パネル解析
const panelsParam = "h2w2gbbwb_h1w1gf";
const panel1 = "h2w2gbbwb";  // height 2, width 2, データ bbwb
const panel2 = "h1w1gf";     // height 1, width 1, データ f

console.log("\nパネル情報:");
console.log("パネル1: 2x2, データ: bbwb");
console.log("  b: Black セル");
console.log("  w: White セル");
console.log("パネル2: 1x1, データ: f (Flag)");

// パネル1の形状
console.log("\nパネル1形状 (2x2):");
console.log("bb");
console.log("wb");

console.log("\nパネル2形状 (1x1):");
console.log("f");