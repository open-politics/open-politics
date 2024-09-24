import React from 'react';

const SSAREDashboard: React.FC = () => {
  return (
    <div className="w-full h-screen">
      <iframe
        src="api/v1/locations/dashboard"
        className="w-full h-full border-none"
        title="SSARE Dashboard"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      />
    </div>
  );
};

export default SSAREDashboard;