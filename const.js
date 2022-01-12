'use strict';
//
//定数定義用
//

const GAME_FPS = 1000 / 60; //FPS

//スクリーンの縦と横(ファミコンのピクセル数)
const SCREEN_SIZE_W = 256; //横
const SCREEN_SIZE_H = 224; //縦

//マップサイズ　一画面当たりのブロックの数
const MAP_SIZE_W = SCREEN_SIZE_W / 16;
const MAP_SIZE_H = SCREEN_SIZE_H / 16;

//マップデータのブロックの数
const FIELD_SIZE_W = 256;
const FIELD_SIZE_H = 14;


//
//スプライトの基本クラス
//

class Sprite
{
    constructor(sp, x, y, vx, vy)
    {
        this.sp = sp;
        this.x = x <<8;
        this.y = y <<8;

        //空白判定
        this.ay = 0;

        this.w = 16;
        this.h = 16;
        this.vx = vx;
        this.vy = vy;
        this.sz = 0;
        this.kill = false;
        this.count = 0;
    }

    //
    //当たり判定
    //
    checkHit(obj) { //thisとobjの比較
        //物体1
        let left1 = (this.x >> 4) + 2; //横判定を緩くするために+2
        let right1 = left1 + this.w - 4; //左側から横幅を足す
        let top1 = (this.y >> 4) + 5 + this.ay; //縦判定を緩くするため+5
        let bottom1 = top1 + this.h - 7; //上側から高さを足す
        //物体2
        let left2 = (obj.x >> 4) + 2; //横判定を緩くするために+2
        let right2 = left2 + obj.w - 4; //左側から横幅を足す
        let top2 = (obj.y >> 4) + 5 + obj.ay; //縦判定を緩くするため+5
        let bottom2 = top2 + obj.h - 7; //上側から高さを足す

        return (
            left1 <= right2 &&
            right1 >= left2 && //ここまでの条件で横が重なっている
            top1 <= bottom2 &&
            bottom1 >= top2); //ここまで満たせばtrue
    }

    //更新処理
    update()
    {
        //tyが0じゃないときはおじさんの移動と一緒
        if (this.vy < 64) this.vy += GRAVITY;
        this.x += this.vx;
        this.y += this.vy;

        //画面外になったら表示を消す
        if ((this.y >> 4) > FIELD_SIZE_H * 16) this.kill = true;
    }

    //描画処理
    draw()
    {
        let an = this.sp;

        //ブロック一つの描画
        let sx = (an & 15) << 4;
        let sy = (an >> 4) << 4;

        let px = (this.x >> 4) - (field.scx); //ピクセルの座標x
        let py = (this.y >> 4) - (field.scy); //ピクセルの座標y

        let s;
        if(this.sz) s=this.sz;
        else s = 16;
        //画像をコンテキストにコピーするメソッド(仮想画面に書いている)
        vcon.drawImage(chImg, sx /*x座標 */ , sy /*y座標 */ , 16 /*横サイズ */ , s /*縦サイズ */ ,
            /*vconのどこに表示するか？*/
            px /*x座標 */ , py /*y座標 */ , 16 /*横サイズ */ , s /*縦サイズ */ ); //画像の左上から16×16をコピーする

    }
}