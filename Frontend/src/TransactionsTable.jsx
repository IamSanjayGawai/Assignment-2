// TransactionsTable.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionsTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState('3');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const Base_URL = import.meta.env.VITE_BACKEND_URL;

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${Base_URL}/transactions?month=${month}&search=${search}&page=${page}`);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [month, search, page]);

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  return (
    <div>
      <h2>Transactions Table</h2>
      <label>Select Month: </label>
      <select value={month} onChange={(e) => setMonth(e.target.value)}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <option key={m} value={m}>
            {new Date(2021, m - 1, 1).toLocaleString('default', { month: 'long' })}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Search Transaction"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction._id}>
              <td>{transaction.title}</td>
              <td>{transaction.description}</td>
              <td>{transaction.price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handlePreviousPage}>Previous</button>
      <button onClick={handleNextPage}>Next</button>
    </div>
  );
};

export default TransactionsTable;
