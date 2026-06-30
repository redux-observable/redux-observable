import {cp, mkdir, rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const websiteDir = path.resolve(__dirname, '..');
const sourceDir = path.resolve(websiteDir, '..', 'logo');
const targetDir = path.resolve(websiteDir, 'static', 'logo');

await mkdir(path.dirname(targetDir), {recursive: true});
await rm(targetDir, {recursive: true, force: true});
await cp(sourceDir, targetDir, {recursive: true});
