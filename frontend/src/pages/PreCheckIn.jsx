import { useState } from "react";

export default function PreCheckin() {
  const [file, setFile] = useState(null);
  const [verifyState, setVerifyState] = useState("idle"); // idle | checking | ok | fail
  const [verifyMsg, setVerifyMsg] = useState("");

  async function fileToBase64(f) {
    const buf = await f.arrayBuffer();
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
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
      const imageBase64 = await fileToBase64(file);
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
        // Show AWS error if available
        setVerifyState("fail");
        setVerifyMsg(
          "AWS error: " + (data.error || "Could not verify. Please upload a clearer photo.")
        );
        setFile(null);
        const input = document.getElementById("lic-input");
        if (input) input.value = "";
      }
    } catch (e) {
      // Show the actual error message instead of generic text
      setVerifyState("fail");
      setVerifyMsg("Verification error: " + (e.message || "Unknown error"));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (verifyState !== "ok") return;
    // TODO: add your submit logic here (Supabase insert, file upload, etc.)
    alert("Form submitted ✅");
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
