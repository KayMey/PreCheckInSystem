import React from "react";

export default function Layout({ title, children }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f8f9fa",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          maxWidth: "900px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {title && <h1 style={{ marginBottom: "20px" }}>{title}</h1>}
        {children}
      </div>
    </div>
  );
}
