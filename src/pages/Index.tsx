import globalStyles from '../css/global.module.scss';
import { Menu } from '../components/Menu';
import React, { memo } from 'react';

export const Index = memo(() => {
  return (
    <div className={globalStyles.wrapper}>
      <Menu />
    </div>
  );
});
