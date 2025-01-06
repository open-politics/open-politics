'use client';
import React from 'react';
import OPOLDashboard from '@/components/OPOLDashboard';

export { OPOLDashboard };

const HQPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <h1 className="text-2xl font-bold p-4">HQ Dashboard</h1>
      <OPOLDashboard />
    </div>
  );
};

export default HQPage;