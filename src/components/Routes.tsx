import { createBrowserRouter, Navigate, Params, redirect, RouterProvider } from 'react-router-dom';
import { validate } from 'uuid';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { selectPlayer, setData, setInitialData, setRoomId } from '../redux/slices/playfiedSlice';
import { Index } from '../pages/Index';
import { ErrorPage } from '../pages/ErrorPage';
import Play from '../pages/Play';
import React from 'react';
import { db } from '../App';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';

export const Routes = () => {
  const dispatch = useDispatch<AppDispatch>();

  const loader = async ({ params }: { params: Params }) => {
    const { roomId, player } = params;

    if (!roomId || !validate(roomId)) {
      throw new Error(`Invalid room id: ${roomId}`);
    }

    if (player && player !== 'One' && player !== 'Two') {
      throw new Error(`Invalid player: ${player}`);
    }

    const docRef = doc(db, 'rooms', roomId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    const data = docSnap.data();

    if (player) {
      await updateDoc(docRef, {
        isGameStarted: true,
      });

      dispatch(selectPlayer(player));
      dispatch(setRoomId(roomId));

      onSnapshot(docRef, (doc) => {
        dispatch(setData(doc.data()));
      });
    } else {
      await updateDoc(docRef, {
        isGameStarted: true,
      });

      dispatch(
        setInitialData({
          turn: data.turn,
          player: data.initialPlayer === 'One' ? 'Two' : 'One',
        })
      );

      redirect(`/play/${roomId}/${player}`);
    }

    return null;
  };

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Index />,
      errorElement: <ErrorPage />,
    },
    {
      path: '/play/:roomId',
      element: <Play />,
      errorElement: <ErrorPage />,
      loader,
    },
    {
      path: '/play/:roomId/:player',
      element: <Play />,
      errorElement: <ErrorPage />,
      loader,
    },
    {
      path: '*',
      element: <Navigate to="/" />,
    },
  ]);

  return <RouterProvider router={router} />;
};
