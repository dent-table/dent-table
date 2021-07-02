# How to Fork dent-table
`dent-table` is the master project containing general codebase for all customer specific variants.

If you want to create a new customer variant you'll have to:

 1. Fork [dent-table-sqlite](https://github.com/dent-table/dent-table-sqlite) [➡️](#1-fork-dent-table-sqlite)
 1. Fork `dent-table` master repo (upsteram) to a new `dent-table-xxx` repository [➡️](#2-fork-dent-table-to-a-new-dent-table-xxx-repository)
 1. Add `dent-table-xxx-sqlite` as `dent-table-xxx` git submodule [](#3-add-dent-table-xxx-sqlite-as-dent-table-xxx-git-submodule)
 1. Push dent-table-xxx to github.com [➡️](#4-push-dent-table-xxx-to-githubcom)
 1. Configure git environment [➡️](#5-configure-git-environment)
 1. Apply customer modifications [➡️](#6-apply-customer-modifications)

**Note**: the codebase leaves some pieces of code (referred to `dent-table-car`) as example of implementation.
**Comments starting with:**
```javascript
// TODO(fork): 
``` 
**highlight the parts of code that forks should change with customer-specific requests.**

## 1. Fork dent-table-sqlite
[dent-table-sqlite](https://github.com/dent-table/dent-table-sqlite) data library follow the same "shared main codebase > forks" architecture as the master project `dent-table`.

So, same as we'll do soon for the master project, we have to fork it.

### On github.com
1. Create a new empty `dent-table-xxx-sqlite` repository on GitHub

### On local
2. Clone `dent-table-xxx`

```bash
git clone https://github.com/dent-table/dent-table-xxx.git dent-table-xxx
```

3. Add an upstream remote pointing to `dent-table-sqlite`

```bash
cd dent-table-xxx-sqlite
git remote add upstream https://github.com/dent-table/dent-table-sqlite.git
```

4. Pull from master `dent-table-sqlite`

```bash
git pull upstream master
```

5. Push to `dent-table-xxx-sqlite`

```bash
git push origin master
```

## 2. Fork `dent-table` to a new `dent-table-xxx` repository
Steps on how to create `dent-table-xxx` fork from `dent-table` master upstream.

Note: **If you are cloning an existing `dent-table-xxx` fork** (instead of make a brand-new fork),
you have to skip step `2.1`.

### On github.com
1. Create a new empty `dent-table-xxx` repository on GitHub

### On local
2. Clone `dent-table-xxx`

```bash
git clone https://github.com/dent-table/dent-table-xxx.git dent-table-xxx
```

3. Add an upstream remote pointing to `dent-table`

```bash
cd dent-table-xxx
git remote add upstream https://github.com/dent-table/dent-table.git
```

4. Pull from master `dent-table`

```bash
git pull upstream master
```

5. Push to `dent-table-xxx`

```bash
git push origin master
```

## 3. Add `dent-table-xxx-sqlite` as `dent-table-xxx` git submodule
`dent-table` main repo (cloned in the paragraph `2`) comes out with `dent-table-sqlite` configured as data submodule.
We have to change it pointing to our `dent-table-xxx-sqlite` repo (forked on paragraph `1`). 
Then, we have to pull down the submodule.

Note: **If you are cloning an existing `dent-table-xxx` fork** (instead of make a brand-new fork),
you have to skip steps `3.1` and `3.2`.

1. Point data submodule url to `dent-table-xxx-sqlite`
In `dent-table-xxx` root folder there should be a `.gitmodules` file, with following content:

```git
[submodule "data"]
    path = data
    url = https://github.com/dent-table/dent-table-sqlite.git
```

Change `url` to point our `dent-table-xxx-sqlite` repo:

```
https://github.com/dent-table/dent-table-xxx-sqlite.git
```

2. Commit the change

```bash
git commit -am 'chore: add data module'
```

3. Initialize the submodule `dent-table-xxx-sqlite`

```bash
git submodule init
```

4. Pull down from the submodule
```bash
git submodule update
```

## 4. Push `dent-table-xxx` to github.com
Now, we'll push the new fork to github.com.

Simply run:

```bash
git push origin master
```

Note: if you are cloning an existing `dent-table-xxx` fork (instead of make a brand-new fork),
this step could be not necessary. But hey!, run it anyway, a little push doesn't hurt anyone 😉.

## 5. Configure git environment
Git environment configurations, like project and data upstreams (and other configurations), are stored **locally** into `.git` folder.

So, each time we fork (or clone) the project we lost them, and we have to reconfigure.

1. Keep repo and submodule pushes synchronized

**This step is really important!** Suppose you have made commit on both main repo and data submodule. 
If you push main repo commits **before** submodule commits the repo could mess up (because main repo is now referencing to a submodule commit not yet pushed).

So, the following command configure git to always push together main repo and submodule commits.

```bash
git config push.recurseSubmodules on-demand
```

2. Track submodule master branch

When git initialize the submodule (step `3.3`), puts it to a _detached HEAD_ state (i.e. submodule HEAD refers to a specific commit instead of to a tracking branch).
So, any changes you make on master branch aren't being tracked well.

To solve, we have to go into data submodule and check out a branch to work on (i.e. the master branch).

```bash
cd data
git checkout master
```

3. Re-add `dent-table-sqlite` upstream to submodule.
When pull down the data submodule, git doesn't configure its upstream (i.e. `dent-table-sqlite`) is not configured. We have to re-add it manually.
   
```bash
# always from data folder
git remote add upstream https://github.com/dent-table/dent-table-sqlite.git
```


## 6. Apply customer modifications
DONE! The fork is now correctly configured and ready for customer-specific modifications.

If you want, at some point, pull down updates from the shared codebase (i.e. `dent-table`), 
or from the data submodule shared codebase, simply pull them form the upstreams

```bash
git pull upstream master
```

or 

```bash
cd data
git pull upstream master
```
