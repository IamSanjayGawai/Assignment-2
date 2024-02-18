

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionsBarChart = ({ selectedMonth }) => {
  const [barChartData, setBarChartData] = useState([]);

  const fetchBarChartData = async () => {
    try {
      const response = await axios.get(`/bar-chart?month=${selectedMonth}`);
      const data = Array.isArray(response.data) ? response.data : [];
      setBarChartData(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBarChartData();
  }, [selectedMonth]);

  return (
    <div>
      <h2>Transactions Bar Chart</h2>
      <ul>
        {barChartData.map((data) => (
          <li key={data.range}>
            {data.range}: {data.count}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionsBarChart;
