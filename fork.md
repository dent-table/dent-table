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

```bash
cd fork-repo
git fetch upstream
git merge upstream/master
git push origin master
```
