import React from 'react';
import {Client} from 'node-rest-client';
import {_} from 'underscore';
import {API} from "./const.js";
import '../../../node_modules/flatpickr/dist/themes/light.css';
import Flatpickr from 'react-flatpickr';
var moment = require("moment");
var client = new Client();
console.log('api'+API);
/*
  candidateList compnent props came from logged user state
  <List/>
*/
export class List extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      ballotshistory: false,
      loaded: false,
      startDate: moment().format('YYYY-MM-DD'),
      endDate: moment().add(+1, 'days').format('YYYY-MM-DD')
    };
  };

 /**
  * send request to blockchain when date changed
  * it will query between startDate with 00:00:00 to endDate with 00:00:00
  */

  _handleChangeDate() {
    const _this = this;
    // get votes
    client.get(API+"/ballotshistory/" + this.state.startDate + "/" + this.state.endDate, function(data, response) {
      _this.setState({ballotshistory: data, loaded: true}); // set the state
    });
  }
  /*
  * Date button render: start Date
  * */
  _startDateButton(){
    const {startDate} = this.state;
    return (
      <div className="col-md-2">
        <div className="input-group  mb-1">
          <Flatpickr className="form-control" value={startDate} onChange={startDate => {
              this.setState({
                startDate: moment(new Date(startDate)).format('YYYY-MM-DD')
              });
              this._handleChangeDate();
            }}/>
        </div>
      </div>
    )
  }
  /*
  * Date button render: end Date
  * */
  _endDateButton(){
    const {endDate} = this.state;
    return (
      <div className="col-md-2">
        <div className="input-group mb-1">
          <Flatpickr className="form-control" value={endDate} onChange={endDate => {
              this.setState({
                endDate: moment(new Date(endDate)).format('YYYY-MM-DD')
              });
              this._handleChangeDate();
            }}/>
        </div>
      </div>
    )
  }
  /**
   * show the ballot transaction id with time
   */
  _listBallotTransaction() {
    return _.map(this.state.ballotshistory, function(vote, k) {
      let date = ((vote.timestamp).split('.')[0]).replace('T', ' ')
      return (<div className="row" key={k}>
        <div className="col-md-2">
          <small>{date}</small>
        </div>
        <div className="col-md-8 text-left break">{vote.transactionId}</div>
        <div className="col-md-2 text-right text-uppercase">{(vote.candidate).split('#')[1]}</div>
        <div className="col-md-12"><hr/></div>
      </div>)
    });

  }
  /*
  * mount function
  */
  componentWillMount() {
    const _this = this;
    // get list of candidate
    client.get(API+"/ballotshistory/" + this.state.startDate + "/" + this.state.endDate, function(data, response) {
      _this.setState({ballotshistory: data, loaded: true}); // set the state
    });
  };
  /*
  * render menu
  */
  render() {
    
    return (<div className="listBallot container text-light">
      <div className="row">
        <div className="col">

          <div className="row">
            <div className="col-md-8">
              <h2 className="text-uppercase text-light"><big>Ballots History</big></h2>
            </div>
            {this._startDateButton()}
            {this._endDateButton()}           
          </div>
          <hr className="bg-light py-1 mt-0"/>
        </div>
      </div>
      {this._listBallotTransaction()}
    </div>);
  };

};
