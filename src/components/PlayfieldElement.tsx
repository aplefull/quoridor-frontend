import { ELEMENTS, TElements } from '../constants/constants';
import Cell, { TCellProps } from './Cell';
import React, { memo } from 'react';
import { TWallProps, Wall } from './Wall';

type TPlayfieldElementProps = Omit<TWallProps, 'width' | 'height'> &
  Omit<TCellProps, 'size'> & {
    sizes: {
      cellSize: number;
      verticalWallWidth: number;
      verticalWallHeight: number;
      horizontalWallWidth: number;
      horizontalWallHeight: number;
    };
  };

export const PlayfieldElement = memo(
  ({
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
    sizes,
  }: TPlayfieldElementProps) => {
    if (type === ELEMENTS.TILE) {
      return (
        <Cell
          isCurrentTurn={isCurrentTurn}
          position={position}
          containsPlayerOne={containsPlayerOne}
          containsPlayerTwo={containsPlayerTwo}
          canGoHere={canGoHere}
          size={sizes.cellSize}
        />
      );
    }

    // TODO move to utils
    const getWallSize = (
      sizes: {
        cellSize: number;
        verticalWallWidth: number;
        verticalWallHeight: number;
        horizontalWallWidth: number;
        horizontalWallHeight: number;
      },
      type: TElements
    ) => {
      if (type === ELEMENTS.VERTICAL_WALL) {
        return {
          width: sizes.verticalWallWidth,
          height: sizes.verticalWallHeight,
        };
      }

      if (type === ELEMENTS.HORIZONTAL_WALL) {
        return {
          width: sizes.horizontalWallWidth,
          height: sizes.horizontalWallHeight,
        };
      }

      return {
        width: sizes.verticalWallWidth,
        height: sizes.horizontalWallHeight,
      };
    };

    const { width, height } = getWallSize(sizes, type);

    return (
      <Wall
        position={position}
        type={type}
        isHovered={isHovered}
        onHover={onHover}
        canPlace={canPlace}
        isPlaced={isPlaced}
        width={width}
        height={height}
      />
    );
  }
);
