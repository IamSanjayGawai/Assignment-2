const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const cors = require('cors');

const app = express();
const PORT = 3000;
app.use(cors());

mongoose.connect('mongodb://localhost:27017/assignment-backend');

const transactionSchema = new Schema({
  dateOfSale: Date,
  category: String, // Add this line if not present
});

const Transaction = model('Transaction', transactionSchema);

app.get('/initialize-database', async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const seedData = response.data;
    await Transaction.insertMany(seedData);
    res.status(200).json({ message: 'Database initialized with seed data.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/transactions', async (req, res) => {
  try {
    const { month = 1, search = '', page = 1, perPage = 10 } = req.query;
    const transactionsQuery = {
      dateOfSale: { $gte: new Date(`${month}/01`), $lt: new Date(`${parseInt(month) + 1}/01`) },
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { price: { $regex: search, $options: 'i' } },
      ],
    };
    const totalTransactions = await Transaction.countDocuments(transactionsQuery);
    const transactions = await Transaction.find(transactionsQuery)
      .skip((page - 1) * perPage)
      .limit(perPage);
    res.status(200).json({ totalTransactions, transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Calculate total sale amount, number of sold items, and number of not sold items for the selected month
app.get('/statistics', async (req, res) => {
  try {
    const { month } = req.query;

    const totalSaleAmount = await Transaction.aggregate([
      {
        $match: {
          dateOfSale: { $gte: new Date(`${month}/01`), $lt: new Date(`${month + 1}/01`) },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$price' }, // Change this based on your actual price field
          totalSoldItems: { $sum: 1 },
        },
      },
    ]);

    const totalNotSoldItems = await Transaction.countDocuments({
      dateOfSale: { $gte: new Date(`${month}/01`), $lt: new Date(`${month + 1}/01`) },
      sold: false, // Adjust this based on your data structure
    });

    res.status(200).json({
      totalSaleAmount: totalSaleAmount.length > 0 ? totalSaleAmount[0].totalAmount : 0,
      totalSoldItems: totalSaleAmount.length > 0 ? totalSaleAmount[0].totalSoldItems : 0,
      totalNotSoldItems,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Generate a bar chart response with price ranges and the number of items in each range for the selected month
app.get('/bar-chart', async (req, res) => {
  try {
    const { month } = req.query;

    const priceRanges = [
      { min: 0, max: 100 },
      { min: 101, max: 200 },
      { min: 201, max: 300 },
      { min: 301, max: 400 },
      { min: 401, max: 500 },
      { min: 501, max: 600 },
      { min: 601, max: 700 },
      { min: 701, max: 800 },
      { min: 801, max: 900 },
      { min: 901, max: Infinity },
    ];

    const barChartData = await Promise.all(
      priceRanges.map(async ({ min, max }) => {
        const count = await Transaction.countDocuments({
          dateOfSale: { $gte: new Date(`${month}/01`), $lt: new Date(`${month + 1}/01`) },
          price: { $gte: min, $lt: max },
        });
        return { range: `${min}-${max}`, count };
      })
    );

    res.status(200).json(barChartData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Generate a pie chart response with unique categories and the number of items from each category for the selected month
app.get('/pie-chart', async (req, res) => {
  try {
    const { month } = req.query;

    const pieChartData = await Transaction.aggregate([
      {
        $match: {
          dateOfSale: { $gte: new Date(`${month}/01`), $lt: new Date(`${month + 1}/01`) },
        },
      },
      {
        $group: {
          _id: '$category', // Change this based on your actual category field
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json(pieChartData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Fetch data from all three APIs, combine responses, and send a final combined JSON response
app.get('/combined-response', async (req, res) => {
  try {
    const transactions = await axios.get('http://localhost:3000/transactions', { params: req.query });
    const statistics = await axios.get('http://localhost:3000/statistics', { params: req.query });
    const barChart = await axios.get('http://localhost:3000/bar-chart', { params: req.query });
    const pieChart = await axios.get('http://localhost:3000/pie-chart', { params: req.query });

    const combinedResponse = {
      transactions: transactions.data,
      statistics: statistics.data,
      barChart: barChart.data,
      pieChart: pieChart.data,
    };

    res.status(200).json(combinedResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
