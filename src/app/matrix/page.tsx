import React from 'react';
import { getSession } from '@/app/actions';
import { getCompleteMatrixData } from '@/lib/matrixData';
import MatrixClient from './MatrixClient';

export const dynamic = 'force-dynamic';

export default async function MatrixPage() {
  const session = await getSession();
  const isLoggedIn = !!session.isLoggedIn;

  const initialData = await getCompleteMatrixData();

  return (
    <MatrixClient
      initialData={initialData}
      isLoggedIn={isLoggedIn}
    />
  );
}
