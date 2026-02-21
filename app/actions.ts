"use server";

import { runQuery } from "./neo4j";

export async function getBlastRadius(bucketName: string) {
  console.log(`Analyzing graph blast radius for: ${bucketName}`);
  
  // The Cypher query to find the attack path
  const cypher = `
    MATCH (u:AWSUser)-[:ASSUMES_ROLE]->(r:IAMRole)-[]->(b:S3Bucket {bucketName: $bucketName})
    RETURN u.username AS compromisedUser, r.roleName AS assumedRole
  `;
  
  const records = await runQuery(cypher, { bucketName });
  
  // Format the raw Neo4j records into clean JSON for the AI to read
  const results = records.map(record => ({
    attacker: record.get("compromisedUser"),
    role_used: record.get("assumedRole"),
    target_bucket: bucketName
  }));

  return results.length > 0 ? results : "No vulnerable attack paths found.";
}