import { cloneDeep } from 'lodash';

export const ENVIRONMENT = process.env.NODE_ENV;

export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDVQdMWVjV5taAPUp27i6btz9ag1cHpVr8',
  authDomain: 'quoridor-game-c684f.firebaseapp.com',
  databaseURL: 'https://quoridor-game-c684f-default-rtdb.firebaseio.com',
  projectId: 'quoridor-game-c684f',
  storageBucket: 'quoridor-game-c684f.appspot.com',
  messagingSenderId: '1020112765303',
  appId: '1:1020112765303:web:d575477aa29fe6d040a172',
};

export const ROW_TYPES = {
  FULL: 'FULL',
  SMALL: 'SMALL',
};

export const ELEMENTS = {
  TILE: 'tile',
  VERTICAL_WALL: 'vertical_wall',
  HORIZONTAL_WALL: 'horizontal_wall',
  INTERSECTION: 'intersection',
};

const FULL_ROW = {
  type: ROW_TYPES.FULL,
  content: [
    { type: 'tile' },
    { type: 'vertical_wall', isActive: false, isHovered: false },
    { type: 'tile' },
    { type: 'vertical_wall', isActive: false, isHovered: false },
    { type: 'tile' },
    { type: 'vertical_wall', isActive: false, isHovered: false },
    { type: 'tile' },
    { type: 'vertical_wall', isActive: false, isHovered: false },
    { type: 'tile' },
    { type: 'vertical_wall', isActive: false, isHovered: false },
    { type: 'tile' },
    { type: 'vertical_wall', isActive: false, isHovered: false },
    { type: 'tile' },
    { type: 'vertical_wall', isActive: false, isHovered: false },
    { type: 'tile' },
    { type: 'vertical_wall', isActive: false, isHovered: false },
    { type: 'tile' },
  ],
};

const SMALL_ROW = {
  type: ROW_TYPES.SMALL,
  content: [
    { type: 'horizontal_wall', isActive: false, isHovered: false },
    { type: 'intersection', isActive: false, isHovered: false },
    { type: 'horizontal_wall', isActive: false, isHovered: false },
    { type: 'intersection', isActive: false, isHovered: false },
    { type: 'horizontal_wall', isActive: false, isHovered: false },
    { type: 'intersection', isActive: false, isHovered: false },
    { type: 'horizontal_wall', isActive: false, isHovered: false },
    { type: 'intersection', isActive: false, isHovered: false },
    { type: 'horizontal_wall', isActive: false, isHovered: false },
    { type: 'intersection', isActive: false, isHovered: false },
    { type: 'horizontal_wall', isActive: false, isHovered: false },
    { type: 'intersection', isActive: false, isHovered: false },
    { type: 'horizontal_wall', isActive: false, isHovered: false },
    { type: 'intersection', isActive: false, isHovered: false },
    { type: 'horizontal_wall', isActive: false, isHovered: false },
    { type: 'intersection', isActive: false, isHovered: false },
    { type: 'horizontal_wall', isActive: false, isHovered: false },
  ],
};

export const PLAYFIELD_INITIAL_STATE = [
  cloneDeep(FULL_ROW),
  cloneDeep(SMALL_ROW),
  cloneDeep(FULL_ROW),
  cloneDeep(SMALL_ROW),
  cloneDeep(FULL_ROW),
  cloneDeep(SMALL_ROW),
  cloneDeep(FULL_ROW),
  cloneDeep(SMALL_ROW),
  cloneDeep(FULL_ROW),
  cloneDeep(SMALL_ROW),
  cloneDeep(FULL_ROW),
  cloneDeep(SMALL_ROW),
  cloneDeep(FULL_ROW),
  cloneDeep(SMALL_ROW),
  cloneDeep(FULL_ROW),
  cloneDeep(SMALL_ROW),
  cloneDeep(FULL_ROW),
];

export const PLAYFIELD_SIZE = PLAYFIELD_INITIAL_STATE.length - 1;
