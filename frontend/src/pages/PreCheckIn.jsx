import { useState } from "react";

export default function PreCheckin() {
  const [file, setFile] = useState(null);
  const [verifyState, setVerifyState] = useState("idle"); // idle | checking | ok | fail
  const [verifyMsg, setVerifyMsg] = useState("");

  // ✅ Helper: Resize and compress an image before base64 conversion
  async function resizeImage(file, maxWidth = 1000, maxHeight = 1000) {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onerror = reject;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height *= maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width *= maxHeight / height));
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG, quality 0.8
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        // Strip the prefix (data:image/jpeg;base64,)
        const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
        resolve(base64);
      };

      reader.readAsDataURL(file);
    });
  }

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setVerifyState("idle");
    setVerifyMsg("");
  };

  const verifyLicence = async () => {
    if (!file) {
      setVerifyMsg("Please choose a licence photo first.");
      return;
    }
    setVerifyState("checking");
    setVerifyMsg("Verifying…");

    try {
      // ✅ Resize before sending
      const imageBase64 = await resizeImage(file);

      const res = await fetch("/.netlify/functions/verify-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setVerifyState("ok");
        setVerifyMsg("✓ Licence verified");
      } else {
        setVerifyState("fail");
        setVerifyMsg(
          "AWS error: " + (data.error || "Could not verify. Please upload a clearer photo.")
        );
        setFile(null);
        const input = document.getElementById("lic-input");
        if (input) input.value = "";
      }
    } catch (e) {
      setVerifyState("fail");
      setVerifyMsg("Verification error: " + (e.message || "Unknown error"));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (verifyState !== "ok") return;
    alert("Form submitted ✅");
    // TODO: Your submit-to-Supabase logic here
  };

  const canSubmit = verifyState === "ok";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Driver’s licence (front)</label>
        <input
          id="lic-input"
          type="file"
          accept="image/*"
          onChange={onFileChange}
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={verifyLicence}
            disabled={!file || verifyState === "checking"}
          >
            {verifyState === "checking" ? "Verifying…" : "Verify Licence"}
          </button>

          {verifyState === "ok" && (
            <span style={{ color: "green", fontWeight: 600 }}>{verifyMsg}</span>
          )}
          {verifyState === "fail" && (
            <span style={{ color: "crimson" }}>{verifyMsg}</span>
          )}
          {verifyState === "idle" && verifyMsg && <span>{verifyMsg}</span>}
        </div>
      </div>

      <button type="submit" disabled={!canSubmit}>
        Submit Pre-Check-In
      </button>
    </form>
  );
}
