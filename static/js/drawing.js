(function(){
    "use strict";
    let context = document.querySelector('#drawing > canvas').getContext("2d");
    let clickX = [];
    let clickY = [];
    let clickDrag = [];
    let clickColor = [];
    let clickSize = [];
    let paint = false;
    let currentColor = "#000000";
    let currentSize = 5;

    let prepareCanvas = function(){
        canvas.onmousedown = function(e){
            let mouseX = e.pageX - this.offsetLeft;
            let mouseY = e.pageY - this.offsetTop;

            paint = true;
            addClick(mouseX, mouseY, false);
            redraw();
        };

        canvas.onmousemove = function(e){
            if(paint){
                let mouseX = e.pageX - this.offsetLeft;
                let mouseY = e.pageY - this.offsetTop;

                addClick(mouseX, mouseY, true);
                redraw();
            }
        };

        canvas.onmouseup = function(e){
            paint = false;
        };

        canvas.onmouseleave = function(e){
            paint = false;
        };
    };

    function addClick(x, y, dragging)
    {
        clickX.push(x);
        clickY.push(y);
        clickDrag.push(dragging);
        clickColor.push(currentColor);
        clickSize.push(currentSize);
    }
    
    let clearCanvas = function(){
        context.clearRect(0, 0, canvas.width, canvas.height);
    };
  
    let redraw = function(){
        clearCanvas();
        context.lineJoin = "round";
        for (let i = 0; i < clickX.length; i++) {
            if (clickDrag[i]) {
                context.beginPath();
                context.moveTo(clickX[i - 1], clickY[i - 1]);
                context.lineTo(clickX[i], clickY[i]);
                context.closePath();
                context.strokeStyle = clickColor[i];
                context.lineWidth = clickSize[i];
                context.stroke();
            }
        }
    };

    let resetCanvas = function(){
        clickX = [];
        clickY = [];
        clickDrag = [];
        clickColor = [];
        clickSize = [];
        clearCanvas();
    };

    let undoLast = function(){
        clickX.pop();
        clickY.pop();
        clickDrag.pop();
        clickColor.pop();
        clickSize.pop();
        redraw();
    }

    let changeColor = function(){
        currentColor = this.value;
    }

    let setSizeSmall = function(){
        currentSize = 2;
    }

    let setSizeRegular = function(){
        currentSize = 5;
    }

    let setSizeBig = function(){
        currentSize = 10;
    }

    window.addEventListener('load', function(){
        prepareCanvas();
        document.querySelector("#drawing > #clear").onclick = resetCanvas;
        document.querySelector("#drawing > #undo").onclick = undoLast;
        document.querySelector("#drawing > #canvasColor").oninput = changeColor;
        document.querySelector("#drawing > #size > #small").onclick = setSizeSmall;
        document.querySelector("#drawing > #size > #regular").onclick = setSizeRegular;
        document.querySelector("#drawing > #size > #big").onclick = setSizeBig;
    });

})();