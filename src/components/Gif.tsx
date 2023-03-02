// LIBRARIES
import React, { memo, useMemo, useState } from 'react';
// UTILS
import { getRandomGif } from '@utils';
// COMPONENTS
import { Loader } from '@mantine/core';
// STYLES
import styles from '@styles/components/gif.module.scss';

type TGifProps = {
  isWinner: boolean;
};

export const Gif = memo(({ isWinner }: TGifProps) => {
  const [loading, setLoading] = useState(true);

  const altText = isWinner ? 'You won!' : 'You lost!';
  const src = useMemo(() => getRandomGif(isWinner), [isWinner]);

  const handleLoad = () => {
    setLoading(false);
  };

  return (
    <>
      <img className={loading ? styles.hidden : styles.visible} onLoad={handleLoad} src={src} alt={altText} />
      {loading && <Loader my={20} size="md" />}
    </>
  );
});
