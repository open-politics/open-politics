import React from 'react';
import Search from '../components/Search';

const Home: React.FC = () => {
  return (
    <div>
      <header>
        <h1>News Dashboard</h1>
      </header>
      <main>
        <Search />
      </main>
    </div>
  );
};

export default Home;
