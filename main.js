'use strict';

//裏(仮想)表示
let vcan = document.createElement("canvas");
let vcon = vcan.getContext("2d");

//HTML表示
let can = document.getElementById("can");
let con = can.getContext("2d");

//裏画面のサイズ
vcan.width = SCREEN_SIZE_W;
vcan.height = SCREEN_SIZE_H;

//実画面のサイズ(3倍にする)
can.width = SCREEN_SIZE_W * 3;
can.height = SCREEN_SIZE_H * 3;

//アップコンバートにならないようにする(拡大画像のぼやきをなくす)
//ブラウザによってプロパティは変化するため複数で指定している
con.mozimageSmoothingEnabled = false;
con.msimageSmoothingEnabled = false;
con.webkitimageSmoothingEnabled = false;
con.imageSmoothingEnabled = false;

//フレーム維持
let frameCount = 0;
let startTime;

//画像のオブジェクト生成
let chImg = new Image();
//画像読み込み
chImg.src = "sprite.png";
//画像の読み込みができたら関数が呼ばれる
//chImg.onload = draw;


//キーボード
let keyb = {};

//おじさん情報

//おじさんをつくる
let ojisan = new Ojisan(100, 100);

/* //座標
//小数を出さなくするためにビットシフトで4ずらしている(最後に4ビット戻している)
let oji_x = 100<<4;
let oji_y = 100<<4;

//慣性(加速度)をつける
let oji_vx = 0;
let oji_vy = 0;
//現在のスプライト番号
let oji_anime = 0;
//スプライト番号(アニメーション振り分け)
let oji_sprite = 48;
//アニメーション番号
let oji_acount = 0;
//おじさんの方向
let oji_dir = 0;
//ジャンプフラグ
let oji_jump = 0; */

//フィールドを作る
let field = new Field();

//ブロックのオブジェクト
let block = []; //いくつか不明なため中身は空
let item = [];

function updateObj(obj)
{
    //スプライトのブロック表示
    for (let i = obj.length - 1; i >= 0; i--) {
        obj[i].update();
        if (obj[i].kill) obj.splice(i, 1); //kill = true なら配列から一個消す
    }
}

//更新処理
function update(){
    //マップの更新
    field.update();

    updateObj(block);
    updateObj(item);

    //スプライトのブロック表示
    for (let i = block.length -1; i >= 0; i--) {
        block[i].update();
        if(block[i].kill) block.splice(i,1); //kill = true なら配列から一個消す
    }

    //おじさんの更新
    ojisan.update();
}

function drawSprite(snum, x, y){
    let sx = (snum & 15) * 16;
    let sy = (snum >> 4) * 16;
    /*
    AND演算子について
    15: 0000 0000 ~ 0000 1111
    必ず最後は1111

    つまり
    例)
    snum:0001 0100 //20
    15  :0000 1111 //15
    AND :0000 0100 //4

    ANDはsnumを16で割った余りになる
    */

    //画像をコンテキストにコピーするメソッド(仮想画面に書いている)
    vcon.drawImage(chImg, sx /*x座標 */ , sy /*y座標 */ , 16 /*横サイズ */ , 32 /*縦サイズ */ ,
        /*vconのどこに表示するか？*/
        x /*x座標 */ , y /*y座標 */ , 16 /*横サイズ */ , 32 /*縦サイズ */ ); //画像の左上から16×32をコピーする
}

function drawObj(obj)
{
    //スプライトのブロック表示
    for (let i = 0; i < obj.length; i++) {
        obj[i].draw();
    }
}
//描画処理
function draw(){
    //vcan.getContext()に備わっているプロパティ(fillStyle)とメソッド(fillRect)
    //RGB(色)の指定:水色でクリア
    vcon.fillStyle = "#66AAFF";
    //四角を書く
    vcon.fillRect(0, 0, SCREEN_SIZE_W, SCREEN_SIZE_H);

    //マップの表示
    field.draw();

    drawObj(block);
    drawObj(item);

    //おじさんの表示
    ojisan.draw();

    //デバッグ情報の表示
    vcon.font = "20px 'Impact' ";
    vcon.fillStyle = "#FFF";
    //テキストの描画(フレーム値の表示)
    vcon.fillText( /*表示する文字 */ "FRAME:" + frameCount, /*x座標*/10, /*y座標*/20);

    //仮想画面のものを実画面に拡大転送している
    con.drawImage(vcan, 0 /*x座標 */ , 0 /*y座標 */ , SCREEN_SIZE_W /*横サイズ */ , SCREEN_SIZE_H /*縦サイズ */ ,/*conのどこに表示するか？*/
        0 /*x座標 */ , 0 /*y座標 */ , SCREEN_SIZE_W * 3 /*横サイズ */ , SCREEN_SIZE_H * 3 /*縦サイズ */ ); //画像の左上から16×32をコピーする
}

//毎秒60フレームで読み込みされる(繰り返し呼ばれる)　欠点:ブラウザ開始と同時に実行される、正確に1000/60カウントされない
//setInterval (mainLoop, 1000/60);

//HTMLが読み終わったら関数呼び出し(ループ開始)
window.onload = function (){
    startTime = performance.now(); //起動してから何分経ったか代入(ミリ秒)
    mainLoop();
}


//メインループ
function mainLoop(){
    let nowTime = performance.now();

    //nowTimeとstartTimeの差分がGAME_FPSより大きければ1代入
    let nowFrame = (nowTime - startTime)/ GAME_FPS;

    //60フレームになるように調整
    if(nowFrame > frameCount){
        let c = 0;
        //処理落ち対応
        while(nowFrame > frameCount){
            frameCount++;
            //更新処理
            update();
            //4倍速でupdate()を行っている
            if(++c >= 4) break;
        }
        //描画処理
        draw();
    }

    requestAnimationFrame(mainLoop);
}


//キーボードを押されたら
document.onkeydown = function (e){
    //連想配列を作る
    if (e.keyCode == 37) keyb.Left =true;
    if (e.keyCode == 39) keyb.Right = true;
    if (e.keyCode == 90) keyb.BBOTTON = true; //XボタンがBBOTTON
    if (e.keyCode == 88) keyb.ABUTTON = true;

    if(e.keyCode == 65){
        block.push(new Block(368, 5, 5));
    }
    //画面スクロール用
    /* if (e.keyCode == 65) field.scx--; //Aボタン
    if (e.keyCode == 83) field.scx++; //Sボタン */
}

//キーボードを離したら
document.onkeyup = function (e) {
    //trueの持続を
    if (e.keyCode == 37) keyb.Left = false;
    if (e.keyCode == 39) keyb.Right = false;
    if (e.keyCode == 90) keyb.BBOTTON = false;
    if (e.keyCode == 88) keyb.ABUTTON = false;
}



