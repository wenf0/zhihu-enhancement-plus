#!/usr/bin/env node
/**
 * Concatenate src/ (+ vendor jieba glue) into zhihu-enhancement-plus.user.js.
 *   node scripts/pack.mjs
 *   node scripts/pack.mjs --check
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { SOURCES } from './sources.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outFile = join(root, 'zhihu-enhancement-plus.user.js');
const check = process.argv.includes('--check');

function readPart(rel) {
    const text = readFileSync(join(root, rel), 'utf8')
        .replace(/^\uFEFF/, '')
        .replace(/\r\n/g, '\n')
        .replace(/\s+$/, '');
    if (!text) throw new Error('empty source: ' + rel);
    return text + '\n';
}

function pack() {
    return SOURCES.map(readPart).join('\n');
}

const packed = pack();
if (!packed.startsWith('// ==UserScript==')) {
    throw new Error('pack output must start with the userscript header');
}

if (check) {
    const current = readFileSync(outFile, 'utf8').replace(/\r\n/g, '\n');
    if (current !== packed) {
        console.error('zhihu-enhancement-plus.user.js is stale. Run: node scripts/pack.mjs');
        process.exit(1);
    }
    console.log('pack check ok (' + packed.split('\n').length + ' lines)');
    process.exit(0);
}

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, packed);
const syntax = spawnSync(process.execPath, ['--check', outFile], { encoding: 'utf8' });
if (syntax.status !== 0) {
    process.stderr.write(syntax.stderr || syntax.stdout || 'node --check failed\n');
    process.exit(syntax.status || 1);
}
console.log('wrote zhihu-enhancement-plus.user.js (' + packed.split('\n').length + ' lines)');
