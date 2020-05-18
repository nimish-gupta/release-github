const newGithubReleaseUrl = require('new-github-release-url');
const open = require('open');
const gitRepoInfo = require('git-repo-info');

const isNone = (val) => val === null || val === undefined;

const getReleaseBody = (options) => {
	const git = gitRepoInfo(options.gitPath || __dirnames);
};

const openPreFilledRelease = async ({ repo, user, body, options }) => {
	const url = newGithubReleaseUrl({
		repo,
		user,
		body,
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

	const releaseBody = getReleaseBody(options);

	if (options.preFilledRelease) {
		await openPreFilledRelease();
		return '';
	}
};

module.exports = { main };
