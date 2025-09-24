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

        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
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
  };

  const canSubmit = verifyState === "ok";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f8f9fa",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "500px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#000" }}>
          Pre-Check-In
        </h2>

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="lic-input"
              style={{ display: "block", fontWeight: 500, marginBottom: "5px", color: "#000" }}
            >
              Driver’s licence (front)
            </label>
            <input
              id="lic-input"
              type="file"
              accept="image/*"
              onChange={onFileChange}
              style={{ marginBottom: "10px" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={verifyLicence}
                disabled={!file || verifyState === "checking"}
                style={{
                  padding: "8px 14px",
                  background: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: !file || verifyState === "checking" ? "not-allowed" : "pointer",
                }}
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

          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              width: "100%",
              padding: "10px",
              background: canSubmit ? "#007bff" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            Submit Pre-Check-In
          </button>
        </form>
      </div>
    </div>
  );
}
