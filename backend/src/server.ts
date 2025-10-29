import config from "./config/env";
import connectToDatabase from "./config/database";
import app from "./app";

const startServer = async () => {
    try {
        await connectToDatabase();

        app.listen(config.port, () => {
            console.log(`API listening on port ${config.port}.`);
        });
    } catch (error) {
        console.error("Server failed to start:", error);
        process.exit(1);
    }
};

startServer();