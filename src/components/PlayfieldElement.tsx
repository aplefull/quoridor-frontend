import { ELEMENTS } from '../constants/constants';
import Cell, { TCellProps } from './Cell';
import React from 'react';
import { TWallProps, Wall } from './Wall';

type TPlayfieldElementProps = TWallProps & TCellProps;

export const PlayfieldElement = ({
  type,
  isHovered,
  position,
  onHover,
  canPlace,
  isPlaced,
  containsPlayerOne,
  containsPlayerTwo,
  canGoHere,
  isCurrentTurn,
}: TPlayfieldElementProps) => {
  if (type === ELEMENTS.TILE) {
    return (
      <Cell
        isCurrentTurn={isCurrentTurn}
        position={position}
        containsPlayerOne={containsPlayerOne}
        containsPlayerTwo={containsPlayerTwo}
        canGoHere={canGoHere}
      />
    );
  }

  return (
    <Wall
      position={position}
      type={type}
      isHovered={isHovered}
      onHover={onHover}
      canPlace={canPlace}
      isPlaced={isPlaced}
    />
  );
};
