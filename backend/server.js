require("dotenv").config();
const app = require("./app");
const { connection } = require("./models");

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await connection.sync({ force: false });
        console.log("Database synchronized");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
        });
    } catch (err) {
        console.error("Database sync failed:", err.message);
        process.exit(1);
    }
}

start();