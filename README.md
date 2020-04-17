# Flow Runtime UI

> A browser-based framework for running applications built using the [Boomi Flow](https://boomi.com/platform/flow/) platform.

## Installing dependencies

If dependencies have not been installed yet, install them in the top level 
monorepo `ui-runtime` and in each of the subrepos (`ui-core`, `ui-bootstrap`, ...)
with:

```shell script
# top level monorepo
npm install

# for each subrepo
cd <subrepo>
npm install
```

## Development

### Run `ui-runtime` in development mode

```shell script
npm start
```
Optional arguments:

* `--env.cdnurl (default: http://localhost:3000)`
* `--env.platformuri (default: https://development.manywho.net)`

### Dev Server

The dev server will run at http://localhost:3000

Flows can be accessed with the same structure of url as they run in production. 

Eg. `http://localhost:3000/<TENANT_ID>/play/default?flow-id=<FLOW_ID>&flow-version-id=<FLOW_VERSION_ID>`

### List of files served by the dev server

To see the list with links to all files served by the webpack dev server go to:

```shell script
http://localhost:3000/webpack-dev-server
```

## Tests

To run tests on all subrepos use:

```shell script
npm test
```

To run tests on individual subrepos use:

```shell script
# ui-bootstrap
npm run test:bootstrap

# ui-core
npm run test:core

# ui-offline
npm run test:offline
```

All listed commands are defined in the top-level `package.json` and should be 
executed from the top-level directory. 

Other subrepos don't have/need tests because they are either just HTML, CSS or 
3rd party scripts.

## Code linting

To run code linting on all subrepos use:

```shell script
npm run lint
```

To run test linting on all subrepos use:

```shell script
npm run lint:test
```

To run code linting on individual subrepos use:

```shell script
# ui-bootstrap
npm run lint:bootstrap

# ui-core
npm run lint:core

# ui-offline
npm run lint:offline
```

To run test linting on individual subrepos use:

```shell script
# ui-bootstrap
npm run lint:bootstrap:test

# ui-core
npm run lint:core:test

# ui-offline
npm run lint:offline:test
```

All listed commands are defined in the top-level `package.json` and should be 
executed from the top-level directory. 

Other subrepos don't have/need linting because they are either just HTML, CSS or 
3rd party scripts.

## Style linting

To run style linting on all subrepos use:

```shell script
npm run stylelint
```

To run style linting on individual subrepos use:

```shell script
# ui-bootstrap
npm run lint:bootstrap

# ui-core
npm run lint:offline

# ui-offline
npm run lint:themes
```

All listed commands are defined in the top-level `package.json` and should be 
executed from the top-level directory.

Other subrepos don't have/need linting because they don't contain any styles.

## Production

### Build `ui-runtime` for production

```shell script
# define the PACKAGE_VERSION:
export PACKAGE_VERSION=x.y.z

# run the build task with required arguments:
npm run build -- --env.cdnurl=<cdnurl> --env.platformuri=<platformuri> --env.tenant=<tenant> --env.player=<player>
```

Required arguments:
- `--env.cdnurl` (ex.: `https://cdnjs.cloudflare.com`)
- `--env.platformuri` (ex.: `https://development.manywho.net`)
- `--env.tenant`
- `--env.player`

### Change the build output directory

By default all files will be emitted into the `runtime_build` directory. 

To change the default build output directory you can edit the `repoPaths` 
object in `config/paths.js`.

To change the default build output directory "on the fly" pass a custom output 
directory via the optional `--env.build` argument

```shell script
npm run build -- --env.cdnurl=<cdnurl> ... --env.build=<output_dir>
```

### Show the analysis of the emitted packages

```shell script
npm run build -- --env.cdnurl=<cdnurl> ... --env.analyse
```

Note: There is no need to assign any value to the `--env.analyse` argument.

## Subrepos

### How to update the code of an existing subrepo manually

Until we fully switch over to the new `ui-runtime` monorepo, from time to time 
it will be necessary to update the code of the subrepos to include any changes 
and new code from their original/standalone counterparts.

```shell script
# 1 add the remote (if it was removed)
git remote add -f <subrepo> git@github.com:manywho/<subrepo>.git

# 2 subtree merge the changes
git pull -s subtree -Xsubtree=<subrepo> <subrepo> develop --allow-unrelated-histories

# 3 remove subrepo's remote (optional)
git remote rm <subrepo>
```

Example using `ui-vendor`:

```shell script
# 1 add the remote (if it was removed)
git remote add -f ui-vendor git@github.com:manywho/ui-vendor.git

# 2 subtree merge the changes
git pull -s subtree -Xsubtree=ui-vendor ui-vendor develop --allow-unrelated-histories

# 3 remove subrepo's remote (optional)
git remote rm ui-vendor
```

It is recommended to do the updates in a new feature branch (branched off 
of `ui-runtime/develop`) so the original `ui-runtime/develop` is not botched if 
something goes awry.

During the update there might be some conflicts, fix those and finish the update
with a commit.

### How to update the subrepo code with an update scripts

To make the process of updating a little bit easier there are several shell 
scripts (one for each subrepo) that will perform the needed update steps 
automatically.

The available scripts are:
```
update-ui-bootstrap.sh
update-ui-core
update-ui-html5.sh
update-ui-offline.sh
update-ui-vendor.sh
```

To perform an update just execute the script(s) for the required subrepo(s). 

During the update there might be some conflicts, fix those and finish the update
with a commit and finally push the commit.

### How to add a subrepo

Currently all required subrepos have been added so this section is optional.

However, if down the line a new subrepo needs to be added you can do this with 
the following set of commands:

```shell script
# 1 add the remote
git remote add -f <subrepo> git@github.com:manywho/<subrepo>.git

# 2 subtree merge the new subrepo
git merge -s ours --no-commit --allow-unrelated-histories <subrepo>/develop
git read-tree --prefix=<subrepo>/ -u <subrepo>/develop
git commit -m "Subtree merge of <subrepo>"

# 3 remove subrepo's remote (optional)
git remote rm <subrepo>
```

Example using `ui-vendor`:

```shell script
# 1 add the remote
git remote add -f ui-vendor git@github.com:manywho/ui-vendor.git

# 2 subtree merge the new subrepo
git merge -s ours --no-commit --allow-unrelated-histories ui-vendor/develop
git read-tree --prefix=ui-vendor/ -u ui-vendor/develop
git commit -m "Subtree merge of ui-vendor"

# 3 remove subrepo's remote (optional)
git remote rm ui-vendor
```

This will add the new subrepo as a subfolder within `ui-runtime`.

```shell script
/ui-runtime
    /ui-bootstrap
    /ui-core
    /...
    /<subrepo>
```

The added subrepo's code will be placed within a new subfolder inside the parent 
`ui-runtime` repo. It will be managed by the parent's `.git` repo and will no 
longer have its own `.git` repo.

During the merge there might be some conflicts, fix those and finish the merge
with a commit.

When adding a new subrepo use the `develop` branch on both ends, so that
`subrepo/develop` is merged into `ui-runtime/develop`.

Optionally, this can also be done in a new feature branch (branched off 
of `ui-runtime/develop`) so the original `ui-runtime/develop` is not botched if 
something goes awry.
