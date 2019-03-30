/*jshint esversion: 6 */

let socket = io();

(function() {
    msgID = document.getElementById('msgID');
    msgID.addEventListener('keyup', function onEvent(e) {
        if (e.keyCode === 13) {
            console.log(msgID.value);
            socket.emit("guess", msgID.value);
            document.getElementById('msgID').value = "";
        }
    });
    //hiding elements
    document.getElementById("canvasDraw").style.display = "none";
    document.getElementById("canvasView").style.display = "none";
    hideClass(document.getElementsByClassName("utils"));

    usernameID = document.getElementById('usernameID');
    usernameID.addEventListener('keyup', function onEvent(e) {
        if (e.keyCode === 13) {
            usernameID.style.display = "none";
            showClass(document.getElementsByClassName("utils"));
            socket.emit('newPlayer', usernameID.value);
        }
    });
})();

function hideClass(cls) {
    for (let elem of cls) {
        elem.style.display = "none";
    }
}

function showClass(cls) {
    for (let elem of cls) {
        elem.style.display = "initial";
    }
}

socket.on('updateSB', function(players, drawingPlayer) {
    let turns = document.getElementById('turnsID');
    turns.innerHTML = '';
    for (let player of players) {
        let div = document.createElement('div');
        div.className = 'playerCard';
        div.innerHTML =
            '<div class="scoreBoard">\
            <div>' + player.username + '</div>\
            <div>Score: ' + player.score + '</div>\
          </div>\
        <div class="arrowRight"></div>';
        turns.appendChild(div);
    }

    //end card
    let end = document.createElement('div');
    end.className = 'endOfRound';
    end.innerHTML = '<div>END OF ROUND!</div>';
    turns.appendChild(end);
});

socket.on('letsWatch', function(leaderSocket, dataURL) {
    "use strict";
    if (socket.id != leaderSocket) {
        document.getElementById("canvasDraw").style.display = "none";
        document.getElementById("canvasView").style.display = "initial";
        hideClass(document.getElementsByClassName("utils"));
        let context = document.getElementById("canvasView").getContext("2d");
        let image = new Image();
        image.onload = function() {
            context.clearRect(0, 0, canvasView.width, canvasView.height);
            context.drawImage(image, 0, 0);
        };
        if (dataURL)
            image.src = dataURL;
        else {
            let context = document.getElementById("canvasView").getContext("2d");
            context.clearRect(0, 0, canvasDraw.width, canvasDraw.height);
        }
    }
});

socket.on('letsDraw', function(word) {
    console.log(word);
    "use strict";
    document.getElementById("canvasDraw").style.display = "initial";
    document.getElementById("canvasView").style.display = "none";
    showClass(document.getElementsByClassName("utils"));
    let context = document.getElementById("canvasDraw").getContext("2d");

    // canvas drawing functions base code from
    // http://www.williammalone.com/articles/create-html5-canvas-javascript-drawing-app/ and
    // https://github.com/ThierrySans/CSCC09/blob/master/lectures/02/src/html5/js/draw.js
    let clickX = [];
    let clickY = [];
    let clickDrag = [];
    let clickColor = [];
    let clickSize = [];
    let paint = false;
    let currentColor = "#000000";
    let currentSize = 4;

    let prepareCanvas = function() {
        clearCanvas();

        canvasDraw.onmousedown = function(e) {
            let rect = canvasDraw.getBoundingClientRect();
            let mouseX = e.pageX - this.offsetLeft;
            let mouseY = e.pageY - this.offsetTop;

            let scaleX = canvasDraw.width / rect.width;
            let scaleY = canvasDraw.height / rect.height;

            paint = true;
            addClick(mouseX * scaleX, mouseY * scaleY, false);
            redraw();
        };

        canvasDraw.onmousemove = function(e) {
            if (paint) {
                let rect = canvasDraw.getBoundingClientRect();
                let mouseX = e.pageX - this.offsetLeft;
                let mouseY = e.pageY - this.offsetTop;

                let scaleX = canvasDraw.width / rect.width;
                let scaleY = canvasDraw.height / rect.height;

                addClick(mouseX * scaleX, mouseY * scaleY, true);
                redraw();
            }
        };

        canvasDraw.onmouseup = function(e) {
            paint = false;
        };

        canvasDraw.onmouseleave = function(e) {
            paint = false;
        };
    };

    function addClick(x, y, dragging) {
        clickX.push(x);
        clickY.push(y);
        clickDrag.push(dragging);
        clickColor.push(currentColor);
        clickSize.push(currentSize);
    }

    let clearCanvas = function() {
        context.clearRect(0, 0, canvasDraw.width, canvasDraw.height);
    };

    let redraw = function() {
        clearCanvas();
        context.lineJoin = "round";
        for (let i = 0; i < clickX.length; i++) {
            if (clickX[i] == -1)
                clearCanvas();
            else {
                context.beginPath();
                if (clickDrag[i] && i)
                    context.moveTo(clickX[i - 1], clickY[i - 1]);
                else
                    context.moveTo(clickX[i] - 1, clickY[i]);
                context.lineTo(clickX[i], clickY[i]);
                context.closePath();
                context.strokeStyle = clickColor[i];
                context.lineWidth = clickSize[i];
                context.stroke();
            }
        }
        let dataURL = canvasDraw.toDataURL();
        socket.emit('view', dataURL);
    };

    let resetCanvas = function() {
        if (clickX[clickX.length - 1] == -1)
            return;
        clickX.push(-1);
        clickY.push(null);
        clickDrag.push(null);
        clickColor.push(null);
        clickSize.push(null);
        redraw();
    };

    let undoLast = function() {
        clickX.pop();
        clickY.pop();
        clickDrag.pop();
        clickColor.pop();
        clickSize.pop();
        redraw();
    };

    let changeColor = function() {
        currentColor = this.value;
    };

    let setSizeSmall = function() {
        currentSize = 2;
    };

    let setSizeRegular = function() {
        currentSize = 4;
    };

    let setSizeBig = function() {
        currentSize = 8;
    };

    // function base code from
    // https://stackoverflow.com/questions/79816/need-javascript-code-for-button-press-and-hold
    function heldDown(btn, action, initial, start = initial) {
        let t;

        let repeat = function() {
            action();
            t = setTimeout(repeat, start);
            if (start > 8)
                start = start / 2;
        };

        btn.onmousedown = function() {
            repeat();
        };

        btn.onmouseup = function() {
            clearTimeout(t);
            start = initial;
        };

        btn.onmouseleave = btn.onmouseup;
    }

    prepareCanvas();
    document.getElementById("clearID").onclick = resetCanvas;
    heldDown(document.getElementById("undoID"), undoLast, 250);
    document.getElementById("colorID").oninput = changeColor;
    document.getElementById("smallID").onclick = setSizeSmall;
    document.getElementById("mediumID").onclick = setSizeRegular;
    document.getElementById("largeID").onclick = setSizeBig;
});
