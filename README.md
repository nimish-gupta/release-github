# release-github
CLI used to create github releases on the basis of the version number

## Usage
```
    $ release-github <options>

    Options
    --release-version     Version for the new release (required)
    --repo, -r            Will be the repository on which the release will be created (required)
    --owner, -o           Owner of the repo, anyone who has push permissions to the github-repo (required)
    --token, -t           Github secret token of the user
    --create-release      Github will create the release only if secret token is present.
    --show-url            Will give the url of the release.
    --pre-filled-release  Show a pre-filled form (secret token not required)
    --commit-id           Commit id from which the new release should run
```

## Development
- `git clone https://github.com/nimish-gupta/release-github.git`// Cloning the git repo
- `cd release-github`
- `yarn` // Installing the dependencies
- `yarn cli` // For starting the cli app
