![MyOdPlan Logo][app-logo] [![Angular Logo](https://www.vectorlogo.zone/logos/angular/angular-icon.svg)](https://angular.io/) [![Electron Logo](https://www.vectorlogo.zone/logos/electronjs/electronjs-icon.svg)](https://electronjs.org/)


![Maintained][maintained-badge]
[![Build Release][build-badge]][build]

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]

# Introduction

Bootstrap and package your project with Angular 12 and Electron 13 (Typescript + SASS + Hot Reload) for creating Desktop applications.

Currently runs with:

- Angular v12
- Electron v13
- Electron Builder v22

With this sample, you can:

- Run your app in a local development environment with Electron & Hot reload
- Run your app in a production environment
- Package your app into an executable file for Linux, Windows & Mac

## Getting Started
**This project uses a master repo, [dent-table](https://github.com/dent-table/dent-table), that is a shared (common) codebase for customer specific forks**. 

See [FORK.md](HOW_TO_FORK.md) to see how to create a new customer fork from master repo.

## ⚠️Only in forks: clone
**If you want to clone this fork**, follows steps in [FORK.md](HOW_TO_FORK.md) **starting from** paragraph [2. Fork `dent-table` master repo (upsteram) to a new `dent-table-xxx` repository](HOW_TO_FORK.md#2-fork-dent-table-to-a-new-dent-table-xxx-repository).

As stated into the guide, you can skip steps `2.1`, `3.1` and `3.2`.

## ⚠️Only in master repo: clone
**If you want to clone the master shared codebase (i.e. `dent-table`)**, follow this steps:

_(extracted from [FORK.md](HOW_TO_FORK.md), see this document for more info)_

1. Clone `dent-table`

    ```bash
    git clone https://github.com/dent-table/dent-table.git dent-table
    ```

2. Initialize the submodule `dent-table-sqlite`

    ```bash
    git submodule init
    git submodule update
    ```

5. Configure the git environment
 
   ```bash
   # Keep repo and submodule pushes synchronized
   git config push.recurseSubmodules on-demand
   
   # Track submodule master branch
   cd data
   git checkout master
    ```

## Notes
There is an issue with `yarn` and `node_modules` when the application is built by the packager. Please use `npm` as dependencies manager.

If you want to generate Angular components with Angular-cli , you **MUST** install `@angular/cli` in npm global context.
Please follow [Angular-cli documentation](https://github.com/angular/angular-cli) if you had installed a previous version of `angular-cli`.

``` bash
npm install -g @angular/cli
```

Hot reload only pertains to the renderer process. The main electron process is not able to be hot reloaded, only restarted.

Angular 12.x CLI needs Node 11 or later to work correctly.

## To build for development

- **in a terminal window** -> npm start

Voila! You can use your Angular + Electron app in a local development environment with hot reload!

The application code is managed by `app/main.ts`. In this sample, the app runs with a simple Angular App (http://localhost:4200), and an Electron window. \
The Angular component contains an example of Electron and NodeJS native lib import. \
You can disable "Developer Tools" by commenting `win.webContents.openDevTools();` in `app/main.ts`.

## Project structure
The application implements the Electron's [two package.json structure](https://www.electron.build/tutorials/two-package-structure). 
In this way, only dependencies within `app/package.json` file will be bundled into final electron bundle. 

|Folder|Description|
| ---- | ---- |
| app | Electron main process folder (NodeJS) |
| src | Electron renderer process folder (Web / Angular) |

## Use Electron / NodeJS libraries

3rd party libraries used in electron's main process (like an ORM) have to be added in `dependencies` of `app/package.json`.
This sample project runs in both modes (web and electron). To make this work, **you have to import your dependencies the right way**. \

## Use "web" 3rd party libraries (like angular, material, bootstrap, ...)

3rd party libraries used in electron's renderer process (like angular) have to be added in `dependencies` of `package.json`. \
Please check `providers/electron.service.ts` to watch how conditional import of libraries has to be done when using NodeJS / 3rd party libraries in renderer context (i.e. Angular).

## Add a dependency with ng-add

You may encounter some difficulties with `ng-add` because this project doesn't use the defaults `@angular-builders`. \
For example you can find [here](HOW_TO.md) how to install Angular-Material with `ng-add`.

## Browser mode
_NOT CURRENTLY SUPPORTED_

Maybe you only want to execute the application in the browser with hot reload? Just run `npm run ng:serve:web`.

## Included Commands

|Command|Description|
| ---- | ---- |
|`npm run ng:serve`| Execute the app in the browser |
|`npm run build`| Build the app. Your built files are in the /dist folder. |
|`npm run build:prod`| Build the app with Angular aot. Your built files are in the /dist folder. |
|`npm run electron:local`| Builds your application and start electron
|`npm run electron:build`| Builds your application and creates an app consumable based on your operating system |

**Your application is optimised. Only /dist folder and NodeJS dependencies are included in the final bundle.**

## You want to use a specific lib (like rxjs) in electron main thread ?

YES! You can do it! Just by importing your library in npm dependencies section of `app/package.json` with `npm install --save XXXXX`. \
It will be loaded by electron during build phase and added to your final bundle. \
Then use your library by importing it in `app/main.ts` file. Quite simple, isn't it?

## E2E Testing

E2E Test scripts can be found in `e2e` folder.

|Command|Description|
| ---- | ---- |
|`npm run e2e`| Execute end to end tests |

Note: To make it work behind a proxy, you can add this proxy exception in your terminal  
`export {no_proxy,NO_PROXY}="127.0.0.1,localhost"`

## Debug with VsCode

[VsCode](https://code.visualstudio.com/) debug configuration is available! In order to use it, you need the extension [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome).

Then set some breakpoints in your application's source code.

Finally from VsCode press **Ctrl+Shift+D** and select **Application Debug** and press **F5**.

Please note that Hot reload is only available in Renderer process.

[app-logo]: https://github.com/dent-table/dent-table/blob/master/src/assets/icons/favicon.png
[maintained-badge]: https://img.shields.io/badge/maintained-yes-brightgreen
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[license]: https://github.com/dent-table/dent-table/blob/master/LICENSE.md

[build]: https://github.com/dent-table/dent-table-xxx/actions/workflows/build_release.yml
[build-badge]: https://github.com/dent-table/dent-table-xxx/actions/workflows/build_release.yml/badge.svg?branch=v1.0.0-beta.13

[github-watch-badge]: https://img.shields.io/github/watchers/dent-table/dent-table.svg?style=social
[github-watch]: https://github.com/dent-table/dent-table/watchers
[github-star-badge]: https://img.shields.io/github/stars/dent-table/dent-table.svg?style=social
[github-star]: https://github.com/dent-table/dent-table/stargazers
