// src/components/Layout.js
import React from "react";

export default function Layout({ title, children }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "100%",
        background: "#f8f9fa",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "1000px",
          textAlign: "center",
        }}
      >
        {title && (
          <h1
            style={{
              fontSize: "32px",
              marginBottom: "20px",
              color: "#222",
            }}
          >
            {title}
          </h1>
        )}
        {children}
      </div>
    </div>
  );
}
