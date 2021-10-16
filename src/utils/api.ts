import { io } from 'socket.io-client';

export const socket = io('http://localhost:3030');

export const postGameState = async (data: any) => {
  socket.send(data);
};

export const postNewRoom = async (data: any) => {
  socket.emit('create', data);
};

export const postJoinRoom = async (data: any) => {
  socket.emit('join', data);
};
