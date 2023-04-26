let canvas2 = document.getElementById('canvas2');
let context2 = canvas2.getContext('2d');

let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');

let eraser = document.getElementById('eraser');
let brush = document.getElementById('brush');
let sizeBtn = document.getElementById('size');
let colorBtn = document.getElementById('color');
let geomBtn = document.getElementById('geom');
let circleBtn = document.getElementById('circle');
let squareBtn = document.getElementById('square');
// let reSetCanvas = document.getElementById("clear");
// let save = document.getElementById("save");
/* let selectBg = document.querySelector('.bg-btn');
let bgGroup = document.querySelector('.color-group');
let bgcolorBtn = document.querySelectorAll('.bgcolor-item'); */
let penDetail = document.getElementById("penDetail");
let penDetail1 = document.getElementById("penDetail1");
let aColorBtn = document.getElementsByClassName("color-item");
let undo = document.getElementById("undo");
let redo = document.getElementById("redo");


let range1 = document.getElementById('range1');
// let range2 = document.getElementById('range2');
let showOpacity = document.querySelector('.showOpacity');
let closeBtn = document.querySelectorAll('.closeBtn');
let eraserEnabled = false;
let activeBgColor = '#fff';
let ifPop = false;
let lWidth = 2;
let opacity = 1;
let strokeColor = 'rgba(0,0,0,1)';
let radius = 5;

let tools = document.getElementById('tools');
let shapes = document.getElementById('shapes');
var timeoutId;
let prevPageBtn = document.getElementById('prev-page');
let nextPageBtn = document.getElementById('next-page');
let bigBtn = document.getElementById('big');
let smallBtn = document.getElementById('small');
let repoBtn = document.getElementById('repo');
let eyeBtn = document.getElementById('eye');
let currentPage = 0;
let toolsX = 0;
let toolsY = 0;
let touchstarted = false;

let isGeom = 0;
let geomStartX = 0;
let geomStartY = 0;
const slides = new Array(3);

for (let i = 0; i < 4; i++) {
  const image = new Image();
  image.src = `${i}.png`;
  image.onload = function() {
    slides[i] = image;
    console.log("%d completed", i);
    console.log(slides[i]);
  }
}

autoSetSize();

setCanvasBg('white');

let slideX = canvas.width / 2;
let slideY = canvas.height / 2;
let slideW = 402;
let slideH = 284;
let slideOn = false;
let slideXdiff = 0;
let slideYdiff = 0;

listenToUser();

const fileInput = document.getElementById('fileInputWrapper');
const confirmButton = document.getElementById('confirmButton');
const fileItems = document.querySelectorAll('.fileItem');

fileInput.style.display = 'none';
tools.style.display = 'none';
shapes.style.display = 'none';

confirmButton.addEventListener('click', () => {
    const selectedFiles = [];
    fileItems.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox.checked) {
            selectedFiles.push(checkbox.value);
        }
    });
    console.log(selectedFiles);
    fileInput.style.display = 'none';
    //currentPage = 0;
    renderPage(currentPage);
});

/* 下面是实现相关效果的函数，可以不用看 */

function autoSetSize(){
    canvasSetSize();
    function canvasSetSize(){
        // 把变化之前的画布内容copy一份，然后重新画到画布上
        let pageWidth = document.documentElement.clientWidth;
        let pageHeight = document.documentElement.clientHeight;
        
        canvas.width = pageWidth;
        canvas.height = pageHeight;
        canvas2.width = pageWidth;
        canvas2.height = pageHeight;
    }

    window.onresize = function(){
        canvasSetSize();
    }
}

// 监听用户鼠标事件
function listenToUser() {
    // 定义一个变量初始化画笔状态
    let painting = false;
    // 记录画笔最后一次的位置
    let lastPoint = {x: undefined, y: undefined};

    if(document.body.ontouchstart !== undefined){
        canvas.ontouchstart = function (e) {
            painting = true;
            let x1 = e.touches[0].clientX;
            let y1 = e.touches[0].clientY;
            tools.style.left = x1 + 'px';
            tools.style.top = y1 + 'px';
            if(painting && slideOn && x1 >= slideX - slideW/2 && x1 <= slideX - slideW/2 + 20 && y1 >= slideY - slideH/2 && y1 <= slideY - slideH/2 + 20) {
                slideXdiff = slideX - x1;
                slideYdiff = slideY - y1;
                return;
            }

            if(eraserEnabled){//要使用eraser
                context.save();
                context.globalCompositeOperation = "destination-out";
                context.beginPath();
                radius = (lWidth/2) > 5? (lWidth/2) : 5;
                context.arc(x1,y1,radius,0,2*Math.PI);
                context.clip();
                context.clearRect(0,0,canvas.width,canvas.height);
                context.restore();
                lastPoint = {'x': x1,'y': y1}
            }else{
                lastPoint = {'x': x1,'y': y1}
            }

            timeoutId = setTimeout(function() {
                tools.style.left = (x1-10) + 'px';
                tools.style.top = y1 + 'px';
                toolsX = x1-10;
                toolsY = y1;
                painting = false;
                canvasDraw();
                tools.style.display = 'block';
              }, 500); // 3000毫秒即3秒
        };
        canvas.ontouchmove = function (e) {
            let x1 = lastPoint['x'];
            let y1 = lastPoint['y'];
            let x2 = e.clientX;
            let y2 = e.clientY;
            
            clearTimeout(timeoutId);

            if(painting && slideOn && slideXdiff != 0) {
                context2.clearRect(0, 0, canvas2.width, canvas2.height);
                slideX = x2 + slideXdiff;
                slideY = y2 + slideYdiff;
                renderPage(currentPage);
                if(slideX < slideW/2 || slideX > canvas2.width - slideW/2 || slideY < slideH/2 || slideY > canvas2.height - slideH/2) {
                    context2.clearRect(0,0,canvas2.width,canvas2.height);
                    slideOn = false;
                }
            }
            else {
                if(!painting){return}
                if(eraserEnabled){
                    moveHandler(x1,y1,x2,y2);
                    //记录最后坐标
                    lastPoint['x'] = x2;
                    lastPoint['y'] = y2;
                }else{
                    let newPoint = {'x': x2,'y': y2};
                    drawLine(lastPoint.x, lastPoint.y,newPoint.x, newPoint.y);
                    lastPoint = newPoint;
                }  
            }
        };

        canvas.ontouchend = function () {
            painting = false;
            canvasDraw();
            clearTimeout(timeoutId);
            slideXdiff = 0;
            slideYdiff = 0;
        }
    }else{
        // 鼠标按下事件
        canvas.onmousedown = function(e){
            painting = true;
            let x1 = e.clientX;
            let y1 = e.clientY;
            if(painting && slideOn && x1 >= slideX - slideW/2 && x1 <= slideX - slideW/2 + 20 && y1 >= slideY - slideH/2 && y1 <= slideY - slideH/2 + 20) {
                slideXdiff = slideX - x1;
                slideYdiff = slideY - y1;
                return;
            }
            //tools.style.left = x1 + 'px';
            //tools.style.top = y1 + 'px';
            if(eraserEnabled){//要使用eraser
                //鼠标第一次点下的时候擦除一个圆形区域，同时记录第一个坐标点
                context.save();
                context.globalCompositeOperation = "destination-out";
                context.beginPath();
                radius = (lWidth/2) > 5? (lWidth/2) : 5;
                context.arc(x1,y1,radius,0,2*Math.PI);
                context.clip();
                context.clearRect(0,0,canvas.width,canvas.height);
                context.restore();
                lastPoint = {'x': x1,'y': y1}
            }else{
                lastPoint = {'x': x1,'y': y1}
            }
            timeoutId = setTimeout(function() {
                tools.style.left = (x1-10) + 'px';
                tools.style.top = y1 + 'px';
                toolsX = x1-10;
                toolsY = y1;
                painting = false;
                canvasDraw();
                tools.style.display = 'block';
              }, 500); // 3000毫秒即3秒

            if(isGeom != 0) {
                geomStartX = x1;
                geomStartY = y1;
            }
        }

        // 鼠标移动事件
        canvas.onmousemove = function(e){
            let x1 = lastPoint['x'];
            let y1 = lastPoint['y'];
            let x2 = e.clientX;
            let y2 = e.clientY;
            
            clearTimeout(timeoutId);
            if(isGeom != 0) {
                return;
            }

            if(painting && slideOn && slideXdiff != 0) {
                context2.clearRect(0, 0, canvas2.width, canvas2.height);
                slideX = x2 + slideXdiff;
                slideY = y2 + slideYdiff;
                renderPage(currentPage);
                if(slideX < slideW/2 || slideX > canvas2.width - slideW/2 || slideY < slideH/2 || slideY > canvas2.height - slideH/2) {
                    context2.clearRect(0,0,canvas2.width,canvas2.height);
                    slideOn = false;
                }
            }
            else {
                if(!painting){return}
                if(eraserEnabled){
                    moveHandler(x1,y1,x2,y2);
                    //记录最后坐标
                    lastPoint['x'] = x2;
                    lastPoint['y'] = y2;
                }else{
                    let newPoint = {'x': x2,'y': y2};
                    drawLine(lastPoint.x, lastPoint.y,newPoint.x, newPoint.y);
                    lastPoint = newPoint;
                }  
            }
        }

        // 鼠标松开事件
        canvas.onmouseup = function(e){
            let x2 = e.clientX;
            let y2 = e.clientY;
            painting = false;
            canvasDraw();
            clearTimeout(timeoutId);
            slideXdiff = 0;
            slideYdiff = 0;
            if(isGeom == 2) {
                let width = x2 - geomStartX;
                let height = y2 - geomStartY;
                context.strokeRect(geomStartX, geomStartY, width, height);
                isGeom = 0;
            } else if(isGeom == 1) {
                context.beginPath();  // 开始绘制路径
                let width = x2 - geomStartX;
                let height = y2 - geomStartY;
                context.arc((x2+geomStartX)/2, (y2+geomStartY)/2, Math.min(Math.abs(width), Math.abs(height))/2, 0, 2 * Math.PI);  // 绘制圆
                context.stroke();  // 绘制圆的轮廓
                isGeom = 0;
            }
        }
    }


    
}

// 
function moveHandler(x1,y1,x2,y2){
    //获取两个点之间的剪辑区域四个端点
    var asin = radius*Math.sin(Math.atan((y2-y1)/(x2-x1)));
    var acos = radius*Math.cos(Math.atan((y2-y1)/(x2-x1)))
    var x3 = x1+asin;
    var y3 = y1-acos;
    var x4 = x1-asin;
    var y4 = y1+acos;
    var x5 = x2+asin;
    var y5 = y2-acos;
    var x6 = x2-asin;
    var y6 = y2+acos;
    
　　//保证线条的连贯，所以在矩形一端画圆
    context.save()
    context.beginPath()
    context.globalCompositeOperation = "destination-out";
    radius = (lWidth/2) > 5? (lWidth/2) : 5;
    context.arc(x2,y2,radius,0,2*Math.PI);
    context.clip()
    context.clearRect(0,0,canvas.width,canvas.height);
    context.restore();

　　//清除矩形剪辑区域里的像素
    context.save()
    context.beginPath()
    context.globalCompositeOperation = "destination-out";
    context.moveTo(x3,y3);
    context.lineTo(x5,y5);
    context.lineTo(x6,y6);
    context.lineTo(x4,y4);
    context.closePath();
    context.clip();
    context.clearRect(0,0,canvas.width,canvas.height);
    context.restore();
}


// 画线函数
function drawLine(x1,y1,x2,y2){
    context.beginPath();
    context.lineWidth = lWidth;
    // context.strokeStyle = strokeColor;
    // context.globalAlpha = opacity;
    // 设置线条末端样式。
    context.lineCap = "round";
    // 设定线条与线条间接合处的样式
    context.lineJoin = "round";
    context.moveTo(x1,y1);
    context.lineTo(x2,y2);
    context.stroke();
    context.closePath();
}

// 点击橡皮檫
// eraser.onclick = function(){
//     eraserEnabled = true;
//     eraser.classList.add('active');
//     brush.classList.remove('active');
// }

// 点击画笔
brush.onclick = function(){
    if(eraserEnabled == true) {
        eraserEnabled = false;
        // if(!ifPop){
        //     // 弹出框
        //     penDetail.classList.add('active');
        // }else{
        //     penDetail.classList.remove('active');
        // }
        // ifPop = !ifPop;
        brush.style.backgroundImage = 'url(image/pen.png)';
    } else {
        eraserEnabled = true;
        brush.style.backgroundImage = 'url(image/eraser.png)';
    }
    penDetail.classList.remove('active');
    penDetail1.classList.remove('active');
    tools.style.display = 'none';
}

colorBtn.onclick = function(){
    penDetail1.style.top = toolsY + 65 + 'px';
    penDetail1.style.left = toolsX + 150 + 'px';
    penDetail.classList.remove('active');
    penDetail1.classList.remove('active');
    penDetail1.classList.add('active');
}

sizeBtn.onclick = function() {
    penDetail.style.top = toolsY + 65 + 'px';
    penDetail.style.left = toolsX + 150 + 'px';
    penDetail.classList.remove('active');
    penDetail1.classList.remove('active');
    penDetail.classList.add('active');
}

geomBtn.onclick = function() {
    shapes.style.top = toolsY + 60 + 'px';
    shapes.style.left = toolsX + 100 + 'px';
    shapes.style.display = 'block';
}
circleBtn.onclick = function() {
    shapes.style.display = 'none';
    isGeom = 1;
    penDetail.classList.remove('active');
    penDetail1.classList.remove('active');
    tools.style.display = 'none';
}
squareBtn.onclick = function() {
    shapes.style.display = 'none';
    isGeom = 2;
    penDetail.classList.remove('active');
    penDetail1.classList.remove('active');
    tools.style.display = 'none';
}

let eye = false;
eyeBtn.onclick = function() {
    if(!eye) {
        setCanvasBg('green');
    } else {
        setCanvasBg('white');
    }
    eye = !eye;
}

prevPageBtn.onclick = function(){
    if (currentPage <= 0) {
      currentPage = 3;
    } else {
        currentPage--;
    }
    renderPage(currentPage);
}

bigBtn.onclick = function(){
    if(!slideOn) {
        return;
    }
    slideW *= 1.05;
    slideH *= 1.05;
    renderPage(currentPage);
}

smallBtn.onclick = function(){
    if(!slideOn) {
        return;
    }
    slideW *= 0.95;
    slideH *= 0.95;
    renderPage(currentPage);
}
  
nextPageBtn.onclick = function(){
    if (currentPage >= 3) {
        currentPage = 0;
    } else {
        currentPage++;
    }
    renderPage(currentPage);
}

function renderPage(pageNumber) {
    console.log(pageNumber, slides[pageNumber]);
    slideOn = true;
    context2.clearRect(0, 0, canvas2.width, canvas2.height);
    context2.drawImage(slides[pageNumber], slideX - slideW/2, slideY-slideH/2, slideW, slideH);
}

repoBtn.onclick = function(){
    fileInput.style.display = 'block';
}

// 实现清屏
// reSetCanvas.onclick = function(){
//     context.clearRect(0,0,canvas.width,canvas.height);
//     setCanvasBg('white');
//     canvasHistory = [];
//     undo.classList.remove('active');
//     redo.classList.remove('active');
// }

// 重新设置canvas背景颜色
function setCanvasBg(color) {
    context2.fillStyle = color;
    context2.fillRect(0, 0, canvas.width, canvas.height);
}

// 下载图片
// save.onclick = function(){
//     let imgUrl = canvas.toDataURL('image/png');
//     let saveA = document.createElement('a');
//     document.body.appendChild(saveA);
//     saveA.href = imgUrl;
//     saveA.download = 'mypic'+(new Date).getTime();
//     saveA.target = '_blank';
//     saveA.click();
// }


// 实现了切换背景颜色
/* for (let i = 0; i < bgcolorBtn.length; i++) {
    bgcolorBtn[i].onclick = function (e) {
        e.stopPropagation();
        for (let i = 0; i < bgcolorBtn.length; i++) {
            bgcolorBtn[i].classList.remove("active");
            this.classList.add("active");
            activeBgColor = this.style.backgroundColor;
            setCanvasBg(activeBgColor);
        }

    }
}
document.onclick = function(){
    bgGroup.classList.remove('active');
}

selectBg.onclick = function(e){
    bgGroup.classList.add('active');
    e.stopPropagation();
} */

// 实现改变画笔粗细的功能 1-20 放大的倍数 1 10 实际大小呢？ 2-20

range1.onchange = function(){
    thickness.style.transform = 'scale('+ (parseInt(range1.value)) +')';
    lWidth = parseInt(range1.value*2);
    context.lineWidth = lWidth;
    penDetail.classList.remove('active');
    penDetail1.classList.remove('active');
    tools.style.display = 'none';
}

// range2.onchange = function(){
//     opacity = 1 - parseInt(this.value)/10;
//     if(opacity !== 0){
//         showOpacity.style.opacity = opacity;
//     }  
// }

// 改变画笔颜色
getColor();

function getColor(){
    for (let i = 0; i < aColorBtn.length; i++) {
        aColorBtn[i].onclick = function (e) {
            // e.stopPropagation();
            for (let i = 0; i < aColorBtn.length; i++) {
                aColorBtn[i].classList.remove("active");
                this.classList.add("active");
                activeColor = this.style.backgroundColor;
                context.fillStyle = activeColor;
                context.strokeStyle = activeColor;
            }
            penDetail.classList.remove('active');
            penDetail1.classList.remove('active');
            tools.style.display = 'none';
            ifPop = false;
        }
    }
}

// 实现撤销和重做的功能
let canvasHistory = [];
let step = -1;

// 绘制方法
function canvasDraw(){
    step++;
    if(step < canvasHistory.length){
        canvasHistory.length = step;  // 截断数组
    }
    // 添加新的绘制到历史记录
    canvasHistory.push(canvas.toDataURL());
    if(step > 0){
        // undo.classList.add('active');
    }
}

// 撤销方法
function canvasUndo(){
    if(step > 0){
        step--;
        let canvasPic = new Image();
        canvasPic.src = canvasHistory[step];
        canvasPic.onload = function () { context.drawImage(canvasPic, 0, 0); }
        // undo.classList.add('active');
        // redo.classList.add('active');
    }else{
        // undo.classList.remove('active');
        alert('不能再继续撤销了');
    }
}
// 重做方法
function canvasRedo(){
    if(step < canvasHistory.length - 1){
        step++;
        let canvasPic = new Image();
        canvasPic.src = canvasHistory[step];
        canvasPic.onload = function () { 
            context.drawImage(canvasPic, 0, 0);
        }
        // redo.classList.add('active');
    }else {
        // redo.classList.remove('active')
        alert('已经是最新的记录了');
    }
}
// undo.onclick = function(){
//     canvasUndo();
// }
// redo.onclick = function(){
//     canvasRedo();
// }



for (let index = 0; index < closeBtn.length; index++) {
    closeBtn[index].onclick = function(e){
        let btnParent = e.target.parentElement;
        btnParent.classList.remove('active');
    }
    
}

window.onbeforeunload = function(){
    return "Reload site?";
};
