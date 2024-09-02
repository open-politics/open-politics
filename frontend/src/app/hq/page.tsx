'use client';
import React from 'react';
import SSAREDashboard from '@/components/SSAREDashboard';

export { SSAREDashboard };

const HQPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <h1 className="text-2xl font-bold p-4">HQ Dashboard</h1>
      <SSAREDashboard />
    </div>
  );
};

export default HQPage;