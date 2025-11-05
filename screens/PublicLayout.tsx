import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicHeader } from '../components/PublicHeader';
import Footer from '../components/Footer';

const PublicLayout: React.FC = () => {
  return (
    <div className="bg-amo-beige font-sans min-h-screen flex flex-col">
      <PublicHeader />
      <main className="pt-24 flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
