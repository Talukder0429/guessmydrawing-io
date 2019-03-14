import React, { Component } from 'react';
import './components.css';

class Canvas extends Component{
    componentDidMount() {
        const script = document.createElement("script");
        script.src = "js/drawing.js";
        script.async = true;
        document.body.appendChild(script);
        console.log(document.body);
    }

    render(){
        return(
        <React.Fragment>
            <canvas id="canvas" width="902" height="450"></canvas>
            <button class="drawingUtil" id="undo">Undo</button>
            <button class="drawingUtil" id="clear">Clear</button>
            <input class="drawingUtil" type="color" id="canvasColor"></input>
            <div id="size">
                <button class="drawingUtil" id="small">Small</button>
                <button class="drawingUtil" id="regular">Regular</button>
                <button class="drawingUtil" id="big">Big</button>
            </div>
        </React.Fragment>
        );
    }
}

export default Canvas;
