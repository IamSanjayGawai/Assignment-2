// TransactionsStatistics.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionsStatistics = ({ selectedMonth }) => {
  const [statistics, setStatistics] = useState({});

  const Base_URL = import.meta.env.VITE_BACKEND_URL;

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${Base_URL}/statistics?month=${selectedMonth}`);
      setStatistics(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [selectedMonth]);

  return (
    <div>
      <h2>Transactions Statistics</h2>
      <p>Total Sale Amount: {statistics.totalSaleAmount}</p>
      <p>Total Sold Items: {statistics.totalSoldItems}</p>
      <p>Total Not Sold Items: {statistics.totalNotSoldItems}</p>
    </div>
  );
};

export default TransactionsStatistics;
