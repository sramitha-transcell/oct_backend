const mongoose = require('mongoose');

  // MongoDB connection options
  const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 20000, // Increased timeout
    socketTimeoutMS: 45000,
    family: 4  // Use IPv4, skip trying IPv6
  };
  
  // const MONGODB_URI="mongodb://adya_buyer:adya_buyer@4.240.98.192:27020/Atma-buyerapp"
  // Connect to MongoDB with retry logic
  export const connectWithRetry = async (MONGODB_URI:string) => {
    console.log("MONGODB_URI", MONGODB_URI);
    if (!MONGODB_URI) {
      console.error('MONGODB_URI is not defined.');
      return; // Exit if the URI is not defined
    }
    
    try {
      await mongoose.connect(MONGODB_URI, mongooseOptions);
      console.log('Successfully connected to MongoDB.');
    } catch (err) {
      console.error('MongoDB connection error:', err);
      console.log('Retrying connection in 5 seconds...');
      setTimeout(() => connectWithRetry(MONGODB_URI), 5000);
    }
  };
  

  