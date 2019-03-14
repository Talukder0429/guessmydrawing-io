import React, { Component } from 'react';
import './components.css';

class PC extends Component{
    state = {
        name: "unnamed user",
        score: 0
    };
    render(){
        return(
        <div>
            <div class="scoreBoard">
                <div>{this.state.name}</div>
                <div>Score: {this.state.score}</div>
            </div>
            <div class="arrowRight"></div>
        </div>
        );
    }
}

export default PC;
