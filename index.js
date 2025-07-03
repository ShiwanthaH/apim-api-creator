import http from "http";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/index.js";
import axios from "axios";
import { registerDCRApp, generateAccessToken } from "./controllers/index.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", router);

const hostname = process.env.HOST || "localhost";
const port = process.env.PORT || 3000;

const server = http.createServer(app);

const args = process.argv.slice(2);
const autoCreateFlag = args.includes("--auto-create");
const countFlag = args.findIndex((arg) => arg === "--count");
const apiCount =
  countFlag !== -1 && args[countFlag + 1] ? parseInt(args[countFlag + 1]) : 5;

async function makeApiCreationRequest(count = 5) {
  try {
    console.log(
      `\n🚀 Making automatic API creation request for ${count} APIs...`
    );

    const response = await axios.post(
      `http://${hostname}:${port}/api/create`,
      {
        count: count,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 300000, // 5 minutes timeout
      }
    );

    console.log("\n✅ Automatic API creation completed successfully!");
    console.log(
      `📊 Summary: ${response.data.successful} successful, ${response.data.failed} failed`
    );

    console.log("Closing server after API creation...");
    server.close(() => {
      console.log("Server closed successfully.");
      process.exit(1);
    });
  } catch (error) {
    console.error("\n❌ Automatic API creation failed:", error.message);
    if (error.response && error.response.data) {
      console.error("Error details:", error.response.data);
    }
  }
}

// Initialize APIM authentication before starting server
async function initializeServer() {
  try {
    console.log("Registering DCR application...");
    await registerDCRApp();

    console.log("Generating access token...");
    await generateAccessToken();

    server.listen(port, hostname, () => {
      console.log(`Server running at http://${hostname}:${port}/`);
      // Check command line flags or environment variables
      const shouldAutoCreate =
        autoCreateFlag || process.env.AUTO_CREATE_APIS === "true";

      if (shouldAutoCreate) {
        const finalCount = autoCreateFlag
          ? apiCount
          : process.env.AUTO_CREATE_API_COUNT || 5;

        // Wait a moment for server to be fully ready
        setTimeout(() => {
          makeApiCreationRequest(parseInt(finalCount));
        }, 1000);
      } else {
        console.log("\n💡 Usage examples:");
        console.log("   node index.js --auto-create --count 100");
        console.log(
          "   AUTO_CREATE_APIS=true AUTO_CREATE_API_COUNT=50 node index.js"
        );
      }
    });
  } catch (error) {
    console.error("Failed to initialize server:", error);
    process.exit(1);
  }
}

initializeServer();
