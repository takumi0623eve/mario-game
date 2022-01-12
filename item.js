'use strict';
//
//キノコとかアイテムのクラス
//

class Item extends Sprite
{
    //横の壁の判定
    checkWall() {

        //左上の座標
        let lx = ((this.x + this.vx) >> 4);
        let ly = ((this.y + this.vy) >> 4);


        //右側の2点判定
        if (field.isBlock(lx + 15, ly + 3) ||
            field.isBlock(lx + 15, ly + 12)) {
            this.vx *= -1; //重力加速度を反転
        } //左側の判定
        else if (field.isBlock(lx, ly + 3) ||
            field.isBlock(lx, ly + 12)) {
            this.vx = 0; //重力加速度を反転
        }
    }

    //床の判定
    checkFloor() {
        //床についている場合は判定いらない
        if (this.vy <= 0) return;

        //左上の座標
        let lx = ((this.x + this.vx) >> 4);
        let ly = ((this.y + this.vy) >> 4);


        //足元の2点判定
        if (field.isBlock(lx + 1, ly + 15) || field.isBlock(lx + 14, ly + 15)) {
            this.vy = 0; //重力加速度を0に
            this.y = ((((ly + 15) >> 4) << 4) - 16) << 4; //ぶつかった場所と一緒に
        }
    }

    //更新処理
    update()
    {
        if(this.kill) return;

        //大きくなっているアニメーションの時は周りを停止する
        if(ojisan.kinoko) return;

        //アイテムにぶつかったら
        if(this.checkHit(ojisan))
        {
            //ぶつかったら1にする(アニメーションさせる)
            ojisan.kinoko = 1;
            this.kill = true;
            return;
        }

        //キノコが上がっていく処理
        if(++this.count <= 32){ //16回繰り返し
            this.sz =(1 + this.count) >> 1;
            this.y -=1 <<3;
            if(this.count == 32) this.vx = 24; //出てきたら右に動かす
            return;
        }
        this.checkWall();
        this.checkFloor();
        super.update();
    }
}