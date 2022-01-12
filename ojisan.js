'use strict';
//スタンド用アニメーション
const ANIME_STAND = 1;
//歩く用アニメーション
const ANIME_WALK = 2;
//ブレーキ用アニメーション
const ANIME_BRAKE = 4;
//ジャンプ用アニメーション
const ANIME_JUMP = 8;
//重力の大きさ
const GRAVITY = 4;
//マックススピード
const MAX_SPEED = 32;

//大きさ判定
const TYPE_MINI = 1;
const TYPE_BIG = 2;
const TYPE_FIRE = 4;



//おじさんクラス

class Ojisan{
    constructor(x, y){
        //座標
        this.x = x;
        this.y = y;
        this.ay = 16;
        //横幅
        this.w = 16;
        //縦幅
        this.h = 16;
        //速度
        this.vx = 0;
        this.vy = 0;
        //アニメ番号など
        this.anim = 0;
        this.snum = 0;
        this.acou = 0;
        this.dirc = 0;
        this.jump = 0;
        //キノコ採っているか判定
        this.kinoko = 0;

        this.type = TYPE_MINI;
    }

    //床の判定
    checkFloor()
    {
        //床についている場合は判定いらない
        if(this.vy <=0) return;

        //左上の座標
        let lx = ((this.x + this.vx) >> 4);
        let ly = ((this.y + this.vy) >> 4);

        //タイプがミニならp=2
        let p = this.type == TYPE_MINI ? 2:0;

        //足元の2点判定
        if (field.isBlock(lx + 1 + p, ly + 31) || field.isBlock(lx + 14 - p, ly + 31)) {
            if (this.anim == ANIME_JUMP) this.anim = ANIME_WALK;
            this.jump = 0; //ジャンプアニメをリセット
            this.vy = 0; //重力加速度を0に
            this.y = ((((ly+31) >> 4) << 4) -32) << 4; //ぶつかった場所と一緒に
        }
    }

    //天井の判定
    checkCeil()
    {
        //床と反対のやり方
        if (this.vy >= 0) return;

        //左上の座標
        let lx = ((this.x + this.vx) >> 4);
        let ly = ((this.y + this.vy) >> 4);

        let ly2 = ly + (this.type == TYPE_MINI ? 21:5); //小さいなら+21で大きいなら+5
        let bl;
        //天井の1点判定
        if (bl=field.isBlock(lx + 8, ly2)) { //ブロック番号が0じゃないならブロック番号を取得
            this.jump = 15; //ジャンプアニメを加速度の頂点に強制代入
            this.vy = 0; //重力加速度を0に

            let x = (lx + 8) >> 4;
            let y = (ly2) >> 4;

            if(bl!=371){ //壊れないブロックならぼよよん描写
                block.push(new Block(bl, x, y)); //blでブロック番号取得できている
                item.push(new Item(218, x, y, 0, 0));
            } else if (this.type == TYPE_MINI){ //小さいなら破壊描写なし
                block.push(new Block(bl, x, y)); //blでブロック番号取得できている
            }else{ //壊れるブロックなら破壊の描写
                //四つの方向でpush
                //右上
                block.push(new Block(bl, x, y, 1, 20, -60)); //blでブロック番号取得できている

                //左上
                block.push(new Block(bl, x, y, 1, -20, -60)); //blでブロック番号取得できている

                //右下
                block.push(new Block(bl, x, y, 1, 20, -20)); //blでブロック番号取得できている

                //左下
                block.push(new Block(bl, x, y, 1, -20, -20)); //blでブロック番号取得できている
            }
        }
    }

    //横の壁の判定
    checkWall()
    {

        //左上の座標
        let lx = ((this.x + this.vx) >> 4);
        let ly = ((this.y + this.vy) >> 4);

        let p = this.type == TYPE_MINI ? 16+8:9; //小さいならp=16+8で大きいならp=9

        //右側の3点判定
        if (field.isBlock(lx + 15, ly + p) ||
        (this.type == TYPE_BIG) &&
        (
            field.isBlock(lx + 15, ly + 15) || field.isBlock(lx + 15, ly + 24)
        )
        ) {
            this.vx = 0; //重力加速度を0に
            this.x -= 8;
        } //左側の判定
        else if (field.isBlock(lx, ly + p) ||
        (this.type == TYPE_BIG) &&
        (
            field.isBlock(lx, ly + 15) || field.isBlock(lx, ly + 24)
        )
        ) {

            this.vx = 0; //重力加速度を0に
            this.x += 8;
        }
    }

    //ジャンプ用
    updateJump()
    {
        //ジャンプ
        if (keyb.ABUTTON) { //Xが押されたら
            if (this.jump == 0) { //ジャンプしていないとき
                this.anim = ANIME_JUMP; //アニメーションをANIME_JUMPに変更
                this.jump = 1; //ジャンプフラグを立てる
            }
            //フレーム数でジャンプ効果を変える(小ジャンプと大ジャンプをつくる)
            if (this.jump < 15) this.vy = -(64 - this.jump); //15以下の時、上方向の移動量を大きくする(this.jumpを引くことで滑らかに上下する)
        }
        if (this.jump) this.jump++; //０以上なら加算していく
    }

    //横移動の簡略化
    updateWalkSub(dir){
        //最高速まで加速
        if (dir == 1 && this.vx > -MAX_SPEED) this.vx--; //左向きの場合
        if (dir == 0 && this.vx < MAX_SPEED) this.vx++; //右向きの場合

        //ジャンプしていなかったら
        if (!this.jump){
            //アニメ番号を1(歩いている用)に
            this.anim = ANIME_WALK;
            //横向き方向指定(0,1判定)
            this.dirc = dir;

            //止まっていたら(立ちポーズだったら)カウントリセット
            if (this.anim == ANIME_STAND) this.acou = 0;

            //逆方向の時はブレーキをかける
            if (dir == 1 && this.vx > 0) this.vx--; //左向きの場合
            if (dir == 0 && this.vx < 0) this.vx++; //右向きの場合
            //逆に強い加速の時はブレーキアニメ
            if ((dir == 1 && this.vx > 8) ||
            (dir == 0 && this.vx < -8)){
                this.anim = ANIME_BRAKE;
            }
        }
    }

    //横移動用
    updateWalk()
    {
        //横移動
        //キーボードが押されたらおじさんが動く
        if (keyb.Left) {
            this.updateWalkSub(1);
        } else if (keyb.Right) {
            this.updateWalkSub(0);
        } else {
            //ジャンプしてないとき
            if (!this.jump) {
                //押されなかったときに減速
                if (this.vx > 0) this.vx -= 1;
                if (this.vx < 0) this.vx += 1;
                if (!this.vx) this.anim = ANIME_STAND;
            }
        }
    }

    //アニメ用
    updateAnim()
    {
        //スプライトの決定
        switch(this.anim)
        {
            case ANIME_STAND:
                this.snum = 0;
                break;
            case ANIME_WALK:
                this.snum = 2 + ((this.acou/6)%3);
                /*
        (oji_acount/6)%3について
        アニメーションを2,3,4,2,3,4...としたい
        2: 2 + 0
        3: 2 + 1
        4: 2 + 2
        右の部分を実現するため %3 としている

        oji_acount/6しないとフレーム数が早すぎるため割って遅く見せている
        割る数が大きいほど動きが遅くなる
        */
                break;
            case ANIME_JUMP:
                this.snum = 6;
                break;
            case ANIME_BRAKE:
                this.snum = 5;
                break;
        }
        //小さいおじさんの時は+32(画像の位置を観ればわかる)
        if(this.type == TYPE_MINI) this.snum +=32;
        //左向きの時は+48を使う(画像の位置を観ればわかる)
        if (this.dirc) this.snum += 48;
    }

    //毎フレームごとの更新処理
    update()
    {
        //キノコをとった時のエフェクト
        if(this.kinoko){
            let anim = [32 ,14, 32, 14, 32, 14, 0, 32, 14, 0];
            this.snum = anim[this.kinoko>>2]; //4フレームで1個アニメ
            this.h = this.snum == 32 ? 16 : 32; //アニメーションの時の高さ指定
            //方向判定
            if (this.dirc) this.snum += 48;
            //アニメーションが終わったらkinokoを0に
            if(++this.kinoko == 40/*anim.length <<4　と同じ */) {
                //大きくなった判定
                this.type = TYPE_BIG;
                this.ay = 0;
                this.kinoko = 0;
            }
            return; //動く処理はいらないためここでreturn
        }
        //アニメーション用のカウンタ
        this.acou++; //毎フレームごとにカウントしてる

        //最高速の時
        if (Math.abs(this.vx) == MAX_SPEED) this.acou++;

        this.updateJump();
        this.updateWalk();
        this.updateAnim();

        //重力
        if (this.vy < 64) this.vy += GRAVITY; //常に重力が発生

        //壁判定
        this.checkWall();

        //床判定
        this.checkFloor();

        //天井壁判定
        this.checkCeil();

        //実際に座標を変えている
        this.x += this.vx;
        this.y += this.vy;

        /* //床にぶつかる
        if (this.y > 160 << 4) {
            if (this.anim == ANIME_JUMP) this.anim = ANIME_WALK;
            this.jump = 0; //ジャンプアニメをリセット
            this.vy = 0; //重力加速度を0に
            this.y = 160 << 4; //ぶつかった場所と一緒に
        } */
    }

    //毎フレームごとの描画処理
    draw()
    {
        let px = (this.x >> 4) - field.scx;
        let py = (this.y >> 4) - field.scy;
        let sx = (this.snum & 15) << 4;
        let sy = (this.snum >> 4) << 4;

        let w = this.w;
        let h = this.h;

        //小さいおじさんの時に下の段に表示されるようにする
        py += (32 - h);

        vcon.drawImage(chImg, sx ,sy, w, h, px, py, w, h);
    }
}