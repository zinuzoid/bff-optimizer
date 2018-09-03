// @flow
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const config = {
  apiKey: 'AIzaSyDXm7nWLH3or4p6tqdraLS3RIror8GTYeo',
  authDomain: 'bff-optimizer.firebaseapp.com',
  databaseURL: 'https://bff-optimizer.firebaseio.com',
};

// debug only
Object.assign(window, {firebase});

firebase.initializeApp(config);

export {firebase};