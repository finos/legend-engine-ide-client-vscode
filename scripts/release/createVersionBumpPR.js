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

const github = require('@actions/github');
const githubActionCore = require('@actions/core');
const chalk = require('chalk');
const fs = require('fs');
const { execSync } = require('child_process');

const DEFAULT_BRANCH_NAME = 'main';
const PREPARE_RELEASE_PR_BRANCH_NAME = 'bot/prepare-release';

const prepareNewStandardRelease = async () => {
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
  const bumpType = process.env.BUMP_TYPE;
  const PACKAGE_JSON_FILE_NAME = 'package.json';

  // Push release version bump
  console.log(`Creating release version bump PR...`);

  try {
    const defaultBranchRef = (
      await octokit.rest.git.getRef({
        ref: `heads/${DEFAULT_BRANCH_NAME}`,
        ...github.context.repo,
      })
    ).data;
    // clean the PR branch just in case
    try {
      await octokit.rest.git.deleteRef({
        ref: `heads/${PREPARE_RELEASE_PR_BRANCH_NAME}`,
        ...github.context.repo,
      });
    } catch (e) {
      // do nothing
    }
    await octokit.rest.git.createRef({
      // NOTE: this must be the fully qualified reference (e.g. refs/heads/main)
      // See https://docs.github.com/en/rest/reference/git?query=delete+a+reference#create-a-reference
      ref: `refs/heads/${PREPARE_RELEASE_PR_BRANCH_NAME}`,
      sha: defaultBranchRef.object.sha,
      ...github.context.repo,
    });

    // Use npm version to update the version based on the specified type
    execSync(`npm version ${bumpType}`, { stdio: 'inherit' });

    let existingPackageJsonFile;
    let updatedPackageJsonContent;
    try {
      existingPackageJsonFile = (
        await octokit.rest.repos.getContent({
          path: PACKAGE_JSON_FILE_NAME,
          ...github.context.repo,
        })
      ).data;
      updatedPackageJsonContent = fs.readFileSync('package.json', 'base64');
    } catch (error) {
      githubActionCore.error(`Failed to find file. Error:\n${error.message}\n`);
      process.exit(1);
    }

    await octokit.rest.repos.createOrUpdateFileContents({
      path: PACKAGE_JSON_FILE_NAME,
      message: 'prepare for new release',
      branch: PREPARE_RELEASE_PR_BRANCH_NAME,
      content: updatedPackageJsonContent,
      // 'sha' is required when we update the file, i.e the changeset file exists but its content is stale
      // See https://docs.github.com/en/rest/reference/repos#create-or-update-file-contents
      sha: existingPackageJsonFile?.sha,
      ...github.context.repo,
    });

    const bumpVersionPR = (
      await octokit.rest.pulls.create({
        title: `Prepare New ${
          bumpType === 'major' ? 'Release' : 'Iteration Release'
        }`,
        head: PREPARE_RELEASE_PR_BRANCH_NAME,
        base: DEFAULT_BRANCH_NAME,
        ...github.context.repo,
      })
    ).data;
    console.log(
      chalk.green(
        `\u2713 Created a PR to push release version bump : ${bumpVersionPR.html_url}`,
      ),
    );
  } catch (error) {
    githubActionCore.error(
      `Failed to create PR for next release version bump. Error:\n${error.message}\n`,
    );
    process.exit(1);
  }
};

prepareNewStandardRelease();
