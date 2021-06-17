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

- Bump the package to the right [SemVer](http://semver.org) (see below)
- Update the `CHANGELOG.md` file<sup id="a1">[1](#f1)</sup>
- Create a git `tag` for the release (note that GitHub releases are based on tags)
- Push the tag to the `master` branch

Standard Version will change your version number following these guides:
- A `git commit -m "fix: …"` commit will trigger a _patch_ update (1.0.0 → 1.0.1)
- A `git commit -m "feat: …"` commit will trigger a _minor_ update (1.0.0 → 1.1.0)
- A `BREAKING CHANGE: …` in the commit body and with any type of commit will trigger a _major_ update (1.0.0 → 2.0.0)


Once the tag is pushed on repo, GitHub Actions take care of building the artifacts for Windows, Linux an macOS and publishing the release. 

<i id="f1">1.</i> Changelog template (in `.versionrc.json`) is a modified version of [this](https://github.com/conventional-changelog/conventional-changelog/blob/f1f50f56626099e92efe31d2f8c5477abd90f1b7/packages/conventional-changelog-conventionalcommits/writer-opts.js#L179-L192). [↩](#a1)
