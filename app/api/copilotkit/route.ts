import { NextRequest } from "next/server";
import {
    CopilotRuntime,
    copilotRuntimeNextJSAppRouterEndpoint,
    EmptyAdapter,
} from "@copilotkit/runtime";
import { BuiltInAgent } from "@copilotkitnext/agent";
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";

// AWS Bedrock requires the Node.js runtime, not Edge
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        // Create a Vercel AI SDK Bedrock LanguageModel
        const bedrock = createAmazonBedrock({
            region: process.env.BEDROCK_AWS_REGION!,
            accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY!,
            sessionToken: process.env.AWS_SESSION_TOKEN,
        });
        const bedrockModel = bedrock("anthropic.claude-3-5-sonnet-20241022-v2:0");

        // Pass the LanguageModel instance directly to BuiltInAgent.
        // This bypasses resolveModel()'s string-based provider lookup entirely,
        // because resolveModel() checks: if (typeof spec !== "string") return spec;
        const copilotRuntime = new CopilotRuntime({
            agents: {
                default: new BuiltInAgent({ model: bedrockModel as any }),
            } as any,
        });

        // EmptyAdapter is fine here — the BuiltInAgent handles all LLM calls
        const serviceAdapter = new EmptyAdapter();

        const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
            runtime: copilotRuntime,
            serviceAdapter,
            endpoint: "/api/copilotkit",
        });

        return handleRequest(req);
    } catch (error) {
        console.error("Bedrock Connection Error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}