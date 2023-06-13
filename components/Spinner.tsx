import React from 'react';
import { MoonLoader } from 'react-spinners';
import { IconProps } from '../types';

// Spinner component
// Used for loading states
const Spinner: React.FC<IconProps> = ({ className }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <MoonLoader color={'#293241'} />
    </div>
  );
};

export default Spinner;
