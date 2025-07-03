import axios from "axios";
import https from "https";
import {
  API_ENDPOINT,
  BASEPATH,
  DCR_ENDPOINT,
  TOKEN_ENDPOINT,
} from "../constants/index.js";
import {
  API_PAYLOAD,
  DCR_AUTH_PAYLOAD,
  TOKEN_PAYLOAD,
} from "../data/payloads.js";
import generateCreationPayloads from "../utils/index.js";

export function registerDCRApp() {
  return new Promise((resolve, reject) => {
    const dcrRegisterUrl = `https://${process.env.APIM_HOST}:${process.env.APIM_PORT}${DCR_ENDPOINT}`;

    const data = JSON.stringify(DCR_AUTH_PAYLOAD);

    const credentials = `${process.env.APIM_ADMIN_USERNAME}:${process.env.APIM_ADMIN_PASSWORD}`;
    const base64Credentials = Buffer.from(credentials).toString("base64");

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: dcrRegisterUrl,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${base64Credentials}`,
      },
      data: data,
      httpsAgent: httpsAgent,
    };

    axios
      .request(config)
      .then((response) => {
        if (response) {
          process.env.APIM_CLIENT_ID = response.data.clientId;
          process.env.APIM_CLIENT_SECRET = response.data.clientSecret;
          console.log("DCR registration successful!");
          resolve(response.data);
        } else {
          console.error("No response received from DCR registration.");
          reject(new Error("No response received from DCR registration."));
        }
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
}

export function generateAccessToken() {
  return new Promise((resolve, reject) => {
    const tokenUrl = `https://${process.env.APIM_HOST}:${process.env.APIM_PORT}${TOKEN_ENDPOINT}`;

    const data = new URLSearchParams(TOKEN_PAYLOAD);

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: tokenUrl,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.APIM_CLIENT_ID}:${process.env.APIM_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      data: data.toString(),
      httpsAgent: httpsAgent,
    };

    axios
      .request(config)
      .then((response) => {
        if (!response || !response.data || !response.data.access_token) {
          console.error("Invalid response received from token generation.");
          reject(new Error("Invalid response received from token generation."));
          return;
        }
        process.env.APIM_ACCESS_TOKEN = response.data.access_token;
        process.env.APIM_REFRESH_TOKEN = response.data.refresh_token;
        console.log("Access token generated successfully!");
        resolve(response.data);
      })
      .catch((error) => {
        console.error("Error generating access token:", error);
        reject(error);
      });
  });
}

async function createApiBatch(payloads, batchNumber, createApiUrl, httpsAgent) {
  console.log(
    `\n--- Processing Batch ${batchNumber} (${payloads.length} APIs) ---`
  );

  const results = [];

  for (let index = 0; index < payloads.length; index++) {
    const payload = payloads[index];
    const globalIndex = (batchNumber - 1) * 100 + index + 1;

    console.log(
      `Creating API ${globalIndex} (Batch ${batchNumber}, Item ${
        index + 1
      }) with name: ${payload.name}`
    );

    try {
      const data = JSON.stringify(payload);

      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: createApiUrl,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.APIM_ACCESS_TOKEN}`,
        },
        data: data,
        httpsAgent: httpsAgent,
      };

      const response = await axios.request(config);

      if (!response || !response.data) {
        throw new Error("Invalid response received from API creation.");
      }

      console.log(
        `✅ API ${globalIndex} created successfully: ${
          response.data.name || payload.name
        }`
      );
      results.push({
        success: true,
        globalIndex: globalIndex,
        batchIndex: index + 1,
        batch: batchNumber,
        data: response.data,
        payload: payload,
      });

      // Small delay to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Error creating API ${globalIndex}:`, error.message);
      results.push({
        success: false,
        globalIndex: globalIndex,
        batchIndex: index + 1,
        batch: batchNumber,
        error: error.message,
        payload: payload,
      });
      // Continue to next iteration
    }
  }

  const successful = results.filter((result) => result.success);
  const failed = results.filter((result) => !result.success);

  console.log(
    `Batch ${batchNumber} Summary: ${successful.length} successful, ${failed.length} failed`
  );

  return results;
}

export async function createApis(req, res) {
  const createApiUrl = `${BASEPATH}${API_ENDPOINT}`;
  const count = Number(req.body.count) || 1;

  console.log(`\n🚀 Starting creation of ${count} APIs...`);

  // Generate all payloads at once
  const allPayloads = generateCreationPayloads(count);

  if (!allPayloads || allPayloads.length === 0) {
    console.error("No payloads generated for API creation.");
    return res.status(500).json({
      message: "Failed to create API. No payloads generated.",
    });
  }

  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  // Divide payloads into batches of 100
  const batchSize = 100;
  const batches = [];

  for (let i = 0; i < allPayloads.length; i += batchSize) {
    batches.push(allPayloads.slice(i, i + batchSize));
  }

  console.log(`📦 Total batches to process: ${batches.length}`);

  const allResults = [];
  let totalSuccessful = 0;
  let totalFailed = 0;

  try {
    // Process batches sequentially
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const batchNumber = batchIndex + 1;

      console.log(`\n🔄 Starting batch ${batchNumber}/${batches.length}...`);

      const batchResults = await createApiBatch(
        batch,
        batchNumber,
        createApiUrl,
        httpsAgent
      );

      allResults.push(...batchResults);

      const batchSuccessful = batchResults.filter(
        (result) => result.success
      ).length;
      const batchFailed = batchResults.filter(
        (result) => !result.success
      ).length;

      totalSuccessful += batchSuccessful;
      totalFailed += batchFailed;

      console.log(
        `✅ Batch ${batchNumber} completed: ${batchSuccessful} successful, ${batchFailed} failed`
      );

      // Delay between batches to avoid overwhelming the server
      if (batchIndex < batches.length - 1) {
        console.log(`⏳ Waiting 2 seconds before next batch...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    console.log(`\n🎉 All batches completed!`);
    console.log(
      `📊 Final Summary: ${totalSuccessful} successful, ${totalFailed} failed out of ${count} total`
    );
    const responseData = {
      message: `API creation completed. ${totalSuccessful} successful, ${totalFailed} failed.`,
      total: count,
      successful: totalSuccessful,
      failed: totalFailed,
      batches: batches.length,
      batchSize: batchSize,
      results: allResults,
      summary: {
        byBatch: batches.map((_, index) => {
          const batchResults = allResults.filter(
            (result) => result.batch === index + 1
          );
          return {
            batch: index + 1,
            total: batchResults.length,
            successful: batchResults.filter((result) => result.success).length,
            failed: batchResults.filter((result) => !result.success).length,
          };
        }),
      },
    };

    if (totalFailed === 0) {
      res.status(201).json(responseData);
    } else if (totalSuccessful === 0) {
      res.status(500).json(responseData);
    } else {
      res.status(207).json(responseData); // 207 Multi-Status for partial success
    }
  } catch (error) {
    console.error("❌ Unexpected error in API creation process:", error);
    res.status(500).json({
      message: "Unexpected error occurred during API creation",
      error: error.message,
      completed: allResults.length,
      successful: totalSuccessful,
      failed: totalFailed,
      results: allResults,
    });
  }
}
