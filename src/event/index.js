import React, {Component} from 'react';
import {InternalPageLayout, Loading, TextField, Button} from '../ui';
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
          <TextField size={10} style={{fontSize: 35}} placeholder="name"
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
    _.forEach(data.items, (v, k) => {
      v.id = k;
    });
    const peopleCnt = this._parsePeopleCnt(data);

    const groupByOwner = _.groupBy(data.items, item => item.created_by);

    _.forEach(groupByOwner, (v, k) => {
      groupByOwner[k].total = v.reduce((prev, curr) => {
        return Number(prev) + Number(curr.price);
      }, 0);
    });

    return (
        <div>
          <p>{peopleCnt}</p>
          { Object.keys(groupByOwner).map(owner => {
            return (
                <div key={owner}>
                  <p>{owner} {groupByOwner[owner].total}</p>
                  {groupByOwner[owner].map(item => {
                    return <p key={item.id}>{item.price} - {item.name}</p>;
                  })}
                </div>);
          })}
        </div>
    );
  }

  _parsePeopleCnt(data) {
    return Object.keys(data).length;
  }

  render() {
    return (
        <InternalPageLayout>
          <div>
            <header>
              <h1>#fblonbff budget optimizer</h1>
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
