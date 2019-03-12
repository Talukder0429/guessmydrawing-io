(function(){
    "use strict";
    let context = document.querySelector('#drawing > canvas').getContext("2d");
    let clickX = [];
    let clickY = [];
    let clickDrag = [];
    let clickColor = [];
    let paint = false;
    let currentColor = "#000000";

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
    }
    
    let clearCanvas = function(){
        context.clearRect(0, 0, canvas.width, canvas.height);
    };
  
    let redraw = function(){
      clearCanvas();
      context.lineJoin = "round";
      context.lineWidth = 5;
      for(let i=0; i < clickX.length; i++)
          {
            if(clickDrag[i]){
                      context.beginPath();
                      context.moveTo(clickX[i-1], clickY[i-1]);
                      context.lineTo(clickX[i], clickY[i]);
                      context.closePath();
                      context.strokeStyle = clickColor[i];
                      context.stroke();
            }
          }
    };

    let resetCanvas = function(){
        clickX = [];
        clickY = [];
        clickDrag = [];
        clearCanvas();
    };

    let changeColor = function(){
        currentColor = this.value;
    }

    window.addEventListener('load', function(){
        prepareCanvas();
        document.querySelector("#drawing > #erase").onclick = resetCanvas;
        document.querySelector("#drawing > #canvasColor").onchange = changeColor;
    });

})();