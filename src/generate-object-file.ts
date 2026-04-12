import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';

type Objects = {
    tables: {
        [id: number]: string;
    };
    tableextensions: {
        [id: number]: string;
    };
    pages: {
        [id: number]: string;
    };
    pageextensions: {
        [id: number]: string;
    };
    codeunits: {
        [id: number]: string;
    };
    reports: {
        [id: number]: string;
    };
    reportextensions: {
        [id: number]: string;
    };
    permissionsets: {
        [id: number]: string;
    };
    enums: {
        [id: number]: string;
    };
    enumextensions: {
        [id: number]: string;
    };
    queries: {
        [id: number]: string;
    };
    xmlports: {
        [id: number]: string;
    };
    profiles: {
        [id: number]: string;
    };
};


type IdObjectKeys = keyof Objects;
const OBJECT_PATTERNS = {
    table:
        /^table\s+(\d+)\s+(?:"([^"]+)"|([^\s]+))/igm,
    tableextension:
        /^tableextension\s+(\d+)\s+(?:"([^"]+)"|([^\s]+))/igm,
    page:
        /^page\s+(\d+)\s+(?:"([^"]+)"|([^\s]+))/igm,
    pageextension:
        /^pageextension\s+(\d+)\s+(?:"([^"]+)"|([^\s]+))/igm,
    pagecustomization:
        /^pagecustomization\s+(?:"([^"]+)"|([^\s]+))/igm,
    profile:
        /^profile\s+(?:"([^"]+)"|([^\s]+))/igm,
    codeunit:
        /^codeunit\s+(\d+)\s+(?:"([^"]+)"|([^\s]+))/igm,
    report:
        /^report\s+(\d+)\s+(?:"([^"]+)"|([^\s]+))/igm,
    reportextension:
        /^reportextension\s+(\d+)\s+(?:"([^"]+)"|([^\s]+))/igm,
    query:
        /^query\s+(\d+)\s+(?:"([^"]+)"|([^\s]+))/igm,
    xmlport:
        /^xmlport\s+(\d+)\s+(?:"([^"]+)"|([^\s]+))/igm,
    controladdin:
        /^controladdin\s+(?:"([^"]+)"|([^\s]+))/igm,
    enum:
        /^enum\s+(\d+)\s+(?:"([^"]+)"|([^\s]+))/igm,
    enumextension:
        /^enumextension\s+(\d+)\s+(?:"([^"]+)"|([^\s]+))/igm,
    interface:
        /^interface\s+(?:"([^"]+)"|([^\s]+))/igm,
    entitlement:
        /^entitlement\s+(?:"([^"]+)"|([^\s]+))/igm,
    permissionset:
        /^permissionset\s+(\d+)\s+(?:"([^"]+)"|([^\s]+))/igm,
    permissionsetextension:
        /^permissionsetextension\s+(\d+)\s+(?:"([^"]+)"|([^\s]+))/igm,
};


/**
 * Recursively find all .al files in a directory
 * @param dir - The directory to search
 * @param fileList - The list of files to add to
 * @returns An array of file paths
 */
export function findAlFiles(dir: string, fileList: string[] = []) {
    const files = fs.readdirSync(dir);

    files.forEach((file: string) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findAlFiles(filePath, fileList);
        } else if (file.endsWith(".al")) {
            fileList.push(filePath);
        }
    });

    return fileList;
}
/**
 * Extract object ID and name from AL file content
 * @param content - The content of the AL file
 * @returns An array of object information
 * @example
 * const objectInfo = extractObjectInfo(`
 * table 10000 "Customer" {
 *     fields {
 *         field(1; No; Code) {
 *         }
 *     }
 * }`);
 * console.log(objectInfo);
 * // [
 * //     { type: 'table', id: 10000, name: 'Customer' },
 * // ]
 */
function extractObjectInfo(content: string) {
    const lines = content.split("\n");
    const objectInfo: {
        type: string;
        id: number | null;
        name: string;
    }[] = [];

    for (const line of lines) {
        // Skip comments and empty lines
        const trimmedLine = line.trim();
        if (
            trimmedLine.startsWith("//") ||
            trimmedLine.startsWith("/*") ||
            !trimmedLine
        ) {
            continue;
        }

        // Try each object type pattern
        for (const [objectType, pattern] of Object.entries(OBJECT_PATTERNS)) {
            const matches = trimmedLine.matchAll(pattern);
            for (const match of matches) {
                const hasId = "table,tableextension,page,pageextension,codeunit,report,reportextension,query,xmlport,enum,enumextension,permissionset,permissionsetextension"
                    .split(",")
                    .includes(objectType);
                // Some objects (like interface) don't have IDs
                if (
                    !hasId
                ) {
                    objectInfo.push({
                        type: objectType,
                        id: null,
                        name: match[1] || match[2] || match[0],
                    });
                } else {

                    objectInfo.push({
                        type: objectType,
                        id: parseInt(match[1], 10),
                        name: match[2] || match[3] || match[1],
                    });
                }
            }
        }
    }

    return objectInfo;
}


/**
 * Generate objects.json from all AL files
 * @param srcDir - The directory to search for AL files
 * @param outputFile - The file to write the objects to
 * 
 */

export function generateObjectJson(srcDir: string, outputFile = 'objects.json') {
    const alFiles = findAlFiles(srcDir);
    let processedCount = 0;
    let skippedCount = 0;
    const objects: Objects = {
        tables: {},
        tableextensions: {},
        pages: {},
        pageextensions: {},
        codeunits: {},
        reports: {},
        reportextensions: {},
        permissionsets: {},
        enums: {},
        enumextensions: {},
        queries: {},
        xmlports: {},
        profiles: {},

    };
    for (const alFile of alFiles) {
        console.log(chalk.blue(`Processing ${alFile}`));

        try {
            const content = fs.readFileSync(alFile, 'utf8');
            const objectInfo = extractObjectInfo(content);
            for (const object of objectInfo) {
                const type = `${object.type}s`;
                if (object.id === null) {
                    skippedCount++;
                    continue;
                } else {
                    (objects as Objects)[type as keyof Objects][object.id] = object.name;
                    processedCount++;
                }
            }
        }
        catch (error) {
            console.error(chalk.red(`Error processing ${alFile}: ${error}`));
            skippedCount++;
        }
    }

    for (const category in objects) {
        const sorted: Record<number, string> = {};
        Object.keys(objects[category as IdObjectKeys])
            .map((id) => parseInt(id, 10))
            .sort((a, b) => a - b)
            .forEach((id) => {
                sorted[id] = objects[category as IdObjectKeys][id];
            });
        objects[category as keyof typeof objects] = sorted;
    }
    fs.writeFileSync(outputFile, JSON.stringify(objects, null, 2));
    console.log(chalk.green(`\n✅ Generated ${outputFile}`));
    console.log(chalk.green(`   Processed: ${processedCount} objects`));
    console.log(chalk.yellow(`   Skipped: ${skippedCount} files`));
    console.log(chalk.green(`\nObject counts:`));
    for (const [category, items] of Object.entries(objects)) {
        if (Object.keys(items).length > 0) {
            console.log(chalk.green(`   ${category}: ${Object.keys(items).length}`));
        }
    }

    return objects;
}

