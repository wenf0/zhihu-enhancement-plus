import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const from = join(root, 'dist/zhihu-enhancement-plus.user.js');
const to = join(root, 'zhihu-enhancement-plus.user.js');
if (!existsSync(from)) {
    console.error('missing', from);
    process.exit(1);
}
copyFileSync(from, to);
console.log('copied dist/zhihu-enhancement-plus.user.js -> zhihu-enhancement-plus.user.js');
