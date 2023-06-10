import React from 'react';
import { MoonLoader } from 'react-spinners';

// Spinner component
// Used for loading states
const Spinner = ({ className }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <MoonLoader color={'#293241'} />
    </div>
  );
};

export default Spinner;
