import { configureStore } from '@reduxjs/toolkit';
import playfiedSlice from './slices/playfiedSlice';

export const store = configureStore({
  reducer: {
    playfield: playfiedSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;