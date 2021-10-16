import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { postGameState, postJoinRoom, postNewRoom } from '../../utils/api';
import { PLAYFIELD_SIZE } from '../../constants';

export type Position = {
  row: number;
  col: number;
};

export type Player = 'One' | 'Two';

export type InitialPlayfieldStateType = {
  hovered: Position[];
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

const initialState: InitialPlayfieldStateType = {
  hovered: [],
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

export const postGameData = createAsyncThunk('game/postData', async (data: any) => await postGameState(data));
export const createNewRoom = createAsyncThunk('game/createNewRoom', async (data: any) => await postNewRoom(data));
export const joinRoom = createAsyncThunk('game/joinRoom', async (data: any) => await postJoinRoom(data));

const playfieldSlice = createSlice({
  name: 'playfield',
  initialState,
  reducers: {
    hover: (state, action) => {
      state.hovered = action.payload;
    },
    place: (state, action) => {
      state.placed.push(...action.payload);
      if (state.player === 'One') {
        state.playerOneWallsLeft--;
      } else {
        state.playerTwoWallsLeft--;
      }

      if (state.turn === 'One') {
        state.turn = 'Two';
      } else {
        state.turn = 'One';
      }
    },
    move: (state, action) => {
      if (state.player === 'One') {
        state.playerOnePos = action.payload;
      } else {
        state.playerTwoPos = action.payload;
      }

      if (action.payload.row === 0) state.winner = 'One';
      if (action.payload.row === PLAYFIELD_SIZE) state.winner = 'Two';

      if (state.turn === 'One') {
        state.turn = 'Two';
      } else {
        state.turn = 'One';
      }
    },
    selectPlayer: (state, action) => {
      state.player = action.payload;
    },
    setRoomId: (state, action) => {
      state.roomId = action.payload;
    },
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
    startGame: (state) => {
      state.isGameStarted = true;
    },
  },
});

export const { hover, place, move, selectPlayer, setInitialData, setRoomId, setData, startGame } = playfieldSlice.actions;

export default playfieldSlice.reducer;
