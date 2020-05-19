const newGithubReleaseUrl = require('new-github-release-url');
const open = require('open');
const { execSync } = require('child_process');
const commandExists = require('command-exists').sync;
const chalk = require('chalk');
const fetch = require('node-fetch');

const isNone = (val) => val === null || val === undefined;
const isNotNone = (val) => !isNone(val);

const tryCatch = (cmd) => {
	try {
		const result = cmd;
		return [null, result];
	} catch (error) {
		return [error, null];
	}
};

const exec = (command) => {
	try {
		const result = execSync(command);
		return [null, result.toString('utf8'.trim())];
	} catch (error) {
		return [error, null];
	}
};

const getOrThrow = (cmd, msg = '') => {
	const [error, result] = cmd;

	if (isNotNone(error)) {
		throw new Error(`${msg}, due to ${error.message}`);
	}

	return result;
};

const createTag = (version) => `v${version}`;

const createGithubRelease = async ({ body, options }) => {
	const tag = createTag(options.releaseVersion);

	var requestOptions = {
		method: 'POST',
		headers: {
			Authorization: `Basic ${Buffer.from(
				`${options.owner}:${options.token}`
			).toString('base64')}`,
			'Content-Type': 'application/javascript',
		},
		body: JSON.stringify({
			body,
			name: tag,
			tag_name: tag,
		}),
	};

	const response = await fetch(
		`https://api.github.com/repos/${options.owner}/${options.repo}/releases`,
		requestOptions
	);

	const res = await response.json();
	return res.html_url;
};

const getCommitRange = (options) => {
	const range = { end: createTag(options.releaseVersion) };

	if (isNotNone(options.commitId)) {
		range.start = options.commitId;
		return range;
	}

	const [errorTag, latestTag] = exec('git describe --abbrev=0 --tags');

	if (isNotNone(latestTag)) {
		range.start = latestTag.replace('\n', '');
		return range;
	}

	if (
		errorTag.message.indexOf('No names found, cannot describe anything.') === -1
	) {
		throw new Error(`Could not receive latest tag, due to ${errorTag.message}`);
	}

	const firstCommit = getOrThrow(
		exec('git rev-list --max-parents=0 HEAD'),
		'Could not fetch the start of commit'
	);

	range.start = firstCommit.replace('\n', '');
	return range;
};

const getCompareLink = ({ options, start, end }) =>
	`https://github.com/${options.owner}/${options.repo}/compare/${start}...${end}`;

const createLatestTag = (tag) => {
	getOrThrow(
		exec(`git tag -a ${tag} -m ${tag}`),
		'Could not create the latest tag'
	);

	getOrThrow(exec('git push --tags'), `Could not push tags`);
};

const getReleaseBody = async ({ options, start, end }) => {
	createLatestTag(end);

	const log = getOrThrow(
		exec(`git log --pretty=format:"- %s %h" ${start}...${end};`),
		'Could not retrieve the git log'
	);

	return `${log}\n\n${getCompareLink({ options, start, end })}`;
};

const openPreFilledRelease = async ({ body, options }) => {
	const tag = createTag(options.releaseVersion);
	const url = newGithubReleaseUrl({
		body,
		tag,
		title: tag,
		repo: options.repo,
		user: options.owner,
	});

	if (options.cli !== false && options.showUrl !== true) {
		await open(url);
	}

	return url;
};

const checkGitExists = () =>
	getOrThrow(
		tryCatch(commandExists('git')),
		'git not exists. Please install git'
	);

const optionsShouldPresent = (options, keys) => {
	const filter = keys.filter((key) => isNone(options[key]));

	if (filter.length === 0) {
		return true;
	}

	throw new Error(`Following flags are required, ${filter.join(', ')}`);
};

const main = async (args, cli = false) => {
	const options = { ...args, cli };

	optionsShouldPresent(options, ['repo', 'owner', 'releaseVersion']);
	checkGitExists();

	const { start, end } = getCommitRange(options);
	const body = await getReleaseBody({ options, start, end });

	console.log(chalk.blue('Git release body contents'));
	console.log(chalk.gray(body));

	if (options.preFilledRelease) {
		const url = await openPreFilledRelease({ body, options });
		console.log(chalk.green(url));
		return url;
	}
	if (options.createRelease) {
		optionsShouldPresent(options, ['token']);
		const url = await createGithubRelease({ body, options });
		console.log(chalk.green(url));
		return url;
	}
};

module.exports = main;
