"use client";

import { useState } from "react";
import { CopilotKit, useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

// --- MOCK ENVIRONMENT DATA ---
// This fakes an alert so you don't have to build a real AWS/Datadog environment today
const MOCK_DATADOG_ALERT = {
  alert_id: "sec-hub-9942",
  status: "CRITICAL",
  resource_type: "AWS::S3::Bucket",
  resource_name: "production-user-data-bucket",
  region: "us-east-1",
  description: "S3 Bucket has BlockPublicAcls set to FALSE. Public access is allowed.",
};

export default function DevOpsDashboard() {
  const [activeAlert, setActiveAlert] = useState<any>(null);

  return (
    // The runtimeUrl tells the UI where to find Person C's backend
    <CopilotKit runtimeUrl="/api/copilotkit">
      <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif", background: "#f4f4f5" }}>
        
        {/* LEFT SIDE: Your Fake Datadog Dashboard */}
        <div style={{ flex: 1, padding: "2rem" }}>
          <h1 style={{ color: "#111827", marginBottom: "2rem" }}>☁️ Cloud Security Monitor</h1>
          
          <button 
            onClick={() => setActiveAlert(MOCK_DATADOG_ALERT)}
            style={{ padding: "12px 24px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}>
            🚨 Simulate S3 Breach Alert
          </button>

          {activeAlert && (
            <div style={{ marginTop: "20px", padding: "1.5rem", background: "#fee2e2", border: "2px solid #ef4444", borderRadius: "8px" }}>
              <h2 style={{ color: "#991b1b", marginTop: 0 }}>CRITICAL ALERT: {activeAlert.resource_name}</h2>
              <p style={{ color: "#7f1d1d" }}>{activeAlert.description}</p>
              <pre style={{ background: "#f87171", padding: "10px", borderRadius: "4px", color: "white", whiteSpace: "pre-wrap" }}>
                {JSON.stringify(activeAlert, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* RIGHT SIDE: The AI Copilot Chat */}
        <div style={{ width: "450px", borderLeft: "1px solid #d1d5db", background: "white" }}>
          <CopilotChat 
            instructions="You are an expert AWS DevOps AI. Your job is to analyze active alerts and fix broken infrastructure using the 'remediate_infrastructure' tool."
            labels={{ title: "DevOps Copilot", initial: "Monitoring infrastructure. Ready to assist." }}
          />
        </div>

      </div>
      
      {/* Invisible component that connects the UI to the AI Brain */}
      <AgentHooks activeAlert={activeAlert} />
    </CopilotKit>
  );
}

// --- GENERATIVE UI & AI LOGIC ---
function AgentHooks({ activeAlert }: { activeAlert: any }) {
  
  // 1. Give the AI eyes: Feed the active alert into the AI's context
  useCopilotReadable({
    description: "The current active infrastructure security alert.",
    value: activeAlert || "No active alerts. System is healthy.",
  });

  // 2. The Human-in-the-Loop Action: Generates a custom UI card instead of text
  useCopilotAction({
    name: "remediate_infrastructure",
    description: "Generates AWS CLI commands to fix open infrastructure.",
    parameters: [
      { name: "resource_id", type: "string", description: "The broken AWS resource name" },
      { name: "command", type: "string", description: "The exact AWS CLI command to fix it" }
    ],
    // THIS FIXES THE CRASH: CopilotKit requires a handler function to execute the final action
    handler: async ({ resource_id, command }) => {
      console.log(`Executing ${command} on ${resource_id}`);
      return "Fix applied successfully to the infrastructure.";
    },
    // This renders the beautiful UI in the chat window
    render: ({ args, status, handler }) => {
      return (
        <div style={{ padding: "1rem", border: "2px solid #f59e0b", borderRadius: "8px", background: "#fffbeb" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#b45309" }}>⚠️ Proposed Fix for {args.resource_id || "Resource"}</h3>
          
          <code style={{ background: "#1f2937", color: "#10b981", padding: "10px", display: "block", borderRadius: "4px", marginBottom: "15px", fontFamily: "monospace" }}>
            {args.command || "Analyzing alert and writing command..."}
          </code>

          {/* Wait for the human to click Approve */}
          {status === "executing" && (
            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                onClick={() => handler("APPROVED")} 
                style={{ background: "#10b981", color: "white", padding: "8px 16px", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                ✅ Approve & Execute
              </button>
              <button 
                onClick={() => handler("REJECTED")} 
                style={{ background: "#ef4444", color: "white", padding: "8px 16px", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                ❌ Reject
              </button>
            </div>
          )}
          
          {status === "complete" && <p style={{ color: "#15803d", fontWeight: "bold", margin: "10px 0 0 0" }}>✅ Fix successfully deployed!</p>}
        </div>
      );
    },
  });

  return null;
}