// LIBRARIES
import { memo } from 'react';
// COMPONENTS
import { Menu } from '@components';
// STYLES
import globalStyles from '../css/global.module.scss';

export const IndexPage = memo(() => {
  return (
    <div className={globalStyles.wrapper}>
      <Menu />
    </div>
  );
});
