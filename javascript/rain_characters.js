
const chars_numbers_notMirrored = new Array("0", "1", "7");
const chars_numbers_mirrored = new Array("2", "3", "4", "5", "8", "9");
const chars_other = new Array("ç", "Z", ":", "・", ".", "\"", "=", "*", "+", "-", "<", ">", "¦", "｜", "╌", " ");
const chars_half_katakana = new Array(
    "ﾊ", "ﾐ", "ﾋ", "ｰ", "ｳ", "ｼ", "ﾅ", "ﾓ",
    "ﾆ", "ｻ", "ﾜ", "ﾂ", "ｵ", "ﾘ", "ｱ", "ﾎ",
    "ﾃ", "ﾏ", "ｹ", "ﾒ", "ｴ", "ｶ", "ｷ", "ﾑ",
    "ﾕ", "ﾗ", "ｾ", "ﾈ", "ｽ", "ﾀ", "ﾇ", "ﾍ"
);
const chars_full_katakana = new Array(
    "ハ", "ミ", "ヒ", "ー", "ウ", "シ", "ナ", "モ",
    "ニ", "サ", "ワ", "ツ", "オ", "リ", "ア", "ホ",
    "テ", "マ", "ケ", "メ", "エ", "カ", "キ", "ム",
    "ユ", "ラ", "セ", "ネ", "ス", "タ", "ヌ", "ヘ"
);
const chars_full_katakana_UnicodeCodePoint = new Array(
    "ハ", "ミ", "ヒ", "ー", "ウ", "シ", "ナ", "モ",
    "ニ", "サ", "ワ", "ツ", "オ", "リ", "ア", "ホ",
    "テ", "マ", "ケ", "メ", "エ", "カ", "キ", "ム",
    "ユ", "ラ", "セ", "ネ", "ス", "タ", "ヌ", "ヘ"
);
const chars_kanji = "日";

/*
Half-Width Katakana (Half-width kana, Hankaku kana)
and
Katakana

in-code:
ﾊ ﾐ ﾋ ｰ ｳ ｼ ﾅ ﾓ ﾆ ｻ ﾜ ﾂ ｵ ﾘ ｱ ﾎ ﾃ ﾏ ｹ ﾒ ｴ ｶ ｷ ﾑ ﾕ ﾗ ｾ ﾈ ｽ ﾀ ﾇ ﾍ
ハミヒーウシナモニ サワツオリアホテマケ メエカキムユラセネスタヌヘ

left-out:
ｦ ｲ ｸ ｺ ｿ ﾁ ﾄ ﾉ ﾌ ﾔ ﾖ ﾙ ﾚ ﾛ ﾝ
ヲイクコソチトノフヤヨルレロン

remaining full-width:
U+30Ax	゠	ァ	 	ィ	 	ゥ	 	ェ	 	ォ	 	 	ガ	 	ギ	 
U+30Bx	グ	 	ゲ	 	ゴ	 	ザ	 	ジ	 	ズ	 	ゼ	 	ゾ	 
U+30Cx	ダ	 	ヂ	ッ	 	ヅ	 	デ	 	ド	 	 	 	 	 	 
U+30Dx	バ	パ	 	ビ	ピ	 	ブ	プ	 	ベ	ペ	 	ボ	ポ	 	 
U+30Ex	 	 	 	ャ	 	ュ	 	ョ	 	 	 	 	 	 	ヮ	 
U+30Fx	ヰ	ヱ	 	 	ヴ	ヵ	ヶ	ヷ	ヸ	ヹ	ヺ	・	 	ヽ	ヾ	ヿ
*/
/*
Half-Width Katakana
J	U	0	1	2	3	4	5	6	7	8	9	A	B	C	D	E	F
A	FF6	 	｡	｢	｣	､	･	ｦ	ｧ	ｨ	ｩ	ｪ	ｫ	ｬ	ｭ	ｮ	ｯ
B	FF7	ｰ	ｱ	ｲ	ｳ	ｴ	ｵ	ｶ	ｷ	ｸ	ｹ	ｺ	ｻ	ｼ	ｽ	ｾ	ｿ
C	FF8	ﾀ	ﾁ	ﾂ	ﾃ	ﾄ	ﾅ	ﾆ	ﾇ	ﾈ	ﾉ	ﾊ	ﾋ	ﾌ	ﾍ	ﾎ	ﾏ
D	FF9	ﾐ	ﾑ	ﾒ	ﾓ	ﾔ	ﾕ	ﾖ	ﾗ	ﾘ	ﾙ	ﾚ	ﾛ	ﾜ	ﾝ	ﾞ	ﾟ
*/
/*
Full-Width Katakana
        0   1   2   3   4  5   6   7   8  9   A   B   C   D   E   F
U+30Ax	゠	ァ	ア	ィ	イ	ゥ	ウ	ェ	エ	ォ	オ	カ	ガ	キ	ギ	ク
U+30Bx	グ	ケ	ゲ	コ	ゴ	サ	ザ	シ	ジ	ス	ズ	セ	ゼ	ソ	ゾ	タ
U+30Cx	ダ	チ	ヂ	ッ	ツ	ヅ	テ	デ	ト	ド	ナ	ニ	ヌ	ネ	ノ	ハ
U+30Dx	バ	パ	ヒ	ビ	ピ	フ	ブ	プ	ヘ	ベ	ペ	ホ	ボ	ポ	マ	ミ
U+30Ex	ム	メ	モ	ャ	ヤ	ュ	ユ	ョ	ヨ	ラ	リ	ル	レ	ロ	ヮ	ワ
U+30Fx	ヰ	ヱ	ヲ	ン	ヴ	ヵ	ヶ	ヷ	ヸ	ヹ	ヺ	・	ー	ヽ	ヾ	ヿ
*/
