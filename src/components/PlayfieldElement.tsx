// LIBRARIES
import { memo } from 'react';
// COMPONENTS
import { Cell, Wall, TCellProps, TWallProps } from '@components';
// CONSTANTS
import { ELEMENTS } from '@constants';
// UTILS
import { getWallSize } from '@utils';

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
    isVerticalIntersection,
    isHorizontalIntersection,
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
        isHorizontalIntersection={isHorizontalIntersection}
        isVerticalIntersection={isVerticalIntersection}
      />
    );
  }
);
