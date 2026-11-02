import { execFileSync } from 'node:child_process';

// Run immediately before committing. Never fetch or display credential values.
const repo = 'HERPESME/eeshans-night-city-arcade';
const response = await fetch(`https://api.github.com/repos/${repo}`, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'TechNightCity-public-commit-guard' }, redirect: 'error', signal: AbortSignal.timeout(20000) });
if (!response.ok) throw new Error('Cannot verify repository visibility. Do not commit until the public state is verified.');
const metadata = await response.json();
if (metadata.private !== false || metadata.visibility !== 'public' || metadata.full_name !== repo) throw new Error('Repository is not confirmed public. Review its state before committing.');
const names = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const patterns = [/github_pat_[A-Za-z0-9_]{20,}/, /gh[pousr]_[A-Za-z0-9]{20,}/, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /(?:RAZORPAY_KEY_SECRET|RAZORPAY_WEBHOOK_SECRET)\s*[:=]\s*["'][^"'\n]{8,}["']/];
const environmentSecrets = ['RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET', 'RAZORPAY_WEBHOOK_SECRET_PREVIOUS', 'GH_TOKEN', 'GITHUB_TOKEN'].map(key => process.env[key]).filter(value => value && value.length >= 8);
for (const name of names) {
  if (/(^|\/)\.env(?:\.|$)/.test(name) && !name.endsWith('.env.example') || /\.(pem|key)$/.test(name)) throw new Error(`Credential file staged: ${name}`);
  const content = execFileSync('git', ['show', `:${name}`], { maxBuffer: 20 * 1024 * 1024 });
  if (content.includes(0)) continue; // Binary assets are reviewed separately.
  const text = content.toString('utf8');
  if (patterns.some(pattern => pattern.test(text)) || environmentSecrets.some(secret => text.includes(secret))) throw new Error(`Possible credential found in staged file: ${name}. Value withheld.`);
}
console.log(`PASS ${repo} is public; ${names.length} staged files checked for credential exposure.`);
