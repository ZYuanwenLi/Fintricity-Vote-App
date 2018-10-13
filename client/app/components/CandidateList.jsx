import React from 'react';
import {Client} from 'node-rest-client';
import {_} from 'underscore';
//import {animation} from "./animation.js";
import {API,URL} from "./const.js";
var client = new Client();
var Loader = require('react-loader');
/*
  candidateList compnent props came from logged user state
  <candidateList data={this.state}/>
*/
export class CandidateList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      candidates: [], // list of candidate
      yourPick: '',
      voted: false,
      candidateLoaded: false,
      voteLoaded: true,
      transactionId : ''
    };

  }
  /*
  componentDidMount() {
    animation();
  }
  */
  /*
    reload candidate voting list
  */
  componentWillMount() {
    const _this = this;
    // get list of candidate
    client.get(API+"/candidate", function(data, response) {
    //client.get("https://fintricity-vote-rest-2-happy-crane.eu-gb.mybluemix.net/api/Candidate", function(data, response) {
      console.log("candidateList: "+"https://fintricity-vote-rest-2-happy-crane.eu-gb.mybluemix.net/api/Candidate");
      _this.setState({candidates: data, candidatesLoaded: true}); // set the state
    });
  }
  /*
    on receive props set the current user voted
    for candidate
  */
  componentWillReceiveProps(nextProps) {
    this.setState({
      yourPick: nextProps.data.yourPick
        ? (nextProps.data.yourPick).split('#')[1]
        : '',
      voted: nextProps.data.yourPick
        ? true
        : false
    ,transactionId:nextProps.data.transactionId? nextProps.data.transactionId : false});
  }
  /*
    return true if current user voted for this
    candidate
  */
  _yourPick(name) {
    if (this.state.yourPick === name) {
      return 'voted';
    }
    return '';
  }

  /*
  * construct candidate list
  */
  _renderCandidate() {

    const _this = this;
    console.log("is candidates?"+this.state.candidates[1]+"is candidate?"+this.state.candidate);
    // map and render candidate with button , votes , name
    return _.map((this.state.candidates), function(v, k) {
      let img = "/img/" + v.name + ".jpg";
      return (<div className="col text-center candidate mb-4 text-uppercase" key={k}>
        <div className={'pic-block'} style={{
            backgroundImage: "url(./img/" + v.name + ".jpg)"
          }}>
          <div className={"hover " + _this._yourPick(v.name) + " " + _this.state.voted+" "+(!_this.state.voteLoaded?'loading':'')}>
            <Loader loaded={_this.state.voteLoaded} className="spinner">{_this._rChResButton(v.name)}</Loader>
          </div>
        </div>
        <h2 className="text-left text-light mb-0">{v.name}
          <small className="float-right mt-2">{v.votes}</small>
        </h2>
        <hr className="bg-light py-1 mt-0"/>
      </div>)
    })
  }
  _transactionPublish(){
    return(
      <div className="col-12 text-light tx">
        <div className={(!this.state.transactionId) ? 'd-none':''}>
        <big>Your Ballot ID</big> <small>(transaction ID)</small> : {(this.state.transactionId)?this.state.transactionId :''}
        </div>
      </div>
    )
  }
  /*
  * Pick a candidate
  */
  _PickMan(candidate) {
    const _this = this;
    let code = this.props.data.session; // user id 'code'
    // set content-type header and data as json in args parameter
    let args = {
      headers: {
        "Content-Type": "application/json"
      },
      data: {
        "code": code,
        "candidate": candidate // candidate name
      }
    };
    this.setState({voteLoaded: false});
    // Spent the ballot
    client.post(API+"/pickman", args, function(data, response) {
      console.log("pickman"+data)
      _this.setState({voteLoaded: true});
      if (!data.error) { //If haven't pick the food
        console.log("datacandidate:"+data.candidates+":"+data.candidate);
        let candidate = data.candidate.split('#')[1]; // parse candidate name from resource:org.acme.lunchvote.Candidate#xxxx
        
        _this.setState({yourPick: candidate, voted: true,transactionId : data.transactionId}); // set state
        localStorage.setItem('voted', true); 
        localStorage.setItem('yourPick', candidate); 
        let allcandidates = _this.state.candidates; 
        let candidateIndex = _.findIndex(allcandidates, {name: candidate}); // find candidate index in the  list
        (allcandidates)[candidateIndex].votes += 1; // increment vote to avoid recall the app API
        _this.setState({candidates: allcandidates}); // update the candidate chain
      }
    });
  }
  /*
  *render choose candidate button
  */
  _rChResButton(candidate) {
    if (this.props.data.session) { // if logged
      if (!this.state.yourPick) { // if not voted yet
        return (<div>
          <button className="vote-btn" onClick={(e) => this._PickMan(candidate)}>
            <span className="fa fa-user-check"></span>
          </button>
        </div>)
      } else { // if alredy voted
        return (<button className="vote-btn">
          <span className="fa fa-user-check"></span>
        </button>)
      }
    }
    return false;
  }
  
  /*
  * render candidate
  */
  render() {

    return (<div className="candidates-list my-4">
      <Loader loaded={this.state.candidatesLoaded} className="spinner">
        <div className="container text-light">
          <div className="row">
            {this._renderCandidate()}
            {this._transactionPublish()}
          </div>
        </div>
      </Loader>
    </div>);
  }
}
