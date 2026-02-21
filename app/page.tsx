"use client";

import { useState } from "react";
import { CopilotKit, useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { getBlastRadius } from "./actions";
import "@copilotkit/react-ui/styles.css";

// --- MOCK ENVIRONMENT DATA ---
const MOCK_DATADOG_ALERT = {
  alert_id: "sec-hub-9942",
  status: "CRITICAL",
  resource_type: "AWS::S3::Bucket",
  resource_name: "production-user-data-bucket",
  region: "us-west-2",
  description: "S3 Bucket has BlockPublicAcls set to FALSE. Public access is allowed.",
};

// --- TYPES ---
interface AttackPath {
  attacker: string;
  role_used: string;
  target_bucket: string;
}

// =============================================
// MAIN DASHBOARD
// =============================================
export default function DevOpsDashboard() {
  const [activeAlert, setActiveAlert] = useState<any>(null);
  const [attackPaths, setAttackPaths] = useState<AttackPath[]>([]);

  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter', 'Segoe UI', sans-serif", background: "#0f1117" }}>

        {/* LEFT SIDE: Dashboard */}
        <div style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2rem" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
              🛡️
            </div>
            <div>
              <h1 style={{ color: "#f1f5f9", margin: 0, fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px" }}>Cloud Security Monitor</h1>
              <p style={{ color: "#64748b", margin: 0, fontSize: "13px" }}>Real-time infrastructure threat detection</p>
            </div>
          </div>

          {/* Trigger Button */}
          <button
            onClick={() => setActiveAlert(MOCK_DATADOG_ALERT)}
            style={{
              padding: "14px 28px",
              background: activeAlert ? "#1e293b" : "linear-gradient(135deg, #ef4444, #dc2626)",
              color: activeAlert ? "#94a3b8" : "white",
              border: activeAlert ? "1px solid #334155" : "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px",
              transition: "all 0.2s ease",
              letterSpacing: "-0.2px",
            }}
          >
            🚨 {activeAlert ? "Alert Active" : "Simulate S3 Breach Alert"}
          </button>

          {/* Alert Card */}
          {activeAlert && (
            <div style={{
              marginTop: "20px",
              padding: "1.5rem",
              background: "linear-gradient(135deg, #1a0a0a, #1e1012)",
              border: "1px solid #7f1d1d",
              borderRadius: "12px",
              boxShadow: "0 0 30px rgba(239, 68, 68, 0.1)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", animation: "pulse 2s infinite" }} />
                <span style={{ color: "#fca5a5", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>CRITICAL ALERT</span>
              </div>
              <h2 style={{ color: "#fecaca", marginTop: 0, fontSize: "18px", fontWeight: 600 }}>{activeAlert.resource_name}</h2>
              <p style={{ color: "#f87171", fontSize: "14px", lineHeight: 1.5 }}>{activeAlert.description}</p>
              <pre style={{
                background: "#0c0c0c",
                padding: "12px",
                borderRadius: "8px",
                color: "#6ee7b7",
                whiteSpace: "pre-wrap",
                fontSize: "12px",
                fontFamily: "'Geist Mono', monospace",
                border: "1px solid #1e293b",
              }}>
                {JSON.stringify(activeAlert, null, 2)}
              </pre>
            </div>
          )}

          {/* Attack Path Graph Panel */}
          {attackPaths.length > 0 && (
            <AttackPathPanel paths={attackPaths} />
          )}
        </div>

        {/* RIGHT SIDE: AI Copilot Chat */}
        <div style={{
          width: "460px",
          borderLeft: "1px solid #1e293b",
          background: "#0a0a0f",
          display: "flex",
          flexDirection: "column",
        }}>
          <CopilotChat
            instructions={`You are an expert AWS DevOps Security AI named "Shield". Your job is to help security engineers investigate and remediate cloud breaches.

You have TWO tools available:

1. "analyze_attack_path" — Queries the Neo4j graph database to find which users and IAM roles can access a compromised S3 bucket. Use this when the user asks about blast radius, who has access, who is at risk, or attack paths. Pass the bucket name from the active alert (e.g. "production-user-data-bucket").

2. "remediate_infrastructure" — Generates AWS CLI commands to fix a vulnerability and presents them for human approval. Use this when the user asks you to fix, remediate, secure, or lock down a resource.

When an alert is active:
- First analyze the attack path to understand who is affected
- Then propose specific remediation commands
- Always explain the risk clearly before proposing fixes
- Be concise but thorough`}
            labels={{
              title: "🛡️ Shield AI",
              initial: "Monitoring infrastructure. Click the alert button to begin threat analysis.",
            }}
          />
        </div>
      </div>

      {/* Hooks — invisible component wiring UI state to the AI */}
      <AgentHooks activeAlert={activeAlert} onAttackPathsFound={setAttackPaths} />
    </CopilotKit>
  );
}

// =============================================
// ATTACK PATH VISUALIZATION PANEL
// =============================================
function AttackPathPanel({ paths }: { paths: AttackPath[] }) {
  return (
    <div style={{
      marginTop: "24px",
      padding: "1.5rem",
      background: "linear-gradient(135deg, #0a0f1e, #0c1220)",
      border: "1px solid #1e3a5f",
      borderRadius: "12px",
      boxShadow: "0 0 40px rgba(99, 102, 241, 0.08)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <span style={{ fontSize: "18px" }}>🔗</span>
        <h3 style={{ color: "#a5b4fc", margin: 0, fontSize: "16px", fontWeight: 600 }}>Attack Path Graph</h3>
        <span style={{
          marginLeft: "auto",
          background: "#312e81",
          color: "#a5b4fc",
          padding: "2px 10px",
          borderRadius: "12px",
          fontSize: "11px",
          fontWeight: 600,
        }}>
          {paths.length} path{paths.length > 1 ? "s" : ""} found
        </span>
      </div>

      {paths.map((path, i) => (
        <div key={i} style={{
          display: "flex",
          alignItems: "center",
          gap: "0",
          marginBottom: i < paths.length - 1 ? "12px" : 0,
          flexWrap: "wrap",
        }}>
          {/* Attacker Node */}
          <div style={{
            background: "linear-gradient(135deg, #7f1d1d, #991b1b)",
            border: "1px solid #dc2626",
            borderRadius: "8px",
            padding: "8px 14px",
            minWidth: "110px",
            textAlign: "center",
          }}>
            <div style={{ color: "#fca5a5", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Compromised User</div>
            <div style={{ color: "#fef2f2", fontSize: "14px", fontWeight: 700, marginTop: "2px" }}>👤 {path.attacker}</div>
          </div>

          {/* Arrow */}
          <div style={{ color: "#475569", fontSize: "18px", padding: "0 6px", fontFamily: "monospace" }}>→</div>

          {/* Role Node */}
          <div style={{
            background: "linear-gradient(135deg, #78350f, #92400e)",
            border: "1px solid #f59e0b",
            borderRadius: "8px",
            padding: "8px 14px",
            minWidth: "110px",
            textAlign: "center",
          }}>
            <div style={{ color: "#fde68a", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>IAM Role</div>
            <div style={{ color: "#fefce8", fontSize: "14px", fontWeight: 700, marginTop: "2px" }}>🔑 {path.role_used}</div>
          </div>

          {/* Arrow */}
          <div style={{ color: "#475569", fontSize: "18px", padding: "0 6px", fontFamily: "monospace" }}>→</div>

          {/* Target Node */}
          <div style={{
            background: "linear-gradient(135deg, #064e3b, #065f46)",
            border: "1px solid #10b981",
            borderRadius: "8px",
            padding: "8px 14px",
            minWidth: "110px",
            textAlign: "center",
          }}>
            <div style={{ color: "#6ee7b7", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Target Bucket</div>
            <div style={{ color: "#ecfdf5", fontSize: "14px", fontWeight: 700, marginTop: "2px" }}>🪣 {path.target_bucket}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================
// AI HOOKS — wires UI state to the AI brain
// =============================================
function AgentHooks({
  activeAlert,
  onAttackPathsFound,
}: {
  activeAlert: any;
  onAttackPathsFound: (paths: AttackPath[]) => void;
}) {

  // 1. Feed the active alert into the AI's context
  useCopilotReadable({
    description: "The current active infrastructure security alert from the monitoring system.",
    value: activeAlert
      ? JSON.stringify(activeAlert)
      : "No active alerts. System is healthy.",
  });

  // 2. Human-in-the-Loop Remediation Action (renders approval card)
  useCopilotAction({
    name: "remediate_infrastructure",
    description: "Generates and presents AWS CLI commands to fix a security vulnerability. The human must approve before execution. Use this when asked to fix, remediate, secure, or lock down infrastructure.",
    parameters: [
      { name: "resource_id", type: "string", description: "The AWS resource name to fix (e.g. an S3 bucket name)" },
      { name: "command", type: "string", description: "The exact AWS CLI command to remediate the vulnerability" },
    ],
    renderAndWaitForResponse: ({ args, status, respond }) => {
      return (
        <div style={{
          padding: "1rem",
          border: "1px solid #f59e0b",
          borderRadius: "10px",
          background: "linear-gradient(135deg, #1a1708, #1c1a0e)",
          margin: "8px 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <span style={{ fontSize: "16px" }}>⚠️</span>
            <h3 style={{ margin: 0, color: "#fbbf24", fontSize: "14px", fontWeight: 600 }}>
              Proposed Fix: {args.resource_id || "Resource"}
            </h3>
          </div>

          <code style={{
            background: "#0c0c0c",
            color: "#10b981",
            padding: "12px",
            display: "block",
            borderRadius: "8px",
            marginBottom: "12px",
            fontFamily: "'Geist Mono', monospace",
            fontSize: "12px",
            border: "1px solid #1e293b",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
          }}>
            {args.command || "Analyzing alert and writing command..."}
          </code>

          {status === "executing" && (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => respond?.("APPROVED")}
                style={{
                  background: "linear-gradient(135deg, #059669, #10b981)",
                  color: "white",
                  padding: "8px 18px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                }}>
                ✅ Approve & Execute
              </button>
              <button
                onClick={() => respond?.("REJECTED")}
                style={{
                  background: "linear-gradient(135deg, #dc2626, #ef4444)",
                  color: "white",
                  padding: "8px 18px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                }}>
                ❌ Reject
              </button>
            </div>
          )}

          {status === "complete" && (
            <p style={{
              color: "#10b981",
              fontWeight: 600,
              margin: "8px 0 0 0",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}>
              ✅ Fix successfully deployed!
            </p>
          )}
        </div>
      );
    },
  });

  // 3. Neo4j Graph Query Action (renders attack path card inline + updates dashboard)
  useCopilotAction({
    name: "analyze_attack_path",
    description: "Queries the Neo4j graph database to discover which compromised users and IAM roles have access to a vulnerable S3 bucket. Use this to analyze blast radius, identify at-risk identities, or answer questions like 'who can access this bucket?'",
    parameters: [
      { name: "bucket_name", type: "string", description: "The name of the compromised S3 bucket to analyze" },
    ],
    handler: async ({ bucket_name }) => {
      const result = await getBlastRadius(bucket_name);
      // Update the dashboard panel if we got results
      if (Array.isArray(result)) {
        onAttackPathsFound(result as AttackPath[]);
      }
      return result;
    },
    render: ({ status, result }) => {
      if (status === "inProgress") {
        return (
          <div style={{
            padding: "1rem",
            border: "1px solid #312e81",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #0c0a1e, #0e0c20)",
            margin: "8px 0",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
            <span style={{ fontSize: "16px", animation: "spin 1s linear infinite" }}>🔍</span>
            <span style={{ color: "#a5b4fc", fontSize: "13px", fontWeight: 500 }}>Querying Neo4j graph database...</span>
          </div>
        );
      }

      if (status === "complete" && result) {
        const paths: AttackPath[] = Array.isArray(result) ? result : [];

        if (paths.length === 0) {
          return (
            <div style={{
              padding: "1rem",
              border: "1px solid #065f46",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #021a0f, #031f12)",
              margin: "8px 0",
            }}>
              <span style={{ color: "#6ee7b7", fontSize: "13px", fontWeight: 500 }}>✅ No vulnerable attack paths found. The resource appears secure.</span>
            </div>
          );
        }

        return (
          <div style={{
            padding: "1rem",
            border: "1px solid #7f1d1d",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #1a0a0a, #1c0c0c)",
            margin: "8px 0",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <span style={{ fontSize: "16px" }}>🚨</span>
              <h4 style={{ margin: 0, color: "#fca5a5", fontSize: "13px", fontWeight: 600 }}>
                {paths.length} At-Risk Identit{paths.length > 1 ? "ies" : "y"} Found
              </h4>
            </div>
            {paths.map((p, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 0",
                borderTop: i > 0 ? "1px solid #1e1012" : "none",
                fontSize: "12px",
                color: "#e2e8f0",
              }}>
                <span style={{ color: "#f87171" }}>👤 {p.attacker}</span>
                <span style={{ color: "#475569" }}>→</span>
                <span style={{ color: "#fbbf24" }}>🔑 {p.role_used}</span>
                <span style={{ color: "#475569" }}>→</span>
                <span style={{ color: "#34d399" }}>🪣 {p.target_bucket}</span>
              </div>
            ))}
          </div>
        );
      }

      return <></>;
    },
  });

  return null;
}