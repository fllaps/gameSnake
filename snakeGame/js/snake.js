/**
 * Created by PC on 2017/9/1.
 */
var game={
    RN:9,CN:18,status:0,GAMEOVER:0,RUNNING:1,PAUSE:2,BGCOLOR:"#ddd",score:0,
    snakeHead:[],snakeBody:[],babySnake:4,direction:'',food:null,data:null,speed:600,
    nowTime:null,oldTime:new Date().getTime(),
    start:function(){
        this.status=1;
        this.score=0;
        this.level=0;
        this.data=[];
        for(var r=0;r<this.RN;r++){//外层循环控制行
            this.data.push([]);//向data中压入一个空数组
            for(var c=0;c<this.CN;c++){//内层循环控制列
                //向data中r行的子数组中压入0
                this.data[r].push(null);
            }
        };
        this.createSnake();
        this.createFood();
        //更新页面
        // console.log(this.data);
        this.updateView();
        //当键盘按下时，自动执行:
        document.onkeydown=function(e){
            //控制两次按键的间隔时间不能小于this.speed
            this.nowTime=new Date().getTime();
            // console.log(this.nowTime,this.oldTime,this.nowTime-this.oldTime);
            if(this.nowTime-this.oldTime<(this.speed)*0.5) return ;
            else
            switch(e.keyCode){
                case 37: if(this.status==this.RUNNING&&this.direction!='left') {this.direction='right';this.move();};
                    break;
                case 39: if(this.status==this.RUNNING&&this.direction!='right')  {this.direction='left';this.move();};
                    break;
                case 38: if(this.status==this.RUNNING&&this.direction!='down') {this.direction='up';this.move();};
                    break;
                case 40: if(this.status==this.RUNNING&&this.direction!='up')  {this.direction='down';this.move();};
                    break;
                case 32://空格键  暂停与恢复
                    this.pauseOrContinue();
                     break;
                case 27://esc键退出
                    if(this.status!=this.GAMEOVER) this.close();
                    break;
                case 81://Q:加速
                    if(this.status==this.RUNNING)
                        this.quickMove();
                    break;
            };
            this.oldTime=this.nowTime;
        }.bind(this);
    },
    //在随机位置生成一条4节身体，一个头的蛇
    createSnake:function(){
        // this.
        //先随机生成蛇头
        var r=parseInt(Math.random()*this.RN);
        var c=parseInt(Math.random()*this.CN);
        var m=Math.random();
        //根据蛇头随机生成蛇身体，当c>3,身体可以随机在头右侧，当c<14,身体可以随机在头左侧;r>3,身体可以随机在头上方;r<5，身体可以随机在头下方；利用循环随机在一个方向生成一行身体。
        var h=this.babySnake;
        if(r>h-1&&r<this.RN-h&&c>h-1&&c<this.CN-h) {
            if(m>0.75) {
                for(var a=0;a<h-1;a++){
                    var change=r-(a+1);
                    this.snakeBody[a]={"r":change,"c":c};
                }
                this.direction='down';
            }else if(m>0.5){
                for(var b=0;b<h-1;b++){
                    this.snakeBody[b]={'r':r,'c':c+b+1};
                }
                this.direction='right';
            }else if(m>0.25){
                for(var e=0;e<h-1;e++){
                    this.snakeBody[e]={'r':r+e+1,'c':c};
                }
                this.direction='up';
            }else{
                for(var f=0;f<h-1;f++){
                    this.snakeBody[f]={'r':r,'c':c-f-1};
                }
                this.direction='left';
            };
            //将蛇头的位置放入数组中
            this.data[r][c]='sHead';
            this.snakeHead.push({'r':r,'c':c});
            // console.log(this.snakeHead,r,c)
        }else{
            this.createSnake();
        }
        this.updateToData();
    },
    //在随机的位置生成贪吃蛇的食物
    createFood:function(){
        while(true){//反复
            //随机生成r
            var r=parseInt(Math.random()*this.RN);
            //随机生成c
            var c=parseInt(Math.random()*this.CN);
            if(!this.data[r][c]){//如果data中r行c列为0
                this.data[r][c]="food";
                this.food={'r':r,'c':c};
                break;
            }
        }
    },
    //将数组内容更新到视图中
    updateView:function(){
        //先更新data，再更新视图
        this.updateToData();
        // console.log(this.data.join(''));
        //遍历data中每个元素，找到页面上id为"s"+r+c的div，看是否有内容，然后进行相应操作
        for(var r=0;r<this.RN;r++){
            for(var c=0;c<this.CN;c++){
                var div=document.getElementById("s"+r+c);
                // console.log(div);
                switch(this.data[r][c]){
                    case "food":div.style.backgroundColor="red";break;
                    case "sBody":div.style.backgroundColor="yellow";break;
                    case "sHead":div.style.backgroundColor="black";break;
                    default:   div.style.backgroundColor=this.BGCOLOR;
                }
            }
        }
        //找到分数的span，设置span的内容为score
        var span=document.getElementById("score");
        span.innerHTML=this.score;
    },
    //将头和身体的数组中的数据同步到总数据data中
    updateToData:function(){
        var objH=this.snakeHead,objB=this.snakeBody;
        this.data[this.snakeHead[0].r][this.snakeHead[0].c]='sHead';
        for(var j=0;j<objB.length;j++){
            if(objB[j].r>this.RN-1||objB[j].r<0||objB[j].c<0||objB[j].c>this.CN-1)
                this.gameOver();
            else {this.data[objB[j].r][objB[j].c]='sBody'}
        }
    },
    //用定时器定时调用蛇移动
    move:function(){
        //为了防止定时器的并发和叠加，先判断是否有定时器正在执行或排队。
        if(!this.timer)
          this.timer= setInterval(function(){
                this.moveSnake();
            }.bind(this),this.speed);
    },
    //蛇移动
    moveSnake:function(){
        if(!this.canMove()){
            this.status=0;
            this.gameOver();
        }
        else  {
            // console.log(this.snakeHead,this.direction);
            //因为当吃到食物时，要追加，所以将最后一个数据保存下来
            var last=this.snakeBody[this.snakeBody.length-1];
            var store={'r':last.r,'c':last.c};
            this.data[store.r][store.c]=null;
            //当蛇移动时，不是从开头移动，而是最后一个逐渐向前移动，也就是说，后一个新位置是前一个的旧位置。
            for(var i=this.snakeBody.length-1;i>0;i--){
                this.snakeBody[i].r=this.snakeBody[i-1].r;
                this.snakeBody[i].c=this.snakeBody[i-1].c;
            };
            this.snakeBody[0].r=this.snakeHead[0].r;
            this.snakeBody[0].c=this.snakeHead[0].c;
            // console.log(this.snakeHead,this.snakeBody);
            //根据键盘的键值来判断到底向哪里移动，改变头的位置，通过头带动身体移动
            switch(this.direction) {
                case 'left': this.snakeHead[0].c+=1;break;
                case 'right': this.snakeHead[0].c-=1;break;
                case 'up': this.snakeHead[0].r-=1;break;
                case 'down': this.snakeHead[0].r+=1;
            }
            //当新位置算完后，判断头的位置是否在范围内，否则不更新视图
            if(!this.canMove())  this.gameOver();
            else{
                //当食物与头部的坐标相等时，相当于吃到了食物，在最末尾加上一个元素。
                if(this.food.r==this.snakeHead[0].r&&this.food.c==this.snakeHead[0].c){
                    this.snakeBody.push({'r':store.r,'c':store.c});
                    this.score++;
                    this.updateToData();
                    this.createFood();
                }
                this.updateView();
            }
        }
    },
    //通过此函数判断当按下按键后是否可以移动
    canMove:function(){
        var r=this.snakeHead[0].r,c=this.snakeHead[0].c;
        if(r>-1&&r<this.RN&&c>-1&&c<this.CN) {
            for(var i=0;i<this.snakeBody.length;i++){
               if(this.snakeBody[i].r==r&&this.snakeBody[i].c==c) {
                   return false;}
            }
            return true;
        }else {return false}
    },
    //游戏结束
    gameOver:function(){
        var div=document.querySelector('div.gameOver');
        div.style.display='block';
    },
    reStart:function(){
        history.go(0);
    },
    close:function(){
       window.close()
    },
    pauseOrContinue:function(){
        if(this.status==this.RUNNING){
            clearInterval(this.timer);
            this.status=this.PAUSE;
            this.updateView();
        }else{
                this.status=this.RUNNING;
                this.timer=setInterval(()=>this.moveSnake(),this.speed);
                this.updateView();
        }
    },
    helpShow:function(){
        var div=document.querySelector('div.gameHelp');
        div.style.display='block';
    },
    helpHide:function(){
        var div=document.querySelector('div.gameHelp');
        div.style.display='none';
    },
    quickMove:function(){
        this.speed-=100;
        //console.log(this.speed);
        clearInterval(this.timer);
        this.timer=setInterval(()=>this.moveSnake(),this.speed);
        this.updateView();
    }
};
game.start();