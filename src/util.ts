import * as fs from 'node:fs';
import * as path from 'node:path';

export function isALProjectInitialized() {
    const rootDir = process.cwd()
    return fs.existsSync(path.join(rootDir, 'app.json'));
}

export function isObjectFileGenerated() {
    const rootDir = process.cwd();
    return fs.existsSync(path.join(rootDir, 'objects.json'));
}
export function getPublisher() {
    const rootDir = process.cwd();
    const appJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'app.json'), 'utf8'));
    return appJson.publisher;
}
export function toTitleCase(str: string) {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}