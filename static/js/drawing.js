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
            if (clickX[i] == -1)
                clearCanvas();
            else if (clickDrag[i]) {
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
        if (clickX[clickX.length - 1] == -1)
            return;
        clickX.push(-1);
        clickY.push(null);
        clickDrag.push(null);
        clickColor.push(null);
        clickSize.push(null);
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

    // function idea from
    // https://stackoverflow.com/questions/79816/need-javascript-code-for-button-press-and-hold
    function heldDown(btn, action, start) {
        var t;
    
        var repeat = function () {
            action();
            t = setTimeout(repeat, start);
            if (start > 32)
                start = start / 2;
        }
    
        btn.onmousedown = function() {
            repeat();
        }
    
        btn.onmouseup = function () {
            clearTimeout(t);
        }

        btn.onmouseleave = btn.onmouseup;
    };

    window.addEventListener('load', function(){
        prepareCanvas();
        document.querySelector("#drawing > #clear").onclick = resetCanvas;
        heldDown(document.querySelector("#drawing > #undo"), undoLast, 1000);
        document.querySelector("#drawing > #canvasColor").oninput = changeColor;
        document.querySelector("#drawing > #size > #small").onclick = setSizeSmall;
        document.querySelector("#drawing > #size > #regular").onclick = setSizeRegular;
        document.querySelector("#drawing > #size > #big").onclick = setSizeBig;
    });

})();