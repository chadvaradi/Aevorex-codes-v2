import { promises as fs } from 'fs';
import path from 'path';

interface DotEnvInfo {
  file: string;
  keys: string[];
}

async function walk(dir: string, filter: (p: string) => boolean, acc: string[] = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(p, filter, acc);
    } else if (filter(p)) {
      acc.push(p);
    }
  }
  return acc;
}

function parseEnv(content: string): string[] {
  return content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => l.split('=')[0]);
}

(async () => {
  const root = process.cwd();
  const envFiles = await walk(
    root,
    (p) => /\.env(\..+)?$/i.test(p) && !p.includes('node_modules')
  );

  const allKeys = new Map<string, string[]>();
  const details: DotEnvInfo[] = [];

  for (const file of envFiles) {
    const content = await fs.readFile(file, 'utf8');
    const keys = parseEnv(content);
    details.push({ file: path.relative(root, file), keys });
    for (const k of keys) {
      if (!allKeys.has(k)) allKeys.set(k, []);
      allKeys.get(k)!.push(path.relative(root, file));
    }
  }

  const duplicates = Array.from(allKeys.entries()).filter(([, files]) => files.length > 1);

  if (duplicates.length === 0) {
    console.log('✅ No duplicate .env keys detected across workspaces.');
  } else {
    console.warn('⚠ Duplicate .env keys detected:');
    for (const [key, files] of duplicates) {
      console.warn(`  ${key}: ${files.join(', ')}`);
    }
    process.exitCode = 1;
  }
})(); 