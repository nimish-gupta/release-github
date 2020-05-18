const newGithubReleaseUrl = require('new-github-release-url');
const open = require('open');
const { execSync } = require('child_process');
const commandExists = require('command-exists');

const isNone = (val) => val === null || val === undefined;

const promisify = async (promise) => {
	try {
		const result = await promise;
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
	if (!isNone(error)) {
		throw new Error(`${msg}, due to ${error.message}`);
	}
	return result;
};

const getCommitRange = (options) => {
	const range = { start: `v${options.releaseVersion}` };
	if (!isNone(options.commitId)) {
		range.start = options.commitId;
		return range;
	}
	const [errorTag, latestTag] = exec('git describe --abbrev=0 --tags');
	if (!isNone(latestTag)) {
		range.start = latestTag;
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
	range.start = firstCommit;
	return range;
};

const getReleaseBody = async (options) => {
	getOrThrow(
		await promisify(commandExists('git', 'git not exists. Please install git'))
	);

	const { start, end } = getCommitRange(options);
	getOrThrow(
		exec(`git tag -a ${end} -m ${end}`),
		'Could not create the latest tag'
	);

	getOrThrow(exec('git push --tags'), `Could not push tags`);
	return getOrThrow(
		exec(`git log --pretty=format:"- %s %h" ${start}...${end};`),
		'Could not retrieve the git log'
	);
};

const openPreFilledRelease = async ({ body, options }) => {
	const url = newGithubReleaseUrl({
		body,
		repo: options.repo,
		user: options.owner,
	});

	if (options.cli === false) {
		return url;
	}

	await open(url);
};

const main = async (args, cli = false) => {
	const options = { ...args, cli };
	if (isNone(options.repo) || isNone(options.owner)) {
		throw new Error('Repo and owner are required options.');
	}

	const body = getReleaseBody(options);

	if (options.preFilledRelease) {
		await openPreFilledRelease({ body, options });
		return '';
	}
};

module.exports = { main };
