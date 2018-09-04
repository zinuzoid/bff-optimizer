import React, {Component} from 'react';
import {InternalPageLayout, Loading, TextField, Button, Panel} from '../ui';
import firebase from '../firebase';

const _ = require('lodash');

const database = firebase.database();

class Event extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      price: '',
      name: '',
      user: null,
      data: null,
    };

    this.eventId = this.props.match.params.eventId;

    this._changePrice = this._changePrice.bind(this);
    this._changeName = this._changeName.bind(this);
    this._onAdd = this._onAdd.bind(this);
    this._addItem = this._addItem.bind(this);
  }

  componentDidMount() {
    if (!firebase.auth().currentUser) {
      firebase.auth().signInAnonymously();
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          this.setState({
            user,
            loading: false,
          });
          this._startListen();
        }
      });
    } else {
      this.setState({user: firebase.auth().currentUser, loading: false});
      this._startListen();
    }
  }

  _startListen() {
    database.ref(`events/${this.eventId}`).on('value', snapshot => {
      if (!(this.state.user.uid in snapshot.val().members)) {
        this.props.history.push('/');
      }
      this.setState({data: snapshot});
    });
  }

  _renderAfterAuth() {
    return (
        <div>
          <TextField size={5} style={{fontSize: 35}} placeholder="£"
                     onChange={this._changePrice} value={this.state.price}/>
          <TextField size={10} style={{fontSize: 35}} placeholder="menu"
                     onChange={this._changeName} value={this.state.name}/>
          <Button style={{fontSize: 20}} onClick={this._onAdd}>+</Button>

          {this._renderData()}
        </div>
    );
  }

  _renderData() {
    if (!this.state.data) {
      return <Loading/>;
    }
    const data = this.state.data.val();
    let totalPrice = 0;
    _.forEach(data.items, (v, k) => {
      v.id = k;
      totalPrice += Number(v.price);
    });
    const peopleCnt = this._parsePeopleCnt(data);
    const leftOverBudget = (25 * peopleCnt) - (totalPrice * 1.125);

    const groupByOwner = _.groupBy(data.items, item => item.created_by);

    _.forEach(groupByOwner, (v, k) => {
      groupByOwner[k].total = v.reduce((prev, curr) => {
        return Number(prev) + Number(curr.price);
      }, 0);
      groupByOwner[k].name = data.members[k].name;
    });

    const rows = [];
    rows.push((<tr>
      <th></th>
      <th style={{
        textAlign: 'right',
        fontSize: 10,
        fontWeight: 'normal',
        color: '#666',
      }}>+12.5%
      </th>
    </tr>));

    _.forEach(groupByOwner, (v, k) => {
      const totalPerPeople = (v.total * 1.125).toFixed(2);
      rows.push((<tr style={{paddingTop: 4}}>
        <th style={{
          textAlign: 'left',
          padding: 8,
          paddingLeft: 4,
        }}>{v.name}</th>
        <th style={{
          textAlign: 'right',
          padding: 8,
          paddingLeft: 4,
          paddingRight: 4,
          color: totalPerPeople > 25 ? 'red' : 'green',
        }}>£{totalPerPeople}{totalPerPeople > 25
            ? <span>{' (over '}{totalPerPeople - 25}{')'}</span>
            : null}</th>
      </tr>));
      v.forEach(item => {
        rows.push((<tr style={{borderBottom: '1px solid #333', color: '#ccc'}}>
          <td style={{
            textAlign: 'left', padding: 4, paddingLeft: 16,
          }}>{item.name}</td>
          <td style={{textAlign: 'right', padding: 4}}>£{(Number(item.price) *
              1.125).toFixed(2)}</td>
        </tr>));
      });
    });

    return (
        <div>
          <Panel title="Overall" style={{marginTop: 20}}>
            <p>People = {peopleCnt} Budget = £{25 * peopleCnt}</p>
            <p>Spent = {(totalPrice * 1.125).toFixed(2)}</p>
            <p>Team leftover budget = </p><p
              style={{
                fontSize: 30,
                color: leftOverBudget > 0 ? 'green' : 'red',
              }}>£{leftOverBudget.toFixed(2)}</p>
          </Panel>
          <Panel title="Individual" style={{marginTop: 20}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <tbody>
              {rows}
              </tbody>
            </table>
          </Panel>
        </div>
    );
  }

  _parsePeopleCnt(data) {
    return Object.keys(data.members).length;
  }

  render() {
    return (
        <InternalPageLayout>
          <div>
            <header>
              <h1>#fblonbff budget optimizer</h1>
              <h1>PIN: {this.eventId}</h1>
            </header>
            {this.state.loading ? <Loading/> : this._renderAfterAuth()}
          </div>
        </InternalPageLayout>
    );
  }

  _changePrice(e) {
    this.setState({price: e.target.value});
  }

  _changeName(e) {
    this.setState({name: e.target.value});
  }

  _onAdd() {
    this._addItem(this.state.name, this.state.price);
    this.setState({
      price: '',
      name: '',
    });
  }

  _addItem(name, price) {
    database.ref(`events/${this.eventId}/items`).push().set({
      created_at: firebase.database.ServerValue.TIMESTAMP,
      created_by: this.state.user.uid,
      name,
      price: Number(price),
    });
  }
}

export default Event;
