import React, { Component } from 'react';
import '../App.css';
import {BallotCheck} from './components/BallotCheck.jsx';
import {List} from './components/List.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="container">
        <hr className="bg-light py-1"/>
        </div>
        <BallotCheck/>
        <List/>
      </div>
    );
  }
}

export default App;