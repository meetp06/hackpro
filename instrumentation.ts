export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        const { default: tracer } = await import("dd-trace");
        tracer.init({
            service: "security-copilot-demo",
            env: process.env.DD_ENV || "dev",
        });
    }
}
