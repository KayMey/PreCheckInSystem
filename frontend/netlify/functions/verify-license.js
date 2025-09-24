// netlify/functions/verify-license.js
const {
  RekognitionClient,
  DetectLabelsCommand,
  DetectTextCommand,
} = require("@aws-sdk/client-rekognition");

// Keywords commonly found on SA licences (add/remove as you like)
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

function scoreResult({ labels, lines }) {
  const reasons = [];
  let score = 0;

  // 1) Labels confidence (Document/ID/License/Text)
  const labelHit = labels.some(
    (l) =>
      ["DOCUMENT", "ID CARDS", "LICENSE", "DRIVER LICENSE", "TEXT"].includes(
        l.Name.toUpperCase()
      ) && l.Confidence >= 85
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

  // 3) Date pattern dd/mm/yyyy
  const hasDate = /\b\d{2}[\/\-]\d{2}[\/\-]\d{4}\b/.test(allText);
  if (hasDate) {
    score += 10;
    reasons.push("Date detected (dd/mm/yyyy)");
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
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { imageBase64 } = JSON.parse(event.body || "{}");
    if (!imageBase64) {
      return { statusCode: 400, body: JSON.stringify({ error: "imageBase64 missing" }) };
    }

    // Convert base64 → bytes
    const bytes = Buffer.from(imageBase64, "base64");

    // ✅ Use your custom env variable names
    const client = new RekognitionClient({
      region: process.env.AWS_REGION_VAR,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS,
      },
    });

    // Detect labels
    const labelsRes = await client.send(
      new DetectLabelsCommand({
        Image: { Bytes: bytes },
        MaxLabels: 15,
        MinConfidence: 75,
      })
    );

    // Detect text (OCR)
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: verdict.ok,
        score: verdict.score,
        reasons: verdict.reasons,
        textPreview: verdict.textPreview,
      }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Server error" }) };
  }
};
