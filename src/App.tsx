import React from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from './constants/constants';
import { Routes } from './components/Routes';
import { Providers } from './components/Providers';

export const app = initializeApp(FIREBASE_CONFIG);
export const db = getFirestore();

const App = () => {
  return (
    <Providers>
      <Routes />
    </Providers>
  );
};

export default App;
