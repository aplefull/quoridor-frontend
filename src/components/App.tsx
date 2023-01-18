// LIBRARIES
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// COMPONENTS
import { Routes, Providers } from '@components';
// CONSTANTS
import { FIREBASE_CONFIG } from '@constants';

export const app = initializeApp(FIREBASE_CONFIG);
export const db = getFirestore();

export const App = () => {
  return (
    <Providers>
      <Routes />
    </Providers>
  );
};
