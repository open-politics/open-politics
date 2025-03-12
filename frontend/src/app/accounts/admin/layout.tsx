'use client'

import React from 'react';
import withAdminAuth from '@/hooks/withAdminAuth';

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <main>{children}</main>
    </div>
  );
}

export default withAdminAuth(AdminLayout);