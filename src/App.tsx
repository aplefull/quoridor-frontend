import React from 'react';
import Playfield from './components/Playfield';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import Menu from './components/Menu';

const App = () => {
  return (
    <div className="wrapper">
      <BrowserRouter>
        <Switch>
          <Route exact path="/">
            <Menu />
          </Route>
          <Route exact path="/play">
            <Playfield />
          </Route>
          <Redirect to="/" />
        </Switch>
      </BrowserRouter>
    </div>
  );
};

export default App;
