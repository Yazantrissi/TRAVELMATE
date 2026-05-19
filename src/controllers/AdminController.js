const AdminAnalyticsModel = require('../models/AdminAnalyticsModel');
const TripModel = require('../models/TripModel');

// Dashboard stats
exports.getDashboard = async (req, res) => {
  try {
    const stats = await AdminAnalyticsModel.getStats();
    const recentBookings = await AdminAnalyticsModel.getRecentBookings();
    const tripsAvail = await AdminAnalyticsModel.getTripsAvailability();
    res.json({ stats, recentBookings, tripsAvail });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Manage trips (CRUD already in TripModel)
exports.createTrip = async (req, res) => {
  try {
    const trip = await TripModel.create(req.body);
    res.status(201).json({ id: trip });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

