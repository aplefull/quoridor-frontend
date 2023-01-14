import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import React, { memo } from 'react';
import { getWallCoords, isBlockingPath, isLegalWallPlacement } from '../utils/utils';
import { toast } from 'react-toastify';
import { place, Position } from '../redux/slices/playfiedSlice';
import cx from 'classnames';
import { ELEMENTS, TElements } from '../constants/constants';
import styles from '../css/components/wall.module.scss';

export type TWallProps = {
  type: TElements;
  position: Position;
  isHovered: boolean;
  isPlaced: boolean;
  canPlace: boolean;
  width: number;
  height: number;
  onHover: (position: Position[]) => void;
};

export const Wall = memo(({ type, position, isHovered, isPlaced, canPlace, width, height, onHover }: TWallProps) => {
  const dispatch = useDispatch<AppDispatch>();
  // TODO don't use redux for this
  const { placed, playerOnePos, playerTwoPos } = useSelector((state: RootState) => state.playfield);

  const isLegalPlacement = isLegalWallPlacement(getWallCoords(position, type), placed);

  const handleMouseleave = () => {
    onHover([]);
  };

  const handleMouseenter = () => {
    if (canPlace && isLegalPlacement) {
      onHover(getWallCoords(position, type));
    }
  };

  const handleClick = () => {
    // TODO move to top of component
    const newWallCoords = getWallCoords(position, type);

    if (!canPlace) return;

    if (isBlockingPath(playerOnePos, playerTwoPos, newWallCoords, placed)) {
      toast("You can't place a wall here!");
      return;
    }

    if (isLegalPlacement) {
      dispatch(place(newWallCoords));
    }
  };

  const style = {
    width: `${width}px`,
    height: `${height}px`,
  };

  return (
    <div
      style={style}
      className={cx(styles.wall, {
        [styles.horizontal]: type === ELEMENTS.HORIZONTAL_WALL,
        [styles.vertical]: type === ELEMENTS.VERTICAL_WALL,
        [styles.intersection]: type === ELEMENTS.INTERSECTION,
        [styles.hovered]: isHovered,
        [styles.placed]: isPlaced,
      })}
      onMouseEnter={handleMouseenter}
      onMouseLeave={handleMouseleave}
      onClick={handleClick}
    />
  );
});
