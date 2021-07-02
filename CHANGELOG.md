# Changelog
## [1.0.0-beta.18](https://github.com/dent-table/dent-table/compare/v1.0.0-beta.17...v1.0.0-beta.18) (2021-07-02)


### Continuous Integration

* workaround for electron-builder "EEXIST: file already exists" error ([79e0d23](https://github.com/dent-table/dent-table/commit/79e0d238d08bd8b64482d6962474c9174db82a9d))

## [1.0.0-beta.17](https://github.com/dent-table/dent-table/compare/v1.0.0-beta.16...v1.0.0-beta.17) (2021-07-02)

## [1.0.0-beta.16](https://github.com/dent-table/dent-table/compare/v1.0.0-beta.15...v1.0.0-beta.16) (2021-07-02)


### Continuous Integration

* add access token to organization private repos ([d39996d](https://github.com/dent-table/dent-table/commit/d39996d115973f1749615ee149eea547d17b769a))

## [1.0.0-beta.15](https://github.com/dent-table/dent-table/compare/v1.0.0-beta.14...v1.0.0-beta.15) (2021-07-02)


### Continuous Integration

* checkout submodule ([8e0614a](https://github.com/dent-table/dent-table/commit/8e0614a713199e66a91db1f5b68046bbc46839ad))

## [1.0.0-beta.14](https://github.com/dent-table/dent-table/compare/v1.0.0-beta.13...v1.0.0-beta.14) (2021-07-02)


### ⚠ BREAKING CHANGES

* now this repo should not work as expected anymore. Use a fork instead!
* **data:** `data_entry.js` will no work anymore

### Features

* **PreferencesService:** add table's order column to preferences.json and preferences.service.ts. ([3d5c32e](https://github.com/dent-table/dent-table/commit/3d5c32e2e472ff80da6409df7bd7005d34528734))
* remove ng-mat-search-bar library replaced by a custom search field component ([d65703c](https://github.com/dent-table/dent-table/commit/d65703c996ad2bef4f8dd3590fa6f6e00602450e))


### Bug Fixes

* **databaseService:** implements `enterZone` operator for all database methods. ([853bfb4](https://github.com/dent-table/dent-table/commit/853bfb4603f6ba64ff90bd0e6e7d8d4f54dc7f47))
* resolve rxjs deprecated subscribe function ([d1fdc92](https://github.com/dent-table/dent-table/commit/d1fdc9211b928a7235caa005a532d7077eca29ba))


### Build System

* bumped dependencies. Added electron-rebuild ([a6c01ec](https://github.com/dent-table/dent-table/commit/a6c01ec3daffd310b068d9132692fa5ed1c13ab7))
* changed electron-builder configuration to support new external data implementation ([042e8b0](https://github.com/dent-table/dent-table/commit/042e8b027a8a06d6070021347ca31a5a8f2b1369))


### Others

* add data submodule ([124ee0e](https://github.com/dent-table/dent-table/commit/124ee0e68bba1d19024a60cd681b77a8a827336b))
* updated all paths according to the app folder structure ([713f918](https://github.com/dent-table/dent-table/commit/713f918932636a8be8f1670b58a1a7638a9a3b4b))
* **data:** moved data to an external repository ([a321cd2](https://github.com/dent-table/dent-table/commit/a321cd283e6eded50f4312980ac41d299457e26d))
* **fork:** update documentation with more specific details on master->forks workflow ([63e58ae](https://github.com/dent-table/dent-table/commit/63e58ae62505045120c8d42c1f03312c27c9e99e))
* **fork:** update documentation with more specific details on master->forks workflow ([8fe1c05](https://github.com/dent-table/dent-table/commit/8fe1c05b555795fd52f9d686ad40da0e87d6b0f0))
* **fork:** update documentation with more specific details on master->forks workflow ([ddd61e4](https://github.com/dent-table/dent-table/commit/ddd61e477e6f43cdc2255f0e6f969d3d0d8630af))
* **fork:** update documentation with more specific details on master->forks workflow ([d7935dd](https://github.com/dent-table/dent-table/commit/d7935dd337d463c0ed4cce6138ea8dbbf8a7651c))
* **fork:** update documentation with more specific details on master->forks workflow ([c5aa131](https://github.com/dent-table/dent-table/commit/c5aa1311c5fabfcf7442a25c669964a085846b71))
* bump angular dependencies ([e76fa3a](https://github.com/dent-table/dent-table/commit/e76fa3af26ac37343bbef256ba833d2a288bc0b0))
* code generalization for the new master->forks workflow ([0886114](https://github.com/dent-table/dent-table/commit/0886114e981f8595df73e8c79d30369466c08a9f))
* remove old main.ts ([effa731](https://github.com/dent-table/dent-table/commit/effa7314a67246eb0784f70d45c4c85ffdfa0184))
* **loggerService:** optimized logger.service.ts to support configurations in different environments ([fc0e579](https://github.com/dent-table/dent-table/commit/fc0e57925df42db6dabc62b97c5c273342c116eb))
* **SQLITE_BUILD:** typo ([7783dfd](https://github.com/dent-table/dent-table/commit/7783dfd6d7e9c921d9e84cf70e1dfee025de5c82))
* **SQLITE_BUILD:** update for the two packages structure ([8d6287c](https://github.com/dent-table/dent-table/commit/8d6287c525ec81476a4fc754073b909d15b77b6b))

## [1.0.0-beta.13](https://github.com/vincios/dent-table/compare/v1.0.0-beta.12...v1.0.0-beta.13) (2021-06-16)


### Continuous Integration

* **prerelease:** fix a bug on prerelease condition ([0e7f60d](https://github.com/vincios/dent-table/commit/0e7f60dcbd94cb4fedbed1035bee114a2c2df695))

## [1.0.0-beta.12](https://github.com/vincios/dent-table/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2021-06-16)


### Continuous Integration

* support for pre-releases. Refactoring. ([66bd4f3](https://github.com/vincios/dent-table/commit/66bd4f3d6307cfd44da6348d0a2d949581b638c7))


### Others

* **release:** 1.0.0-beta.11 ([2664ec3](https://github.com/vincios/dent-table/commit/2664ec3e248cd0b7c357e66569d8f6b9659d2f33))
* **versioning:** add standard-version ([31d83ed](https://github.com/vincios/dent-table/commit/31d83ed91b29071f03eebaa012d1e9a74cf1deac))
