import React, {Component} from 'react';
import {InternalPageLayout} from './ui';
import Home from './home';
import Event from './event';
import Admin from './admin';

import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';

class App extends Component {
  render() {
    return (
        <Router>
          <Switch>
            <Route exact path='/' component={Home}/>
            <Route exact path='/events/:eventId' component={Event}/>
            <Route exact path='/admin' component={Admin}/>
            <Route
                render={() => <InternalPageLayout>oops</InternalPageLayout>}/>
          </Switch>
        </Router>
    );
  }
}

export default App;
