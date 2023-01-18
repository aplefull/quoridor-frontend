// LIBRARIES
import { validate } from 'uuid';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, Navigate, Params, redirect, RouterProvider } from 'react-router-dom';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
// REDUX
import { selectPlayer, setData, setInitialData, setRoomId, AppDispatch } from '@redux';
// COMPONENTS
import { db } from '@components';
// PAGES
import { IndexPage, ErrorPage, PlayPage } from '@pages';

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
      element: <IndexPage />,
      errorElement: <ErrorPage />,
    },
    {
      path: '/play/:roomId',
      element: <PlayPage />,
      errorElement: <ErrorPage />,
      loader,
    },
    {
      path: '/play/:roomId/:player',
      element: <PlayPage />,
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
