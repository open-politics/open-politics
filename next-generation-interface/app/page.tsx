import React from 'react';
import Globe from '../components/Globe';

interface Props {
  geojsonData: any;
}

const HomePage: React.FC<Props> = ({ geojsonData }) => {
  return (
    <div>
      <h1>Globe</h1>
      <Globe geojsonData={geojsonData} />
    </div>
  );
};

export async function getServerSideProps() {
  const res = await fetch('http://localhost:8000/api/globe-data/country');
  const geojsonData = await res.json();

  return {
    props: {
      geojsonData
    }
  };
}

export default HomePage;
