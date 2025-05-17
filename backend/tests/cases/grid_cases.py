from typing import List
from models.grid import GridCellKey, Side, Grid, GridCell
from models.path import Result

CHARMAP = {
    "S": (GridCellKey.Start,     Side.neutral),
    "G": (GridCellKey.Goal,      Side.neutral),
    "D": (GridCellKey.DummyGoal, Side.neutral),
    "C": (GridCellKey.Crow,      Side.neutral),
    "#": (GridCellKey.Empty,     Side.neutral),
    ".": (GridCellKey.Normal,    Side.front),
    "x": (GridCellKey.Normal,    Side.back),
}

# テストケースの ID
test_ids=[
        "01_no_gimmick_goal",
        "02_no_gimmick_no_path",
        "03_dummy_near_real_goal",
        "04_dummy_near_dummy_goal",
        "05_dummy_equal_length",
        "06_crow_get",
        "07_crow_skip",
        "08_crow_get_and_real_goal",
        "09_crow_skip_and_dummy_goal",
        "10_crow_get_and_dummy_goal",
        "11_multi_crow_all_get_and_goal",
        "12_multi_crow_none_get_and_real_goal",
        "13_multi_crow_one_get_and_real_goal",
        "14_multi_crow_none_get_and_dummy_goal",
        "15_multi_crow_one_get_and_dummy_goal",
        "16_multi_crow_all_get_and_dummy_goal",
        "17_multi_crow_all_get_and_real_goal",
        "18_multi_crow_one_get_and_real_goal",
    ]

grid_test_cases = [
    # (lines, exp_result, exp_dummy, exp_crows)  
        # 1) ギミックなし：ゴール（クリア）
        ([
            "###G#",
            "#xx..",
            "#x.x.",
            "S.x..",
            "#...#",
        ], Result.HasClearPath, False, 0),

        # 2) ギミックなし：道がない
        ([
            "###G#",
            "#.x..",
            "#x.x.",
            "S.xx.",
            "#...#",
        ], Result.NoPath, False, 0),

        # 3) ダミーゴールあり：本物ゴールが近い（クリア）
        ([
            ".....G",
            ".x..xx",
            "DxS..#",
        ], Result.HasClearPath, False, 0),

        # 4) ダミーゴールあり：ダミーゴールが近い
        ([
            ".....G",
            "....xx",
            "D.S..#",
        ], Result.HasFailPath, True, 0),

        # 5) ダミーゴールあり：同じ長さ（クリア）
        ([
            "S..",
            ".xG",
            ".D.",
        ], Result.HasClearPath, False, 0),

        # 6) カラス：通る（クリア）
        ([
            "C....",
            ".xx.G",
            "..#x.",
            "#.Sx#",
        ], Result.HasClearPath, False, 1),

        # 7) カラス：通らない
        ([
            "C....",
            "....G",
            "..#..",
            "#.S.#",
        ], Result.HasFailPath, False, 0),

        # 8) ダミー＋カラス：カラスを通り本物ゴール（クリア）
        ([
            "S..",
            ".xD",
            "CG.",
        ], Result.HasClearPath, False, 1),

        # 9) ダミー＋カラス：ダミーのみ行く
        ([
            "S.D",
            ".x.",
            "CG.",
        ], Result.HasFailPath, True, 0),

        # 10) ダミー＋カラス：カラスを通りダミーゴール
        ([
            "S.C",
            ".xD",
            "..G",
        ], Result.HasFailPath, True, 1),

        # 11) 複数カラス：全て通りゴール（クリア）
        ([
            "C.SxG",
            ".xxC.",
            "....x",
        ], Result.HasClearPath, False, 2),

        # 12) 複数カラス：1つも通らずゴール
        ([
            "C.S.G",
            "...C.",
            ".....",
        ], Result.HasFailPath, False, 0),

        # 13) 複数カラス：1つだけ通りゴール
        ([
            "C.SxG",
            "..xC.",
            ".....",
        ], Result.HasFailPath, False, 1),

        # 14) 複数カラス：1つも通らずダミーゴール
        ([
            "G....",
            ".xxx.",
            "DxCxC",
            ".xxx."
            "S....",
        ], Result.HasFailPath, True, 0),

        # 15) 複数カラス：1つだけ通りダミーゴール
        ([
            "G....",
            ".xxx.",
            "D.CxC",
            "xx.x."
            "S....",
        ], Result.HasFailPath, True, 1),

        # 16) 複数カラス：全て通りダミーゴール
        ([
            "G....",
            ".xxx.",
            "D.C.C",
            "xxxx."
            "S....",
        ], Result.HasFailPath, True, 2),

        # 17) 複数カラス：全て通り本物ゴール（クリア）
        ([
            "G....",
            "xx.xx",
            "DxC.C",
            "xxxx."
            "S....",
        ], Result.HasClearPath, True, 2),

        # 18) 複数カラス：1つだけ通り本物ゴール
        ([
            "G....",
            ".xxx.",
            "DxCxC",
            "xxxx."
            "S....",
        ], Result.HasFailPath, True, 2),
    ]

