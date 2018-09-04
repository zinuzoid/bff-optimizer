import React, {Component} from 'react';
import {InternalPageLayout, Loading, TextField, Button} from '../ui';
import firebase from '../firebase';

const database = firebase.database();

class Event extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      price: '',
      name: '',
      user: null,
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
        this.setState({
          user,
          loading: false,
        });
      });
    } else {
      this.setState({user: firebase.auth().currentUser, loading: false});
    }
  }

  _renderAfterAuth() {
    return (
        <div>
          <TextField size={5} style={{fontSize: 35}} placeholder="£"
                     onChange={this._changePrice} value={this.state.price}/>
          <TextField size={10} style={{fontSize: 35}} placeholder="name"
                     onChange={this._changeName} value={this.state.name}/>
          <Button style={{fontSize: 20}} onClick={this._onAdd}>+</Button>
        </div>
    );
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
      price,
    });
  }
}

export default Event;
