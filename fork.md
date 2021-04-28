# How to Fork Your Own Project on Github

Steps on how to create `fork-repo` from your own `original-repo`

### On Github.com
1. Create a new empty `fork-repo` repository on Github

### On local
2. Clone `fork-repo`

```bash
git clone git://github.com/<YOUR_USERNAME>/fork-repo.git
```

3. Add an upstream remote pointing to `original-repo`

```bash
cd fork-repo
git remote add upstream git://github.com/<YOUR_USERNAME>/original-repo.git
```

4. Pull from original-repo

```bash
git pull upstream master
```

5. Push to fork-repo

```bash
git push origin master
```


### Sync `fork-repo`
With command line:

```bash
cd fork-repo
git fetch upstream
git merge upstream/master
git push origin master
```
With IDE:
1. Fetch updates from upstream (and origin) `Git` -> `Fetch`
2. Merge upstream main into local main: `Git` -> `Branches` -> `upstream/master` -> `Merge into Current`
3. Push new commits to origin: `Git` -> `Push...` 

### Push an update to `original-repo`
1. Create a changelist with all the changes to push
2. Commit changes
3. Push changes **to a new branch** on upstream
    - `Git` -> `Push`
    - Change the destination from `upstream:master` to `upstream:<NEW_BRANCH_NAME>`
    - Confirm the step above by checking there is a little badge `New` next to the new branch name
    - Click `Push`
4. On github.com you should see the new branch and made a pull request
