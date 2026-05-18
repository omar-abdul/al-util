import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';

import { OBJECT_TEMPLATES } from './object-templates';
import { getPublisher, toTitleCase } from './util';




type ObjectType = keyof typeof OBJECT_TEMPLATES;
type ParsedObject = Record<string, Record<number, string>>;
type AppJson = {
    idRanges?: Array<{ from: number; to: number }>;
};

const OBJECT_TYPES_WITHOUT_ID = new Set<ObjectType>(['interface']);

const OBJECT_COLLECTION_BY_TYPE: Record<ObjectType, string> = {
    table: 'tables',
    tableextension: 'tableextensions',
    page: 'pages',
    pageextension: 'pageextensions',
    codeunit: 'codeunits',
    report: 'reports',
    reportextension: 'reportextensions',
    permissionset: 'permissionsets',
    enum: 'enums',
    enumextension: 'enumextensions',
    query: 'queries',
    interface: 'interfaces',
};


export function createObject(projectDir: string, dir: string, objectType: ObjectType, name: string, extend: string) {
    const requiresId = !OBJECT_TYPES_WITHOUT_ID.has(objectType);
    const objectsJsonPath = path.join(projectDir, 'objects.json');
    const parsed = parseJsonFile<ParsedObject>(objectsJsonPath);
    if (!parsed) {
        return;
    }


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
    let objectId = 0;
    let collectionKey: string | null = null;
    let availableObjects: Record<number, string> = {};
    if (requiresId) {
        const appJsonPath = path.join(projectDir, 'app.json');
        const appJson = parseJsonFile<AppJson>(appJsonPath);
        if (!appJson) {
            return;
        }
        const idRanges = appJson.idRanges;
        if (!idRanges || idRanges.length === 0 || typeof idRanges[0]?.from !== 'number') {
            console.error(chalk.red(`Invalid ${appJsonPath}. Expected "idRanges" with at least one numeric "from" value.`));
            return;
        }

        collectionKey = OBJECT_COLLECTION_BY_TYPE[objectType];
        availableObjects = parsed[collectionKey] ?? {};
        const idArrays = Object.keys(availableObjects)
            .map((id) => Number.parseInt(id, 10))
            .filter((id) => Number.isFinite(id));
        if (idArrays.length > 0) {
            objectId = Math.max(...idArrays) + 1;
        } else {
            objectId = idRanges[0].from;
        }
    }
    const defaultPublisher = getPublisher(projectDir).split(" ").join("");
    const content = objectTemplate(objectId, titleCaseName, defaultPublisher, extend);
    const filename = requiresId
        ? `${titleCaseName}-${objectId}.${titleCaseObjectType.toLowerCase()}.al`
        : `${titleCaseName}.${titleCaseObjectType.toLowerCase()}.al`;
    const finalDir = path.join(dir, titleCaseObjectType);
    if (!fs.existsSync(finalDir)) {
        fs.mkdirSync(finalDir, { recursive: true });
    }
    const templateCreated = generateTemplate(finalDir, filename, content);
    if (!templateCreated) {
        return;
    }

    if (requiresId && collectionKey) {
        parsed[collectionKey] = availableObjects;
        parsed[collectionKey][objectId] = titleCaseName;
        sortObjectCollection(parsed[collectionKey]);
        fs.writeFileSync(objectsJsonPath, JSON.stringify(parsed, null, 2));
        console.log(chalk.green(`Updated ${objectsJsonPath} with ${titleCaseObjectType} ${objectId}.`));
    }

}

function parseJsonFile<T>(filePath: string): T | null {
    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(raw) as T;
    } catch (error) {
        const err = error as NodeJS.ErrnoException;
        if (err instanceof SyntaxError) {
            console.error(chalk.red(`Invalid JSON in ${filePath}.`));
            console.error(chalk.yellow(err.message));
            console.error(chalk.yellow('Tip: JSON does not allow trailing commas or comments.'));
            return null;
        }

        if (err.code === 'ENOENT') {
            console.error(chalk.red(`Could not find required file: ${filePath}`));
            return null;
        }

        console.error(chalk.red(`Failed to read JSON file: ${filePath}`));
        console.error(chalk.yellow(err.message));
        return null;
    }
}

function generateTemplate(dir: string, filename: string, content: string) {
    const outputPath = path.join(dir, filename);
    try {
        // "wx" prevents accidental overwrites if the file already exists.
        fs.writeFileSync(outputPath, content, { encoding: 'utf8', flag: 'wx' });
        console.log(chalk.green(`Created ${outputPath}`));
        return true;
    } catch (error) {
        const err = error as NodeJS.ErrnoException;
        if (err.code === 'EEXIST') {
            console.error(chalk.yellow(`File already exists: ${outputPath}`));
            return false;
        }
        if (err.code === 'ENOENT') {
            console.error(chalk.red(`Directory not found for output path: ${outputPath}`));
            return false;
        }
        if (err.code === 'EACCES' || err.code === 'EPERM') {
            console.error(chalk.red(`Permission denied while writing: ${outputPath}`));
            return false;
        }

        console.error(chalk.red(`Failed to write template: ${outputPath}`));
        console.error(err.message);
        return false;
    }

}

function sortObjectCollection(collection: Record<number, string>) {
    const sortedEntries = Object.entries(collection)
        .map(([id, objectName]) => [Number.parseInt(id, 10), objectName] as const)
        .filter(([id]) => Number.isFinite(id))
        .sort(([a], [b]) => a - b);

    for (const key of Object.keys(collection)) {
        delete collection[Number.parseInt(key, 10)];
    }

    for (const [id, objectName] of sortedEntries) {
        collection[id] = objectName;
    }
}

// Convert name and objectType to Title Case
