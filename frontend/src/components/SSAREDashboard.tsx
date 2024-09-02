import React from 'react';

const SSAREDashboard: React.FC = () => {
  return (
    <div className="w-full h-screen">
      <iframe
        src="http://localhost:8089"
        className="w-full h-full border-none"
        title="SSARE Dashboard"
      />
    </div>
  );
};

export default SSAREDashboard;