#!/usr/bin/env node

const meow = require('meow');
const chalk = require('chalk');

const Index = require('../index');

const required = chalk.red('(required)');

const cli = meow(
	`
  Usage
    $ release-github <options>

    Options
    --release-version     Version for the new release ${required}
    --repo, -r            Will be the repository on which the release will be created ${required}
    --owner, -o           Owner of the repo, anyone who has push permissions to the github-repo ${required}
    --token, -t           Github secret token of the user
    --create-release      Github will create the release only if secret token is present.
    --show-url            Will give the url of the release.
    --pre-filled-release  Show a pre-filled form (secret token not required)
    --commit-id           Commit id from which the new release should run
`,
	{
		flags: {
			token: {
				type: 'string',
				alias: 't',
				isRequired: (flags) => flags.createRelease,
			},
			repo: {
				type: 'string',
				alias: 'r',
				isRequired: true,
			},
			owner: {
				type: 'string',
				alias: ['o'],
				isRequired: true,
			},
			createRelease: {
				type: 'boolean',
				default: false,
			},
			showUrl: {
				type: 'boolean',
				default: false,
			},
			releaseVersion: {
				type: 'string',
				isRequired: true,
			},
			branch: {
				type: 'string',
				default: 'master',
			},
			preFilledRelease: {
				type: 'boolean',
				default: true,
			},
			commitId: {
				type: 'string',
			},
		},
	}
);
Index.main(cli.flags, true);
