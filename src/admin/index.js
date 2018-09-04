import React, {Component} from 'react';
import {Button, InternalPageLayout} from '../ui';
import firebase from '../firebase';

const database = firebase.database();

class Admin extends Component {
  render() {
    return (
        <InternalPageLayout>
          <div>
            <Button onClick={() => this._onClick()} danger>TRUNCATE</Button>
            <Button onClick={() => this._newItem()}>New Item
            </Button>
            <Button onClick={() => this._newRef()}>New Ref</Button>
          </div>
        </InternalPageLayout>
    );
  }

  _onClick() {
    const user = firebase.auth().currentUser;
    if (user) {
      database.ref('events').remove();
    }
  }

  _newItem() {
    const newItem = database.ref(`events/${this.state.eventId}/items`).
        push();
    newItem.set({
      created_at: firebase.database.ServerValue.TIMESTAMP,
      created_by: this.state.user.uid,
      name: 'Jim',
    });
    console.log(newItem.key);
  }

}

export default Admin;
