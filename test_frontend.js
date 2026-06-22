const { execSync } = require('child_process');

try {
  const result = execSync('curl -s http://localhost:3000/participant/teams/workspace').toString();
  console.log("Found members in HTML:", result.includes("Anushka Gattani"));
  console.log("Length of HTML:", result.length);
} catch(e) {
  console.log("Error fetching:", e.message);
}
