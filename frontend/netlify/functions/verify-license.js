// frontend/netlify/functions/verify-license.js
const {
  RekognitionClient,
  DetectLabelsCommand,
  DetectTextCommand,
} = require("@aws-sdk/client-rekognition");

// Keywords commonly found on SA licences (you can tweak)
const KEYWORDS = [
  "DRIVING LICENCE",
  "DRIVING LICENSE",
  "DRIVER'S LICENSE",
  "SOUTH AFRICA",
  "SADC",
  "ZA",
  "ID NO",
  "LICENCE NUMBER",
  "RESTRICTION",
  "VALID",
  "ISSUED",
  "CARTA DE CONDUCAO",
  "FEMALE",
  "MALE",
];

function cors(headers = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    ...headers,
  };
}

function scoreResult({ labels, lines }) {
  const reasons = [];
  let score = 0;

  // 1) Labels confidence (Document/ID/License/Text)
  const labelHit = labels.some(
    (l) =>
      ["DOCUMENT", "ID CARDS", "LICENSE", "DRIVER LICENSE", "TEXT"].includes(
        (l.Name || "").toUpperCase()
      ) && (l.Confidence || 0) >= 85
  );
  if (labelHit) {
    score += 40;
    reasons.push("Looks like a document/ID by labels");
  }

  const allText = lines.join(" ").toUpperCase();

  // 2) Keywords found
  const keywordMatches = KEYWORDS.filter((k) => allText.includes(k));
  if (keywordMatches.length >= 2) {
    score += 40;
    reasons.push(`Keywords found: ${keywordMatches.slice(0, 3).join(", ")}`);
  }

  // 3) Date pattern dd/mm/yyyy or dd-mm-yyyy
  const hasDate = /\b\d{2}[\/\-]\d{2}[\/\-]\d{4}\b/.test(allText);
  if (hasDate) {
    score += 10;
    reasons.push("Date detected (dd/mm/yyyy or dd-mm-yyyy)");
  }

  // 4) SA ID number pattern (13 digits)
  const has13Digits = /\b\d{13}\b/.test(allText.replace(/\s/g, ""));
  if (has13Digits) {
    score += 10;
    reasons.push("13-digit number found (possible SA ID)");
  }

  return { ok: score >= 70, score, reasons, textPreview: lines.slice(0, 8) };
}

exports.handler = async (event) => {
  try {
    // CORS preflight
    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 204, headers: cors(), body: "" };
    }
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, headers: cors(), body: "Method Not Allowed" };
    }

    const { imageDataUrl, imageBase64 } = JSON.parse(event.body || "{}");

    // Accept either a full data URL or raw base64
    let b64 = imageBase64;
    if (!b64 && imageDataUrl) {
      const comma = imageDataUrl.indexOf(",");
      b64 = comma >= 0 ? imageDataUrl.slice(comma + 1) : imageDataUrl;
    }
    if (!b64 || typeof b64 !== "string") {
      return {
        statusCode: 400,
        headers: cors({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          ok: false,
          error: "No image provided (imageDataUrl or imageBase64 required).",
        }),
      };
    }

    // Clean & validate base64 to avoid “expected pattern” errors
    const cleaned = b64.replace(/\s+/g, "");
    if (!/^[A-Za-z0-9+/=]+$/.test(cleaned)) {
      return {
        statusCode: 400,
        headers: cors({ "Content-Type": "application/json" }),
        body: JSON.stringify({ ok: false, error: "Image is not valid base64." }),
      };
    }

    const bytes = Buffer.from(cleaned, "base64");
    if (!bytes || !bytes.length) {
      return {
        statusCode: 400,
        headers: cors({ "Content-Type": "application/json" }),
        body: JSON.stringify({ ok: false, error: "Could not decode image bytes." }),
      };
    }

    // ---- AWS Rekognition (Region + Credentials) ----
    // Use env var names you already had in your function:
    const region = process.env.MY_AWS_REGION;            // e.g. "eu-west-1"
    const accessKeyId = process.env.MY_AWS_ACCESS_KEY;
    const secretAccessKey = process.env.MY_AWS_SECRET_ACCESS;

    if (!region) {
      return {
        statusCode: 500,
        headers: cors({ "Content-Type": "application/json" }),
        body: JSON.stringify({ ok: false, error: "Missing MY_AWS_REGION env var" }),
      };
    }
    if (!accessKeyId || !secretAccessKey) {
      return {
        statusCode: 500,
        headers: cors({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          ok: false,
          error: "Missing MY_AWS_ACCESS_KEY / MY_AWS_SECRET_ACCESS env vars",
        }),
      };
    }

    const client = new RekognitionClient({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });

    // Call Rekognition
    const labelsRes = await client.send(
      new DetectLabelsCommand({
        Image: { Bytes: bytes },
        MaxLabels: 15,
        MinConfidence: 75,
      })
    );

    const textRes = await client.send(
      new DetectTextCommand({
        Image: { Bytes: bytes },
      })
    );

    const labels = labelsRes.Labels || [];
    const lines =
      (textRes.TextDetections || [])
        .filter((t) => t.Type === "LINE")
        .map((t) => t.DetectedText) || [];

    const verdict = scoreResult({ labels, lines });

    return {
      statusCode: 200,
      headers: cors({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        ok: verdict.ok,
        score: verdict.score,
        reasons: verdict.reasons,
        textPreview: verdict.textPreview,
      }),
    };
  } catch (err) {
    console.error("verify-license error:", err);
    return {
      statusCode: 500,
      headers: cors({ "Content-Type": "application/json" }),
      body: JSON.stringify({ ok: false, error: err.message || "Unknown error" }),
    };
  }
};
