
'use client';

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import CreativeWorkstationApp from '@/components/CreativeWorkstationApp';

export default function CreativeWorkstation() {
  return (
    <DashboardLayout allowedRoles={['learner']}>
      <CreativeWorkstationApp />
    </DashboardLayout>
  );
}
