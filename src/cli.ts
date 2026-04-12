import chalk from 'chalk';
import { Command } from 'commander';
import path from 'node:path';
import { createObject } from './create-objects';
import { generateObjectJson } from './generate-object-file';
import { OBJECT_TEMPLATES } from './object-templates';
import { isALProjectInitialized, isObjectFileGenerated, toTitleCase } from './util';

const program = new Command();
program
    .name('al-util')
    .description('A CLI tool to help manage your AL project and objects.')
    .version('0.0.1');
program
    .command('create')
    .option('-t, --object-type <object-type>', "The type of object to create")
    .option('-n, --name <name>', "The name of the object")
    .option('-d, --directory <directory>', "The directory to create the object in")
    .action(({ objectType, name, directory }) => {
        const rootDir = process.cwd();
        const dir = directory ? path.resolve(rootDir, directory) : rootDir;
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

        if (!isObjectFileGenerated()) {
            if (!isALProjectInitialized()) {
                program.error(chalk.red('AL project is not initialized. Please run `al-util init` to initialize the project.'));

            }
            console.log(chalk.yellow('Could not find objects.json file. Generating...'));
            generateObjectJson(rootDir);

        }


        createObject(dir, objectType, name);
    });

program
    .command('generate')
    .description('Generate the objects.json file from the AL files. By default it will search for the AL files in the current directory.')
    .option('-d, --directory [directory]', "The directory to generate the object file in")
    .action(({ directory }) => {
        const rootDir = process.cwd();
        const dir = directory ? path.resolve(rootDir, directory) : rootDir;

        generateObjectJson(dir);
    });



program.parse(process.argv);