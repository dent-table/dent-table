# How to release
Release a new version on GitHub is made with [Standard Version](https://github.com/conventional-changelog/standard-version) and GitHub Actions.

To release a new version simply run
```shell
npm run release
```

or, if you want release a "prerelease" beta version, run
```shell
npm run release:beta
```

If all your commits (or, at least, most of them) follows [commits guidelines](CONTIBUTING.md), then the script automagically:

- Bump the package to the right [SemVer](http://semver.org) 
- Update the `CHANGELOG.md` file
- Create a git `tag` for the release (note that GitHub releases are based on tags)
- Push the tag to the `master` branch

Once the tag is pushed on repo, GitHub Actions take care of building the artifacts for Windows, Linux an macOS and publishing the release. 
