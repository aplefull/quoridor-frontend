import React from 'react';
import Playfield from './components/Playfield';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import Menu from './components/Menu';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from './constants/constants';

export const app = initializeApp(FIREBASE_CONFIG);
export const db = getFirestore();

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
