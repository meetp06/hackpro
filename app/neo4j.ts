import neo4j from "neo4j-driver";

const uri = process.env.NEO4J_URI!;
const user = process.env.NEO4J_USERNAME!;
const password = process.env.NEO4J_PASSWORD!;

// Create a single driver instance to use across the app
export const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

// Helper function to easily run queries
export async function runQuery(cypher: string, params = {}) {
  const session = driver.session();
  try {
    const result = await session.run(cypher, params);
    return result.records;
  } finally {
    await session.close();
  }
}