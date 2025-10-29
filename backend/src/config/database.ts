import mongoose from "mongoose";
import config from './env';

const connectToDatabase = async () => {
    if (mongoose.connection.readyState === 1) {
        return;
    }

    await mongoose.connect(config.mongoUri);
};

export default connectToDatabase;