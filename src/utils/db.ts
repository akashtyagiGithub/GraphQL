import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/graphql-api');
    console.log('MongoDB connected...');
  } catch (err) {
    if (err instanceof Error) {
      console.error('Database connection error:', err.message);
    } else {
      console.error('Unknown error:', err);
    }
    process.exit(1);
  }
};

export default connectDB;
