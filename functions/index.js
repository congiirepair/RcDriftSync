const crypto = require("node:crypto");
const admin = require("firebase-admin");
const { defineSecret, defineString } = require("firebase-functions/params");
const { onRequest } = require("firebase-functions/v2/https");

admin.initializeApp();

const cloudinaryApiSecret = defineSecret("CLOUDINARY_API_SECRET");
const cloudinaryCloudName = defineString("CLOUDINARY_CLOUD_NAME");
const cloudinaryApiKey = defineString("CLOUDINARY_API_KEY");

function json(res, status, body) {
  res.status(status).set("Content-Type", "application/json").send(JSON.stringify(body));
}

exports.deleteCloudinaryPhoto = onRequest(
  {
    cors: true,
    secrets: [cloudinaryApiSecret],
    region: "us-central1"
  },
  async (req, res) => {
    if (req.method !== "POST") {
      json(res, 405, { error: "Method not allowed" });
      return;
    }

    const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token) {
      json(res, 401, { error: "Missing Firebase auth token" });
      return;
    }

    try {
      await admin.auth().verifyIdToken(token);
    } catch {
      json(res, 401, { error: "Invalid Firebase auth token" });
      return;
    }

    const publicId = typeof req.body?.publicId === "string" ? req.body.publicId.trim() : "";
    if (!publicId || publicId.length > 220 || publicId.includes("..")) {
      json(res, 400, { error: "Invalid Cloudinary public id" });
      return;
    }

    const cloudName = cloudinaryCloudName.value();
    const apiKey = cloudinaryApiKey.value();
    const apiSecret = cloudinaryApiSecret.value();
    if (!cloudName || !apiKey || !apiSecret) {
      json(res, 500, { error: "Cloudinary delete service is not configured" });
      return;
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHash("sha1")
      .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest("hex");

    const formData = new URLSearchParams({
      public_id: publicId,
      timestamp: String(timestamp),
      api_key: apiKey,
      signature
    });

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body: formData
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || (result.result && !["ok", "not found"].includes(result.result))) {
      json(res, 502, { error: "Cloudinary destroy failed", result });
      return;
    }

    json(res, 200, { ok: true, result: result.result || "ok" });
  }
);
