import React from 'react';
import TransactionsTable from './TransactionsTable';
import TransactionsStatistics from './TransactionsStatistics';
import TransactionsBarChart from './TransactionsBarChart';

const App = () => {
  return (
    <div>
      <TransactionsTable />
      <TransactionsStatistics />
      <TransactionsBarChart />
    </div>
  );
};

export default App;
