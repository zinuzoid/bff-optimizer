import React, {Component} from 'react';
import {
  InternalPageLayout,
  Loading,
  Button,
  TextField,
  VBox,
  BoxItem,
} from '../ui';
import {getUniqueRandomEventId} from '../event-helper';
import firebase from '../firebase';

const platform = require('platform');

const database = firebase.database();

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      user: null,
      eventId: null,
      name: '',
      pin: '',
    };

    this._onNameChange = this._onNameChange.bind(this);
    this._onPinChange = this._onPinChange.bind(this);
    this._goEvent = this._goEvent.bind(this);
    this._joinEvent = this._joinEvent.bind(this);
  }

  componentDidMount() {
    firebase.auth().signInAnonymously();
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({
          user,
          loading: false,
        });
      }
    });
  }

  _renderAfterAuth() {
    return (
        <InternalPageLayout>
          <p>Token: {this.state.user.uid}</p>
          <VBox>
            <BoxItem>
              <TextField size={10} onChange={this._onNameChange}
                         value={this.state.name}
                         style={{fontSize: 40}} placeholder="Name"/>
            </BoxItem>
            <BoxItem>
              <TextField size={4} maxLength={4}
                         onChange={(e) => this._onPinChange(e)}
                         value={this.state.pin} style={{fontSize: 40}}
                         placeholder="PIN"/>
            </BoxItem>
          </VBox>
          {this.state.eventId && <p>EventId: {this.state.eventId}</p>}
          <Button onClick={() => this._goEvent(false)}
                  style={bigButtonStyle}>I&apos;m Guest</Button>
          <Button onClick={() => this._goEvent(true)}
                  style={bigButtonStyle}>I&apos;m Host</Button>
        </InternalPageLayout>
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

  _newEvent() {
    return getUniqueRandomEventId(database).then(eventId => {
      this.setState({eventId});
      return eventId;
    }).then(eventId => {
      return database.ref('events').update({
        [eventId]: {
          info: {
            created_at: firebase.database.ServerValue.TIMESTAMP,
            created_by: this.state.user.uid,
          },
          members: {},
        },
      }).then(() => eventId);
    });
  }

  _joinEvent(eventId) {
    return database.ref(`events/${eventId}/members`).update({
      [this.state.user.uid]: {
        created_at: firebase.database.ServerValue.TIMESTAMP,
        name: this.state.name,
        platform: JSON.parse(JSON.stringify(platform)),
      },
    }).then(() => eventId);
  }

  _goEvent(isHost) {
    this.setState({loading: true});
    if (isHost) {
      this._newEvent().then(this._joinEvent).then(eventId => {
        this.props.history.push(`/events/${eventId}`);
      });
    } else if (this.state.pin) {
      this._joinEvent(this.state.pin).then(eventId => {
        this.props.history.push(`/events/${eventId}`);
      });
    }
  }

  _onNameChange(e) {
    this.setState({name: e.target.value});
  }

  _onPinChange(e) {
    this.setState({pin: e.target.value});
  }
}

const bigButtonStyle = {fontSize: 40, padding: 40, margin: 20};

export default Home;
