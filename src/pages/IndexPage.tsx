// LIBRARIES
import { memo } from 'react';
// COMPONENTS
import { Menu } from '@components';
// STYLES
import styles from '@styles/pages/index-page.module.scss';

export const IndexPage = memo(() => {
  return (
    <div className={styles.wrapper}>
      <Menu />
    </div>
  );
});
