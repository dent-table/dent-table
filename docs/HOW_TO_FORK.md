# How to Fork dent-table
`dent-table` is the master project containing general codebase for all customer specific variants.

If you want to create a new customer variant you'll have to:

 1. Fork [dent-table-sqlite](https://github.com/dent-table/dent-table-sqlite) [➡️](#1-fork-dent-table-sqlite)
 1. Fork `dent-table` master repo (upsteram) to a new `dent-table-xxx` repository [➡️](#2-fork-dent-table-to-a-new-dent-table-xxx-repository)
 1. Add `dent-table-xxx-sqlite` as `dent-table-xxx` git submodule [](#3-add-dent-table-xxx-sqlite-as-dent-table-xxx-git-submodule)
 1. Push dent-table-xxx to github.com [➡️](#4-push-dent-table-xxx-to-githubcom)
 1. Configure git environment [➡️](#5-configure-git-environment)
 1. Apply customer modifications [➡️](#6-apply-customer-modifications)

## 1. Fork dent-table-sqlite
[dent-table-sqlite](https://github.com/dent-table/dent-table-sqlite) data library follow the same "shared main codebase > forks" architecture as the master project `dent-table`.

So, same as we'll do soon for the master project, we have to fork it.

### On github.com
**1.** Create a new empty `dent-table-xxx-sqlite` repository on GitHub

### On local
**2.** Clone `dent-table-xxx-sqlite`

```bash
git clone https://github.com/dent-table/dent-table-xxx-sqlite.git dent-table-xxx-sqlite
```

**3.** Add an upstream remote pointing to `dent-table-sqlite`

```bash
cd dent-table-xxx-sqlite
git remote add upstream https://github.com/dent-table/dent-table-sqlite.git
```

**4.** Pull from master `dent-table-sqlite`

```bash
git pull upstream master
```

**5.** Push to `dent-table-xxx-sqlite`

```bash
git push origin master
```

## 2. Fork `dent-table` to a new `dent-table-xxx` repository
Steps on how to create `dent-table-xxx` fork from `dent-table` master upstream.

Note: **If you are cloning an existing `dent-table-xxx` fork** (instead of make a brand-new fork),
you have to skip step `2.1`.

### On github.com
**1.** Create a new empty `dent-table-xxx` repository on GitHub

### On local
**2.** Clone `dent-table-xxx`

```bash
git clone https://github.com/dent-table/dent-table-xxx.git dent-table-xxx
```

**3.** Add an upstream remote pointing to `dent-table`

```bash
cd dent-table-xxx
git remote add upstream https://github.com/dent-table/dent-table.git
```

**4.** Pull from master `dent-table`

```bash
git pull upstream master
```

⚠️ **DON'T push yet changes to `dent-table-xxx`!** First, we have to add the `dent-table-xxx-sqlite` submodule.  

## 3. Add `dent-table-xxx-sqlite` as `dent-table-xxx` git submodule
`dent-table` main repo (cloned in the paragraph `2`) comes out with `dent-table-sqlite` configured as data submodule.
We have to change it pointing to our `dent-table-xxx-sqlite` repo (forked on paragraph `1`). 
Then, we have to pull down the submodule.

Note: **If you are cloning an existing `dent-table-xxx` fork** (instead of make a brand-new fork),
you have to skip steps `3.1` and `3.2`.

**1.** Point data submodule url to `dent-table-xxx-sqlite`

In `dent-table-xxx` root folder there should be a `.gitmodules` file, with following content:

```git
[submodule "data"]
  path = data
  url = https://github.com/dent-table/dent-table-sqlite.git
  branch = master
```

Change `url` to point our `dent-table-xxx-sqlite` repo:

```
url = https://github.com/dent-table/dent-table-xxx-sqlite.git
```

**2.** Commit the change on `dent-table-xxx`

```bash
# from dent-table-xxx folder
git commit -am 'chore: add data module'
```

**3.** Initialize the submodule `dent-table-xxx-sqlite`

```bash
git submodule init
```

**4.** Pull down from the submodule
```bash
git submodule update
```

## 4. Push `dent-table-xxx` to github.com
Now, we are ready to push the new fork to github.com.

Simply run:

```bash
git push origin master
```

_Note: if you are cloning an existing `dent-table-xxx` fork (instead of make a brand-new fork),
this step could be not necessary. But hey! run it anyway, a little push doesn't hurt anyone_ 😉.

## 5. Configure git environment
Git environment configurations, like project and data upstreams (and other configurations), are stored **locally** into `.git` folder.

So, each time we fork (or clone) the project we lost them, and we have to reconfigure them.

**1.** Keep repo and submodule pushes synchronized

**This step is really important!** Suppose you have made commit on both main repo and data submodule. 
If you push main repo commits **before** submodule commits the repo might get messed up (because main repo now references to a submodule commit not yet pushed).

So, the following command configure git to always push together main repo commits and submodule commits.

```bash
git config push.recurseSubmodules on-demand
```

**2.** Track submodule master branch

When git initialize the submodule (step `3.3`), puts it to a _detached HEAD_ state (i.e. submodule HEAD refers to a specific commit instead of to a tracking branch).
So, any changes you make on master branch aren't being tracked well.

To solve, we have to go into data submodule and check out a branch to work on (i.e. the master branch).

```bash
cd data
git checkout master
```

**3.** Add `dent-table-sqlite` upstream to submodule.

When we pull down the data submodule, git doesn't configure its upstream (i.e. `dent-table-sqlite`) is not configured. 
We have to re-add it manually. 
```bash
# always from data folder
git remote add upstream https://github.com/dent-table/dent-table-sqlite.git
```

## 6. Apply customer modifications
DONE! The fork is now correctly configured and ready for customer-specific modifications.

As starting point, **search for all the comments starting with:**
```
TODO(fork): 
```
**as they highlight the parts of code that forks should change with customer-specific requests.**

If a comment ends with `(SEE GUIDELINES)`, you can find a more detailed description into the `FORK_GUIDELINES.md` doc file.
Simply search for a paragraph named as the comment.

NOTE: there are two `FORK_GUIDELINES.md` files: one into the master project (into `docs` folder) and another into the data submodule!

NOTE 2: remember that not all comments starts with `//`. 
For example, html comments are of form `<!-- COMMENT -->`.

## Pull updates from upstreams
If you want, at some point, pull down updates from the shared codebase (i.e. `dent-table`),
**first pull updates from submodule, then from main repo**:

**1.** Pull updates from submodule upstream
```bash
cd data
git fetch upstream
git merge upstream/master
```

**2.** Commit main repo 

Commands above will result to a new commit (caused by `git merge`) added to data submodule. 
Main repo have updated submodule reference to refer to this new commit.
You can see it running `git status` from main repo folder. 


```bash
cd .. # go back to the main repo folder
git status
```

In the output, you  should see an uncommitted change, something like:

```bash
> git status
On branch master
Your branch is up to date with 'origin/master'.

  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   data (new commits)  # <--- uncommited change (in red)
```

So, before to pull updates from main repo upstream we have to commit this update.

```bash
# always from main repo folder
git commit -am "chore(data): version bump"
```

**3.** Pull updates from main repo upstream

Now we can safely update the main repo:

```bash
# always from main repo folder
git fetch upstream
git merge upstream/master
```

Note: if a conflict with `data` file appears during the merge, **don't accept change from upstream**.  
Indeed, `data` file that comes from upstream contains a reference to a commit form upstream data submodule (i.e. `dent-table-sqlite`) that doesn't exist on our fork submodule (i.e. `dent-table-xxx-sqlite`).
So, we have to leave untouched our `data` file (i.e. the one we have committed in step `3`).

## Delete a submodule
If you made some mistake on the submodule and want to delete it and recreate, currently Git provides no standard interface to delete a submodule. To remove a submodule called mymodule you need to:

```bash
git submodule deinit -f mymodule
rm -rf .git/modules/mymodule
git rm -f mymodule
```

Then, follow again this guide to add the submodule again.
