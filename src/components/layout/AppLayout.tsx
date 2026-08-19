import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const [menuAcik, setMenuAcik] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar acik={menuAcik} kapat={() => setMenuAcik(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar menuAc={() => setMenuAcik(true)} />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>);

}