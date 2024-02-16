const mongoose = require('mongoose');

const RssFeedSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true,
  },
  lastUpdatedAt: {
    type: Date,
    default: null,
  },
});

const RssFeed = mongoose.model('RssFeed', RssFeedSchema);

module.exports = RssFeed;
