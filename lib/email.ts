const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const KNOWN_DOMAINS = [
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "ymail.com",
  "aol.com",
  "proton.me",
  "live.com",
  "uol.com.ar",
  "fibertel.com.ar",
  "speedy.com.ar",
  "hotmail.com.ar",
  "outlook.com.ar",
  "yahoo.com.ar",
  "gmail.com.ar",
];

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

export function suggestEmailFix(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at <= 0) return null;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1).toLowerCase();

  let best: string | null = null;
  let bestDistance = 3;
  for (const known of KNOWN_DOMAINS) {
    const d = levenshtein(domain, known);
    if (d < bestDistance) {
      bestDistance = d;
      best = known;
    }
  }

  if (!best || bestDistance === 0 || bestDistance > 2) return null;
  return `${local}@${best}`;
}

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}