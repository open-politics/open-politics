import React, { PureComponent } from 'react';
import {
  Label,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const gdp = payload.find(p => p.dataKey === 'gdp').value;
    const gdpGrowthRate = payload.find(p => p.dataKey === 'gdpGrowthRate').value;

    return (    
      <div className="custom-tooltip p-2 bg-transparent bg-opacity-80  shadow-xl rounded-xl backdrop-blur-lg">
        <p className="intro text-sm text-black dark:text-white">{`GDP: ${gdp} billion $`}</p>
        <p className="desc text-sm text-green-500">{`GDP Growth Rate: ${gdpGrowthRate}%`}</p>
      </div>
    );
  }

  return null;
};

export default class EconomicDataChart extends PureComponent {
  render() {
    const { data } = this.props;

    return (
      <div className="highlight-bar-charts" style={{ userSelect: 'none', width: '100%', maxWidth: '100%' }}>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart
            width={800}
            height={250}
            data={data}
          >
            <CartesianGrid strokeDasharray="0 0" opacity={0.1}/>
            <XAxis dataKey="name" />
            <YAxis yAxisId="1" />
            <YAxis orientation="right" yAxisId="2" />
            <Tooltip content={<CustomTooltip />} />
            <Line yAxisId="1" type="natural" dataKey="gdp" stroke="#8884d8" animationDuration={300} />
            <Line yAxisId="2" type="natural" dataKey="gdpGrowthRate" stroke="#82ca9d" animationDuration={300} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
}
