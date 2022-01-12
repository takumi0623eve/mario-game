//
// ブロックオブジェクトのクラス
//

class Block
{
    constructor(bl, x, y, ty, vx, vy)
    {
        //壊せるか判定
        if(ty == undefined) ty =0;
        this.ty = ty;

        //vx判定
        if (vx == undefined) vx = 0;
        this.vx = vx;

        //vy判定
        if (vy == undefined) vy = 0;
        this.vy = vy;

        this.bl = bl;
        this.ox = x;
        this.oy = y;

        //感度を高めるため8ビットシフト
        this.x = x << 8; //ピクセルでの座標x
        this.y = y << 8; //ピクセルでの座標y

        //ぼよよんのアニメーションが終わったら消すためのプロパティ
        this.kill = false;
        this.count = 0;

        //マップデータの削除
        fieldData[y* FIELD_SIZE_W + x] = 367;

    }

    //更新処理
    update()
    {
        if (this.kill) return;
        if(++this.count == 11 && this.ty == 0){
            this.kill = true;

            //表示の復活
            fieldData[this.oy * FIELD_SIZE_W + this.ox] = this.bl;
            return;
        };
        //tyがない(破壊ができない)ときは何もしない
        if(this.ty == 0) return;

        //tyが0じゃないときはおじさんの移動と一緒
        if(this.vy<64) this.vy+=GRAVITY;
        this.x += this.vx;
        this.y += this.vy;

        //画面外になったら表示を消す
        if((this.y >>4) > FIELD_SIZE_H * 16) this.kill= true;
    }
    //描画処理
    draw()
    {
        if (this.kill) return;

        let an;
        if(this.ty == 0) an = this.bl; //tyが0ならblを代入
        else an=388 + ((frameCount>>4)&1); //tyが0じゃないなら破壊ブロックを2枚連続描写

        //ブロック一つの描画
        let sx = (an & 15) << 4;
        let sy = (an >> 4) << 4;

        let px = (this.x>>4) - (field.scx); //ピクセルの座標x
        let py = (this.y>>4) - (field.scy); //ピクセルの座標y

        //ぼよよんできるものだけ(破壊されないものだけ)
        if(this.ty == 0){
            //ぼよよんの動きを見せるためのデータ
            const anim = [0, 2, 4, 5, 6, 5, 4, 2, 0, -2, -1];
            py -= anim[this.count];
        }

        //画像をコンテキストにコピーするメソッド(仮想画面に書いている)
        vcon.drawImage(chImg, sx /*x座標 */ , sy /*y座標 */ , 16 /*横サイズ */ , 16 /*縦サイズ */ ,
            /*vconのどこに表示するか？*/
            px /*x座標 */ , py /*y座標 */ , 16 /*横サイズ */ , 16 /*縦サイズ */ ); //画像の左上から16×16をコピーする
    }
}
