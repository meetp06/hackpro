# 🛡️ AI Cloud Security Copilot

An AI-driven, human-in-the-loop DevOps dashboard that instantly analyzes cloud security alerts, visualizes attack paths using graph databases, and dynamically generates remediation commands.

Built for the hackathon to solve alert fatigue and automate cloud infrastructure security.

## 🚀 The Problem
Security and DevOps engineers face constant alert fatigue. When a monitoring tool (like Datadog) flags a vulnerable resource, engineers have to manually investigate who has access to it, assess the blast radius, and carefully write infrastructure-as-code (IaC) or CLI commands to fix it. This manual process is slow and prone to human error.

## 💡 The Solution
Our **Cloud Security Copilot** automates the investigation and remediation pipeline:
1. **Contextual Awareness:** Ingests active security alerts (e.g., S3 Bucket publicly exposed).
2. **Graph Blast Radius:** Uses **Neo4j** to query the exact attack path (Compromised User → IAM Role → Target Resource) and visually presents the at-risk identities.
3. **Human-in-the-Loop Remediation:** The AI agent (powered by **AWS Bedrock / Claude 3.5 Sonnet**) writes the exact AWS CLI command needed to lock down the resource. It presents the fix in the UI, requiring human approval before execution.

---

## ✨ Key Features
* **💬 Conversational Security Agent:** Powered by CopilotKit, allowing users to chat directly with their infrastructure context.
* **🔗 Graph-Based Attack Path Analysis:** Connects to Neo4j to run complex Cypher queries, mapping out identity-based vulnerabilities in real-time.
* **🛑 Human-in-the-Loop Execution:** Generates custom UI components for the user to review and approve AWS CLI commands (`aws s3api put-public-access-block`) before anything touches production.
* **⚡ Vercel AI SDK Integration:** Utilizes the new `@ai-sdk/amazon-bedrock` provider to securely connect to AWS enterprise models via CopilotKit's Agentic architecture.

---

## 🛠️ Tech Stack
* **Frontend:** Next.js (App Router), React, `@copilotkit/react-ui`
* **AI & Orchestration:** CopilotKit Runtime (`@copilotkit/runtime`), Vercel AI SDK, LangChain Adapters
* **LLM Provider:** AWS Bedrock (Anthropic Claude 3.5 Sonnet)
* **Database:** Neo4j AuraDB (Graph Database)

---

## 🏁 Getting Started (Local Setup)

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/meetp06/hackpro.git
cd hackpro
\`\`\`

### 2. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Configure Environment Variables
Create a `.env.local` file in the root of the project and add your credentials. **Do not use the `export` keyword.**

\`\`\`env
# AWS Bedrock Credentials (requires access to Claude 3.5 Sonnet)
BEDROCK_AWS_REGION="us-west-2"
BEDROCK_AWS_ACCESS_KEY_ID="your_aws_access_key"
BEDROCK_AWS_SECRET_ACCESS_KEY="your_aws_secret_key"

# Neo4j Graph Database Credentials
NEO4J_URI="your_neo4j_aura_uri"
NEO4J_USERNAME="your_neo4j_username"
NEO4J_PASSWORD="your_neo4j_password"
\`\`\`

### 4. Run the Development Server
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the dashboard.

---

## 🎯 Demo Workflow
1. Click **"Simulate S3 Breach Alert"** to trigger a mock Datadog alert indicating a bucket has `BlockPublicAcls` set to false.
2. Ask the Copilot: *"Analyze the attack path for this alert."* The AI will query Neo4j and render the compromised path in the UI.
3. Ask the Copilot: *"Please secure the bucket and lock down public access."*
4. The AI will generate the remediation command. Click **✅ Approve & Execute** to finalize the lockdown.
