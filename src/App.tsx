import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from './constants/constants';
import { Index } from './pages/Index';
import Play from './pages/Play';

export const app = initializeApp(FIREBASE_CONFIG);
export const db = getFirestore();

const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/play/:roomId/:player',
    element: <Play />,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
