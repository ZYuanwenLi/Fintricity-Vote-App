import React from 'react';
import {Client} from 'node-rest-client';
import {CandidateList} from './CandidateList.jsx';
import {API,URL} from "./const";
var client = new Client();
var Loader = require('react-loader');
//var API = 'https://fintricity-vote-rest-2-happy-crane.eu-gb.mybluemix.net/api';
export class BallotCheck extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      code: '', //'code'
      session: localStorage.getItem('session'), // sesson with ballot code
      voted: localStorage.getItem('voted'), // user voted or not
      yourPick: localStorage.getItem('yourPick'), // candidate voted for
      loaded: true
    };
    // handle the login form
    this.changeState = this._changeState.bind(this);
    this.submitProcess = this._submitProcess.bind(this);
  }

  /*
  * handle code input change in ballot check form
  */
  _changeState(event) {
    this.setState({code: event.target.value});
  }

  /*
  *  submit ballot code
  */
  _submitProcess(event) {
    const _this = this;
    this.setState({loaded: false});
    event.preventDefault();
    let args = {
      path:{
        "code": this.state.code
      }
    };
    //Use get to check if ballot code exists, if so, update the form
    client.get(API+"/ballot/${code}", args, function (data, response) {
      if(data){
        _this._getBallot(_this.state.code);
        _this.setState({loaded: true});
      }
    });
  }
  /*
    get registered Ballot by id 'code' or session storage
  */
  _getBallot(code) {
    const _this = this;
    let args = {
      path: {
        "code": code
      }
    };
    // get the ballot by 'code' 

    if (code) {
      client.get(API+"/ballot/${code}", args, function(data, response) {
        localStorage.setItem('voted', data.voted);
        localStorage.setItem('session', data.code);        
        _this.setState({session: data.code, voted: data.voted});
        //Check ballot state
        if (data.voted || data.voted === "true") {
        
          let args = {
            path: {
              "ballotCode": data.code
            }
          };
          // get ballot info by ballot 'code'
          client.get(API+"/vote/${ballotCode}", args, function(data, response) {
            if (data) {
  
              //console.log(data);
              localStorage.setItem('yourPick', data[0].candidate);
              // set the state
              _this.setState({yourPick: data[0].candidate,transactionId:data[0].transactionId});
            }
          });
        }

      });
    }
  }

  /*
    signOut and empty local storage , unset the state
  */
  _signOut(e) {
    localStorage.removeItem("session");
    localStorage.removeItem("voted");
    localStorage.removeItem("yourPick");
    this.setState({code: '', session: localStorage.getItem('session'), voted: false, yourPick: '',transactionId:false});
  }
  /*
  *Check if voted the hint will become "check your result! on Candidate List"
  *  */
  _updateHint(voted){
    if(voted) {
      return(<p>Check your choosed candidate!</p>);
    }
    return(<p>You can choose your candidate!</p>)
  }
  /**
   * Ballot check window
   */
  _checkBallotWindow(){
    return (
      <form onSubmit={this.submitProcess}>
        <h2 className="text-light text-uppercase">Ticket Check</h2>
        <hr className="bg-light py-1 mt-0"/>
        <Loader loaded={this.state.loaded} >
        <div className="input-group input-group-lg">
          <input type="code" className="form-control" placeholder="Invitation Code" value={this.state.code} onChange={this.changeState} required="required"/>
          <span className="input-group-btn">
            <button type="submit" className="text-uppercase btn  btn-primary btn-lg">Submit</button>
          </span>
        </div>
        </Loader>
      </form>
    )
  }

  /*
  * on compnent will mount get the ballot by session
  * useful on refresh the page
  */
  componentWillMount() {
    this._getBallot(this.state.session);
  }
  /**
   * render Title
   * _renderTitle()
   */
  _renderTitle() {
    return (<div className="text-light text-uppercase text-right">
      <h2>Person Vote Poll</h2>
      <hr className="bg-light py-1 mt-0"/>
      <p> &lt;=== Sign your ballot code from your mail</p>
      <p>Choose your wish person!</p>
      <p>Show us your suggestion! yuanwen.li@fintricity.com</p>
    </div>);
  }
  /*
  *render
  */
  render() {     
    if (!this.state.session) {
      return (<div>       
        <div className="container pt-4">
          <div className="row">
            <div className="col-md-6 mb-4">{this._checkBallotWindow()}</div>
            <div className="col-md-6 text-light">{this._renderTitle()}</div>
          </div>
          <CandidateList data={this.state}/>
        </div>
      </div>);
    } else {
      return (<div>
        
        <div className="container pt-4">
          <div className="row">
            <div className="col-md-6 mb-5 text-light text-uppercase">
              <h2>Ballot Valided!</h2>
              <hr className="bg-light py-1 mt-0"/>
              <button onClick={(e) => this._signOut(e)} className="text-uppercase btn btn-danger float-right btn-sm ">LOGOUT</button>
              <div className="mb-2 d-block">
                <h5><span className="pt-1 d-block">{this.state.session}</span></h5>
                <hr className="bg-light my-2"/>
              </div>
              {this._updateHint(this.state.voted)}
            </div>
            <div className="col-md-6 text-light">{this._renderTitle()}</div>
          </div>
        </div>
        <CandidateList data={this.state}/>
      </div>);
    }
  }
}
