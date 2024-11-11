import React from 'react';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <h2 className="text-xl font-bold mb-4">Sidebar</h2>
      <ul>
        <li className="mb-2"><a href="/link1">Link 1</a></li>
        <li className="mb-2"><a href="/link2">Link 2</a></li>
        <li className="mb-2"><a href="/link3">Link 3</a></li>
      </ul>
    </aside>
  );
};

export default Sidebar;