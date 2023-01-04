import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from './constants/constants';
import { Index } from './pages/Index';
import Play from './pages/Play';

export const app = initializeApp(FIREBASE_CONFIG);
export const db = getFirestore();

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <Index />
        </Route>
        <Route exact path="/play">
          <Play />
        </Route>
        <Redirect to="/" />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
