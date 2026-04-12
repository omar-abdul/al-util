import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';

import { OBJECT_TEMPLATES } from './object-templates';


export function isALProjectInitialized() {
    const rootDir = process.cwd()
    return fs.existsSync(path.join(rootDir, 'app.json'));
}

export function isObjectFileGenerated() {
    const rootDir = process.cwd();
    return fs.existsSync(path.join(rootDir, 'objects.json'));
}
function getPublisher() {
    const rootDir = process.cwd();
    const appJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'app.json'), 'utf8'));
    return appJson.publisher;
}

type ObjectType = keyof typeof OBJECT_TEMPLATES;
type ParsedObject = Record<ObjectType, Record<number, string>>


export function createObject(dir: string = "./", objectType: ObjectType, name: string) {
    const rootDir = process.cwd();
    const parsed: ParsedObject = JSON.parse(fs.readFileSync(path.join(rootDir, 'objects.json'), 'utf8'));
    const appJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'app.json'), 'utf-8'));
    const idRanges = appJson.idRanges;


    const objectTemplate = OBJECT_TEMPLATES[objectType];



    const titleCaseObjectType = toTitleCase(objectType);
    const titleCaseName = toTitleCase(name);

    if (!objectTemplate) {
        console.error(chalk.red(`Object template for ${titleCaseObjectType} not found. Available objects are \n`))
        for (const key of Object.keys(OBJECT_TEMPLATES)) {
            console.error(`${toTitleCase(key)}\n`);
        }
        return;
    }
    const availableObjects = parsed[objectType];
    const idArrays = Object.keys(availableObjects).map(Number);
    let objectId: number;
    if (idArrays.length > 0) {
        objectId = Math.max(...idArrays);
    }
    objectId = idRanges.from + 1;
    const defaultPublisher = getPublisher();
    const content = objectTemplate(objectId, titleCaseName, defaultPublisher);
    const filename = titleCaseName === "Default" ? `${titleCaseObjectType}-${objectId}.al` : `${titleCaseName}-${titleCaseObjectType}-${objectId}.al`;
    const finalDir = path.join(dir, titleCaseObjectType);
    if (!fs.existsSync(finalDir)) {
        fs.mkdirSync(finalDir, { recursive: true });
    }
    generateTemplate(finalDir, filename, content);

}

function generateTemplate(dir: string, filename: string, content: string) {
    const outputPath = path.join(dir, filename);
    try {
        // "wx" prevents accidental overwrites if the file already exists.
        fs.writeFileSync(outputPath, content, { encoding: 'utf8', flag: 'wx' });
        console.log(chalk.green(`Created ${outputPath}`));
    } catch (error) {
        const err = error as NodeJS.ErrnoException;
        if (err.code === 'EEXIST') {
            console.error(chalk.yellow(`File already exists: ${outputPath}`));
            return;
        }
        if (err.code === 'ENOENT') {
            console.error(chalk.red(`Directory not found for output path: ${outputPath}`));
            return;
        }
        if (err.code === 'EACCES' || err.code === 'EPERM') {
            console.error(chalk.red(`Permission denied while writing: ${outputPath}`));
            return;
        }

        console.error(chalk.red(`Failed to write template: ${outputPath}`));
        console.error(err.message);
    }

}

// Convert name and objectType to Title Case
function toTitleCase(str: string) {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}