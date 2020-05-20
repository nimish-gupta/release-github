# release-github

CLI used to create github releases on the basis of the version number

## Install

`yarn add release-github`

or

`npm install --save release-github`

## Usage

- In cli

  `$release-github --release-version <version> --repo <repo> --owner <owner>`

- As a module

  ```javascript
  const release = require("release-github");

  // As a promise
  release({
      releaseVersion: "<version>",
      repo: "<repo>"
      owner: "<owner>"
  })
  .then(console.log)
  .catch(console.error);

  // Using async/await
  await release({ releaseVersion: "<version>", repo: "<repo>", owner: "<owner>" });
  ```

### Options

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

- Clone the repo - `git clone https://github.com/nimish-gupta/release-github.git`
- `cd release-github`
- Install all the dependencies - `yarn`
- Start the cli app - `yarn cli`
