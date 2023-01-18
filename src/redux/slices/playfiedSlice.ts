// LIBRARIES
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { cloneDeep } from 'lodash';
// CONSTANTS
import { PLAYFIELD_SIZE } from '@constants';
// REDUX
import { RootState } from '@redux';
// COMPONENTS
import { db } from '@components';

export type Position = {
  row: number;
  col: number;
};

export type Player = 'One' | 'Two';

export type InitialPlayfieldState = {
  placed: Position[];
  playerOnePos: Position;
  playerTwoPos: Position;
  playerOneWallsLeft: number;
  playerTwoWallsLeft: number;
  player: Player;
  turn: Player;
  isGameStarted: boolean;
  roomId: string | null;
  winner: Player | null;
};

type FirebasePlayfieldState = Pick<
  InitialPlayfieldState,
  | 'placed'
  | 'playerOnePos'
  | 'playerTwoPos'
  | 'playerOneWallsLeft'
  | 'playerTwoWallsLeft'
  | 'isGameStarted'
  | 'roomId'
  | 'turn'
  | 'winner'
> & {
  initialPlayer: Player;
};

const initialState: InitialPlayfieldState = {
  placed: [],
  playerOnePos: { row: 16, col: 8 },
  playerTwoPos: { row: 0, col: 8 },
  playerOneWallsLeft: 10,
  playerTwoWallsLeft: 10,
  player: 'One',
  turn: 'One',
  isGameStarted: false,
  roomId: null,
  winner: null,
};

export const createNewRoom = createAsyncThunk<void, { player: Player; roomId: string }, { state: RootState }>(
  'game/createNewRoom',
  async (data, { dispatch, getState }) => {
    const { player, roomId } = data;

    const { playfield } = getState();
    const { playerOnePos, playerTwoPos, playerOneWallsLeft, playerTwoWallsLeft, placed, winner, turn, isGameStarted } =
      playfield;

    if (!roomId) {
      console.error('Room id is not provided');
      return;
    }

    const docRef = doc(db, 'rooms', roomId);

    await setDoc(docRef, {
      initialPlayer: player,
      roomId,
      turn,
      isGameStarted,
      playerOneWallsLeft,
      playerTwoWallsLeft,
      playerOnePos,
      playerTwoPos,
      placed,
      winner,
    });

    onSnapshot(docRef, (doc) => {
      dispatch(setData(doc.data()));
    });
  }
);

export const restartGame = createAsyncThunk<void, void, { state: RootState }>(
  'game/restart',
  async (_, { getState }) => {
    const { playfield } = getState();
    const { roomId } = playfield;

    if (!roomId) {
      console.error('Room id is not provided');
      return;
    }

    const docRef = doc(db, 'rooms', roomId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { initialPlayer } = docSnap.data() as FirebasePlayfieldState;

      if (!initialPlayer) {
        console.error(`Initial player is ${initialPlayer}`);
        return;
      }

      const cleanData = {
        initialPlayer: initialPlayer,
        roomId: roomId,
        turn: 'One',
        isGameStarted: true,
        playerOneWallsLeft: 10,
        playerTwoWallsLeft: 10,
        playerOnePos: { row: 16, col: 8 },
        playerTwoPos: { row: 0, col: 8 },
        placed: [],
        winner: null,
      } satisfies FirebasePlayfieldState;

      await setDoc(docRef, cleanData, {
        merge: true,
      });
    }
  }
);

export const move = createAsyncThunk<InitialPlayfieldState, Position, { state: RootState }>(
  'game/move',
  async (data, { getState }) => {
    const { playfield } = getState();
    const { player, roomId, turn } = playfield;

    if (!roomId) {
      // TODO handle all errors properly
      console.error('Room id is not provided');
      return playfield;
    }

    const newState = cloneDeep(playfield);

    if (player === 'One') {
      newState.playerOnePos = data;
    } else {
      newState.playerTwoPos = data;
    }

    if (data.row === 0 && player === 'One') newState.winner = 'One';
    if (data.row === PLAYFIELD_SIZE && player === 'Two') newState.winner = 'Two';

    if (turn === 'One') {
      newState.turn = 'Two';
    } else {
      newState.turn = 'One';
    }

    const docRef = doc(db, 'rooms', roomId);

    await updateDoc(docRef, {
      playerOnePos: newState.playerOnePos,
      playerTwoPos: newState.playerTwoPos,
      turn: newState.turn,
      winner: newState.winner,
    });

    return newState;
  }
);

export const place = createAsyncThunk<InitialPlayfieldState, Position[], { state: RootState }>(
  'game/place',
  async (data, { getState }) => {
    const { playfield } = getState();
    const { placed, playerOneWallsLeft, playerTwoWallsLeft, turn, player, roomId } = playfield;

    if (!roomId) {
      console.error('Room id is not provided');
      return playfield;
    }

    const newState = cloneDeep(playfield);

    newState.placed = [...placed, ...data];
    if (player === 'One') {
      newState.playerOneWallsLeft = playerOneWallsLeft - 1;
    } else {
      newState.playerTwoWallsLeft = playerTwoWallsLeft - 1;
    }

    if (turn === 'One') {
      newState.turn = 'Two';
    } else {
      newState.turn = 'One';
    }

    const docRef = doc(db, 'rooms', roomId);

    await updateDoc(docRef, {
      placed: newState.placed,
      playerOneWallsLeft: newState.playerOneWallsLeft,
      playerTwoWallsLeft: newState.playerTwoWallsLeft,
      turn: newState.turn,
    });

    return newState;
  }
);

const playfieldSlice = createSlice({
  name: 'playfield',
  initialState,
  reducers: {
    selectPlayer: (state, action) => {
      state.player = action.payload;
    },
    setRoomId: (state, action) => {
      state.roomId = action.payload;
    },
    // TODO remove this
    setInitialData: (state, action) => {
      state.player = action.payload.player;
      state.turn = action.payload.turn;
    },
    setData: (state, action) => {
      state.turn = action.payload.turn;
      state.roomId = action.payload.roomId;
      state.isGameStarted = action.payload.isGameStarted;
      state.placed = action.payload.placed;
      state.playerOneWallsLeft = action.payload.playerOneWallsLeft;
      state.playerTwoWallsLeft = action.payload.playerTwoWallsLeft;
      state.winner = action.payload.winner;
      //  change them separately so order of keys is not changed
      state.playerOnePos.row = action.payload.playerOnePos.row;
      state.playerOnePos.col = action.payload.playerOnePos.col;
      state.playerTwoPos.row = action.payload.playerTwoPos.row;
      state.playerTwoPos.col = action.payload.playerTwoPos.col;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(move.fulfilled, (state, action) => {
      state.playerOnePos = action.payload.playerOnePos;
      state.playerTwoPos = action.payload.playerTwoPos;
      state.turn = action.payload.turn;
      state.winner = action.payload.winner;
    });

    builder.addCase(place.fulfilled, (state, action) => {
      state.playerOneWallsLeft = action.payload.playerOneWallsLeft;
      state.playerTwoWallsLeft = action.payload.playerTwoWallsLeft;
      state.turn = action.payload.turn;
      state.placed = action.payload.placed;
    });
  },
});

export const { selectPlayer, setInitialData, setRoomId, setData } = playfieldSlice.actions;

export default playfieldSlice.reducer;
