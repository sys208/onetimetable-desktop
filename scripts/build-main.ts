// Bun은 자동으로 .env를 로드하므로 process.env에 값이 있음
const envVars = [
  "FIREBASE_API_KEY",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_STORAGE_BUCKET",
  "FIREBASE_MESSAGING_SENDER_ID",
  "FIREBASE_APP_ID",
];

const define: Record<string, string> = {};
for (const key of envVars) {
  const val = process.env[key] || "";
  define[`process.env.${key}`] = JSON.stringify(val);
}

const result = await Bun.build({
  entrypoints: ["src/main/index.ts"],
  outdir: "dist/main",
  target: "node",
  external: ["electron", "better-sqlite3", "comcigan-parser", "electron-updater"],
  define,
});

if (!result.success) {
  console.error("Build failed:");
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

console.log(`Bundled ${result.outputs.length} file(s) with env vars inlined`);
