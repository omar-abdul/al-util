import chalk from 'chalk';
import { Command } from 'commander';
import { createObject, isALProjectInitialized, isObjectFileGenerated } from './create-objects';

const program = new Command();

program
    .command('create-object')
    .description('Create a new object')
    .action(() => {
        console.log('create-object');
    });

program.parse(process.argv);