/*jshint esversion: 6 */ 

let socket = io();
// const ss = require('socket.io-stream');

socket.on('message', function(data) {
  console.log(data);
});

let presenterMedia = new ScarletsMediaPresenter({
    audio:{
        channelCount: 1,
        echoCancellation: false
    }
}, 100);

presenterMedia.onRecordingReady = function(packet) {
    socket.emit('bufferHeader', packet);
};

presenterMedia.onBufferProcess = function(streamData) {
    socket.emit('stream', streamData);
}

presenterMedia.startRecording();

let audioStreamer = new ScarletsAudioStreamer(100);
audioStreamer.playStream();

socket.on('bufferHeader', function(packet){
    audioStreamer.setBufferHeader(packet);
});

socket.on('stream', function(packet){
    audioStreamer.receiveBuffer(packet);
});

socket.emit('requestBufferHeader', '');

socket.emit('newPlayer');

socket.on('letsWatch', function(leaderSocket, dataURL) {
    "use strict";
    if (socket.id != leaderSocket) {
        document.getElementById("canvasDraw").style.display = "none";
        document.getElementById("canvasView").style.display = "initial";
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

socket.on('letsDraw', function() {
    "use strict";
    document.getElementById("canvasDraw").style.display = "initial";
    document.getElementById("canvasView").style.display = "none";
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
    let currentSize = 5;
    
    let prepareCanvas = function() {
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
                    context.moveTo(clickX[i]-1, clickY[i]);
                context.lineTo(clickX[i], clickY[i]);
                context.closePath();
                context.strokeStyle = clickColor[i];
                context.lineWidth = clickSize[i];
                context.stroke();
            }
        }
        let dataURL = canvasDraw.toDataURL();
        socket.emit('view', socket.id, dataURL);
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
        currentSize = 5;
    };

    let setSizeBig = function() {
        currentSize = 10;
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
    document.querySelector("#drawingID > #clear").onclick = resetCanvas;
    heldDown(document.querySelector("#drawingID > #undo"), undoLast, 250);
    document.querySelector("#drawingID > #canvasColor").oninput = changeColor;
    document.querySelector("#drawingID > #size > #small").onclick = setSizeSmall;
    document.querySelector("#drawingID > #size > #regular").onclick = setSizeRegular;
    document.querySelector("#drawingID > #size > #big").onclick = setSizeBig;
});
