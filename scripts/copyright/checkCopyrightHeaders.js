/**
 * Copyright (c) 2023-present, Goldman Sachs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { execSync } = require('child_process');
const { existsSync, lstatSync, readFileSync } = require('fs');
const { EOL } = require('os');
const micromatch = require('micromatch');
const { isBinaryFileSync } = require('isbinaryfile');
const chalk = require('chalk');
const { resolve } = require('path');

const getIncludedPatterns = ({ extensions }) => [
  ...extensions.map((extension) => createRegExp(`\\.${extension}$`)),
];

const GENERIC_INCLUDE_PATTERNS = [
  /\.[^/]+$/, // files with extension
];

const GENERIC_EXCLUDE_PATTERNS = [
  // nothing
];

const createRegExp = (pattern) => new RegExp(pattern);

const exit = (msg, code) => {
  console.log(msg);
  process.exit(code);
};
const exitWithError = (msg) => exit(msg, 1);

const getFileContent = (file) => readFileSync(file, { encoding: 'utf-8' });

const needsCopyrightHeader = (copyrightText, file) => {
  const fileContent = getFileContent(file);
  // NOTE: while checking for copyright header, we just generate the copyright comment content
  // not including the full comment (with opening/closing syntax) because potentially the copyright
  // comment might have been merged with another comment.
  const text = generateCopyrightComment({
    text: copyrightText,
    pkg: {},
    onlyGenerateCommentContent: true,
  });
  return fileContent.trim().length > 0 && !fileContent.includes(text);
};

const generateCopyrightComment = ({
  text,
  /**
   * Optional. This text will be added prior to the copyright content.
   * This is often useful for bundled code.
   * e.g. `@license some-package v1.0.0`
   */
  pkg: { name, version },
  /**
   * Boolean flag indicating if we are to generate just the content of the comment
   * or the opening/closing syntax for it
   */
  onlyGenerateCommentContent,
  /**
   * TODO: account for file extension to generate different kinds of comments.
   * e.g. `html` comment is a tag `<!-- content -->`
   * e.g. `yaml` comment uses `#`
   */
  file,
}) => {
  // TODO: depending on the file type, these params might differ
  const headerPrefix = '/**';
  const contentPrefix = ' *';
  const footerPrefix = ' */';

  let lines = text
    .trim()
    .split(EOL)
    .map((line) => `${contentPrefix}${line.length ? ` ${line}` : ''}`);
  if (!onlyGenerateCommentContent) {
    lines = [
      `${headerPrefix}${
        name && version ? ` @license ${name} v${version}` : ''
      }`,
      ...lines,
      footerPrefix,
    ];
  }
  return lines.join(EOL);
};

// Jest has a fairly sophisticated check for copyright license header that we used as reference
// See https://github.com/facebook/jest/blob/master/scripts/checkCopyrightHeaders.js
const getInvalidFiles = ({
  extensions = [],
  /* micromatch glob patterns */
  excludePatterns = [],
  copyrightText,
  onlyApplyToModifiedFiles,
}) => {
  const files = execSync(
    `git ls-files ${onlyApplyToModifiedFiles ? '--modified' : ''}`,
    { encoding: 'utf-8' },
  )
    .trim()
    .split('\n');

  const includePatterns = getIncludedPatterns({ extensions });

  return files.filter(
    (file) =>
      GENERIC_INCLUDE_PATTERNS.some((pattern) => pattern.test(file)) &&
      includePatterns.some((pattern) => pattern.test(file)) &&
      !GENERIC_EXCLUDE_PATTERNS.some((pattern) => pattern.test(file)) &&
      !micromatch.isMatch(file, excludePatterns) &&
      existsSync(file) &&
      !lstatSync(file).isDirectory() &&
      !isBinaryFileSync(file) &&
      needsCopyrightHeader(copyrightText, file),
  );
};

const config = {
  extensions: ['js', 'ts'],
  excludePatterns: [],
  copyrightText: readFileSync(resolve(__dirname, './COPYRIGHT_HEADER.txt'), {
    encoding: 'utf-8',
  }),
};

const checkCopyrightHeaders = ({
  extensions = [],
  /* micromatch glob patterns */
  excludePatterns = [],
  copyrightText,
  helpMessage,
}) => {
  const files = getInvalidFiles({
    extensions,
    excludePatterns,
    copyrightText,
    onlyApplyToModifiedFiles: false,
  });

  if (files.length > 0) {
    exitWithError(
      `Found ${files.length} file(s) without copyright header:\n${files
        .map((file) => `${chalk.red('\u2717')} ${file}`)
        .join('\n')}${helpMessage ? `\n${helpMessage}` : ''}`,
    );
  } else {
    console.log('No issues found!');
  }
};

checkCopyrightHeaders({
  ...config,
  helpMessage: `Please include the header or exclude the files in 'scripts/copyright/copyright.config.js'`,
});
