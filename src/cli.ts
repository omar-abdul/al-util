import chalk from 'chalk';
import { Command } from 'commander';
import path from 'node:path';
import { createObject } from './create-objects';
import { generateObjectJson } from './generate-object-file';
import { OBJECT_TEMPLATES } from './object-templates';
import { isALProjectInitializedIn, isObjectFileGenerated, toTitleCase } from './util';

const program = new Command();
program
    .name('al-util')
    .description('A CLI tool to help manage your AL project and objects.')
    .version('0.0.1');
program
    .command('create')
    .description('Scaffold a new AL object (table, page, codeunit, extension, etc.) in your project with the proper template and object ID.')
    .argument('<object-type>', "The type of object to create")
    .option('-n, --name <name>', "The name of the object")
    .option('-a, --app-dir <appDir>', "AL app directory to use for app.json and objects.json")
    .option('-d, --directory <directory>', "The directory to create the object in")
    .option('-e, --extends [extends]', "The object to extend")
    .action((objectType, { name, appDir, directory, extends: ex }) => {
        const extendedObjects = ['tableextension', 'pageextension', 'reportextension', 'enumextension'];
        if (extendedObjects.includes(objectType) && !ex) {
            program.error(chalk.red('An extended object must specify an object to extend. Example: al-util create tableextension --extends "Customer"'));
        }
        const cwd = process.cwd();
        const projectDir = appDir ? path.resolve(cwd, appDir) : cwd;
        const dir = directory ? path.resolve(projectDir, directory) : projectDir;
        if (!objectType) {
            const types = Object.keys(OBJECT_TEMPLATES)
                .map((key) => `  - ${toTitleCase(key)}`)
                .join("\n");

            program.error(
                chalk.red(
                    `Object type is required. Available object types are:\n${types}`
                )
            );
        }
        if (!name) {
            program.error(chalk.red('Name is required'));

        }

        if (!isObjectFileGenerated(projectDir)) {
            if (!isALProjectInitializedIn(projectDir)) {
                program.error(chalk.red('AL project is not initialized in the selected app directory. Run this command inside an AL app, or pass --app-dir <path-to-app>.'));

            }
            console.log(chalk.yellow('Could not find objects.json file. Generating...'));
            generateObjectJson(projectDir, path.join(projectDir, 'objects.json'));

        }


        createObject(projectDir, dir, objectType, name, ex);
    });

program
    .command('generate')
    .description('Generate the objects.json file from the AL files. By default it will search for the AL files in the current directory.')
    .option('-a, --app-dir <appDir>', "AL app directory to use for output objects.json")
    .option('-d, --directory [directory]', "The directory to generate the object file in")
    .action(({ appDir, directory }) => {
        const cwd = process.cwd();
        const projectDir = appDir ? path.resolve(cwd, appDir) : cwd;
        const dir = directory ? path.resolve(projectDir, directory) : projectDir;

        generateObjectJson(dir, path.join(projectDir, 'objects.json'));
    });



program.parse(process.argv);