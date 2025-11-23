// Card for uniform styling of charts in Reporting & Analytics dashboard

import React from 'react';

type Props = {
  className?: string;
  children?: React.ReactNode;
};

const Card: React.FC<Props> = ({ className = '', children }) => {
  return (
    <div className={`bg-slate-900/60 border border-slate-700 rounded-lg p-4 shadow-sm ${className}`}>
      <div>{children}</div>
    </div>
  );
};

export default Card;
