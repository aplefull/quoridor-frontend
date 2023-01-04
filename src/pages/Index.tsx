import globalStyles from '../css/global.module.scss';
import Menu from '../components/Menu';
import React from 'react';

export const Index = () => {
  return (
    <div className={globalStyles.wrapper}>
      <Menu />
    </div>
  );
};
