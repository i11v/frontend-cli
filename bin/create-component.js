#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs-extra');
const commander = require('commander');
const chalk = require('chalk');
const { stripIndent } = require('common-tags');

const pkg = require('../package.json');
const packageJson = require(path.resolve(process.cwd(), 'package.json'))
let componentName;

const command = new commander.Command('create-component')
  .version(pkg.version)
  .arguments('<ComponentName>')
  .usage(`${chalk.green('<ComponentName>')} [options]`)
  .action(name => {
    componentName = name;
  })
  .option('-F, --functional', 'Created functional component', false)
  .option('--no-css', 'Component w/o styles', false)
  .parse(process.argv);

if (packageJson['frontend-cli'] === undefined) {
  console.error('Could not parse frontend-cli config');
  console.log();
  console.log('Add config to your package.json');
  process.exit(1);
}

const config = packageJson['frontend-cli'];

if (componentName === undefined) {
  console.error('Please specify component name');
  console.log(
    `  ${chalk.cyan(command.name())} ${chalk.green('<ComponentName>')}`
  );
  console.log();
  console.log('For example:');
  console.log(`  ${chalk.cyan(command.name())} ${chalk.green('SquareButton')}`);
  console.log();
  console.log(
    `Run ${chalk.cyan(`${command.name()} --help`)} to see all options.`
  );
  process.exit(1);
}

createComponent(componentName, command.functional, command.noCSS);

function createComponent(name, functional, noCSS) {
  const root = path.resolve(config.components, componentName);

  fs.ensureDirSync(root);

  const packageJson = {
    main: `./${name}.jsx`,
  };

  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  let cssImport;

  if (!noCSS) {
    const cssFileName = `${name}.module.scss`;

    fs.writeFileSync(
      path.join(root, cssFileName),
      `.container {}`
    );
    cssImport = `import styles from './${cssFileName}';`;
  }

  if (functional) {
    const componentTmpl = stripIndent`
      import React from 'react';
      import PropTypes from 'prop-types';
      ${cssImport}

      const ${name} = ({}) => (
        <div className={styles.container}>
          Component
        </div>
      );
      
      ${name}.propTypes = {};
      ${name}.defaultProps = {};

      export default ${name};`;

    fs.writeFileSync(path.join(root, `${name}.jsx`), componentTmpl);
  } else {
    const componentTmpl = stripIndent`
      import React, { Component } from 'react';
      import PropTypes from 'prop-types';
      ${cssImport}

      class ${name} extends Component {
        static propTypes = {};

        static defaultProps = {};

        render() {
          return (
            <div className={styles.container}>
              Component
            </div>
          )
        }
      }

      export default ${name};`;

    fs.writeFileSync(path.join(root, `${name}.jsx`), componentTmpl);
  }

  console.log(chalk.green(`Component ${name} successfully created`))
}
