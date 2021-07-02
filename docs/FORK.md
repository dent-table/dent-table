# How to Fork dent-table
`dent-table` is the master project containing general codebase for all customer specific variants.

If you want to create a new customer variant you'll have to:
 1. fork `dent-table` master repo (upsteram) to a new `dent-table-xxx` repository [➡️](#1-fork-dent-table-master-repo-upsteram-to-a-new-dent-table-xxx-repository)
 1. fork data, if necessary, from [dent-table-sqlite](https://github.com/dent-table/dent-table-sqlite)
 1. add data as `dent-table-xxx` git submodule
 1. apply custom modifications

**Note**: the codebase leaves some pieces of code (referred to `dent-table-car`) as example of implementation.
**Comments starting with:**
```javascript
// TODO(fork): 
``` 
**highlight the parts of code that forks should change with customer-specific requests.**

## 1. fork `dent-table` master repo (upsteram) to a new `dent-table-xxx` repository

Steps on how to create `dent-table-xxx` fork from `dent-table` master upstream.

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
