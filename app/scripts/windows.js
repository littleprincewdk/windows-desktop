/**
 * Created by wudengke on 2017/2/5.
 */
$(function(){
    var defaults={
        gridWidth:74,
        gridHeight:108,
        marginTop:5,
        marginRight:2,
        itemWidth:74,
        itemHeight:74,
        rowNum:6,
        colNum:19
    };

    var isMouseDown=false;
    var SelectedItem={};
    var lastMouseLocationX=0,
        lastMouseLocationY=0;
    var Help=null;
    var selectedArea={
        dom:null,
        hasStarted:false,
        startX:0,
        startY:0,
        endX:0,
        endY:0
    };
    var Desktop=$("#desktop"),
        ProgramsItem=$(".program-item");
    var Grid=new Array(defaults.rowNum);
    for(var i=0;i<defaults.rowNum;i++){
        Grid[i]=new Array(defaults.colNum);
    }

    function getCoordinate(left,top){
        return {
            row:Math.floor((top-defaults.marginTop)/(defaults.gridHeight)),
            col:Math.floor(left/(defaults.gridWidth+defaults.marginRight))
        }

    }
    function getPosition(row,col){
        return {
            left:(defaults.gridWidth+defaults.marginRight)*col,
            top:defaults.gridHeight*row+defaults.marginTop
        }
    }
    function getProgramItem(left,top){
        var coordinate=getCoordinate(left,top);
        return Grid[coordinate.row][coordinate.col];
    }
    ProgramsItem.each(function(i,ele){
        var _self=$(ele);
        //row,col都是从0开始
        var row=i%defaults.rowNum,
            col=Math.floor(i/defaults.rowNum),
            position=getPosition(row,col),
            left=position.left,
            top=position.top;
        _self.css({left:left,top:top});
        _self.row=row;
        _self.col=col;
        Grid[row][col]=_self;
    }).click(function(){

    }).on("mousedown",function(e){
        if(e.which==1){//左键
            isMouseDown=true;
            SelectedItem=getProgramItem(e.clientX,e.clientY);
            SelectedItem.addClass("active").siblings().removeClass("active");
            lastMouseLocationX=e.clientX;
            lastMouseLocationY=e.clientY;
        }
    }).on("dblclick",function(){
        alert("打开 "+$(this).find(".program-item-title").text());
        $(this).removeClass("active");
    }).on("mouseup",function(){
        isMouseDown=false;
    });
    Desktop.click(function(e){
        if(e.target.classList.value.indexOf("program-item")==-1){
            ProgramsItem.removeClass("active");
        }
    }).on("mousedown",function(e){
        if(e.target.classList.value.indexOf("program-item")==-1){
            selectedArea.hasStarted=true;
            selectedArea.startX=e.clientX;
            selectedArea.startY=e.clientY;
        }
    }).on("mousemove",function(e){
        if(isMouseDown){
            if(!Help){
                Help=SelectedItem.clone().appendTo(Desktop).removeClass("active");
            }
            var leftIncreaseBy=e.clientX-lastMouseLocationX,
                topIncreaseBy=e.clientY-lastMouseLocationY;
            Help.css({left:"+="+leftIncreaseBy,top:"+="+topIncreaseBy});

            lastMouseLocationX=e.clientX;
            lastMouseLocationY=e.clientY;
        }else{
            if(selectedArea.hasStarted){
                selectedArea.endX=e.clientX;
                selectedArea.endY=e.clientY;
                if(!selectedArea.dom){
                    selectedArea.dom=$("<div class='selected-area'></div>").appendTo(Desktop).css({
                        left:selectedArea.startX,
                        top:selectedArea.startY
                    });
                }
                if(selectedArea.endX<selectedArea.startX){
                    selectedArea.dom.css("left",selectedArea.endX)
                }
                if(selectedArea.endY<selectedArea.startY){
                    selectedArea.dom.css("top",selectedArea.endY)
                }
                selectedArea.dom.css({
                    width:Math.abs(selectedArea.endX-selectedArea.startX),
                    height:Math.abs(selectedArea.endY-selectedArea.startY)
                })
            }
        }
    }).on("mouseup",function(e){
        if(isMouseDown){
            isMouseDown=false;
            var coordinate=getCoordinate(e.clientX,e.clientY),
                row=coordinate.row,
                col=coordinate.col;
            if(row!=SelectedItem.row||col!=SelectedItem.col){//新位置要移动
                var TargetItem=Grid[row][col];
                var movingItem=SelectedItem;
                Grid[SelectedItem.row][SelectedItem.col]=null;//原位置置空
                SelectedItem.addClass("active");
                //新位置处有ProgramItem就依次移动
                do{
                    var nextPosition=getPosition(row,col),
                        nextLeft=nextPosition.left,
                        nextTop=nextPosition.top;
                    movingItem.css({left:nextLeft,top:nextTop});
                    movingItem.row=row;//更新坐标属性
                    movingItem.col=col;
                    Grid[row][col]=movingItem;
                    if(++row>=defaults.rowNum){
                        //下一位置
                        col++;
                        row=0;
                    }
                    movingItem=TargetItem;
                    TargetItem=Grid[row][col];
                }while(movingItem);//!!!不是TargetItem
            }
            if(Help){
                Help.remove();
                Help=null;
            }
        }else{
            if(selectedArea.hasStarted){//选区
                //判断选中的ProgramItem


                selectedArea.hasStarted=false;
                selectedArea.startX=0;
                selectedArea.startY=0;
                selectedArea.endX=0;
                selectedArea.endY=0;
                if(selectedArea.dom){
                    selectedArea.dom.remove();
                    selectedArea.dom=null;
                }
            }
        }
    });
    function getItemInSelectArea(){

    }
    /*console.log(document.body.oncontextmenu)
    $("body").on("contextmenu",function(e){
        /!*e.preventDefault();
        if(e.which==3){

        }*!/
        return false;
    })*/
});
/*
 * 判断选中的ProgramItem
 * 1.遍历Grid,如果Grid[i][j]的left和top在选区内，就选中
 * 2.先算哪几个栅格在选区内，再根据栅格找出
 */