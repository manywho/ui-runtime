# Flow Runtime UI

> A browser-based framework for running applications built using the [Boomi Flow](https://boomi.com/platform/flow/) platform.

## Development

### Run ui-runtime in development mode
```shell script
$ npm start
```

### Change the public path

All files will be served by webpack dev server from its `debug/` public path 
by default. 

To change the default public path "on the fly" pass a custom path via the 
optional `--env.assets` argument.

```shell script
$ npm start -- --env.assets=<path>
```

The value of `--env.assets` can be: `local`, `development`, `qa`, `staging` or 
`production`.

To change where each of these point edit the `publicPath` object in 
`config/paths.js`.

NOTE: The `debug.html` uses the `debug/` path to load dependencies so using any 
of the custom asset paths will break in the `debug.html`. If you still need 
the `debug.html` to work properly you will need to edit it. The file is located 
in `ui-html5/debug.html`. 

### List of all files served by the dev server

To see the list with links to all files served go to:
```shell script
http://localhost:3000/webpack-dev-server
```

## Production

### Build ui-runtime for production

```shell script
# define the PACKAGE_VERSION:
$ export PACKAGE_VERSION=x.y.z

# run the build task with required arguments:
$ npm run build -- --env.cdnurl=<cdnurl> --env.platformuri=<platformuri> --env.tenant=<tenant> --env.player=<player>
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
$ npm run build -- --env.cdnurl=<cdnurl> ... --env.build=<output_dir>
```

### Show the analysis of the emitted packages

```shell script
$ npm run build -- --env.cdnurl=<cdnurl> ... --env.analyse
```

Note: There is no need to assign any value to the `--env.analyse` argument.

## Subrepos

### Add a brand new subrepo to ui-runtime

```shell script
# 1 add the remote
$ git remote add -f <subrepo> git@github.com:manywho/<subrepo>.git

# 2 subtree merge the new subrepo
$ git merge -s ours --no-commit --allow-unrelated-histories <subrepo>/develop
$ git read-tree --prefix=<subrepo>/ -u <subrepo>/develop
$ git commit -m "Subtree merge of <subrepo>"

# 3 remove subrepo's remote (optional)
git remote rm <subrepo>
```

This will add the new subrepo as a subfolder within `ui-runtime`.
```shell script
/ui-runtime
    /ui-bootstrap
    /ui-core
    /...
    /<subrepo>
```

Added subrepo (its code) will be placed within a new subfolder inside the parent 
`ui-runtime` repo. It will be managed by the parent's `.git` repo and will no 
longer have it's own `.git` repo.

During the merge there might be some conflicts, fix those and finish the merge
with a commit.

When adding a new subrepo use the `develop` branch on both ends, so that
`subrepo/develop` is merged into `ui-runtime/develop`.

Optionally, this can also be done in a new feature branch (branched off 
of `ui-runtime/develop`) so the original `ui-runtime/develop` is not botched if 
something goes awry.

Example:
```shell script
# 1 add the remote
$ git remote add -f ui-vendor git@github.com:manywho/ui-vendor.git

# 2 subtree merge the new subrepo
$ git merge -s ours --no-commit --allow-unrelated-histories ui-vendor/develop
$ git read-tree --prefix=ui-vendor/ -u ui-vendor/develop
$ git commit -m "Subtree merge of ui-vendor"

# 3 remove subrepo's remote (optional)
git remote rm ui-vendor
```

### Update the code of an existing subrepo based on its original/standalone version

```shell script
# 1 add the remote (if it was removed)
$ git remote add -f <subrepo> git@github.com:manywho/<subrepo>.git

# 2 subtree merge the new subrepo
$ git pull -s subtree -Xsubtree=<subrepo> <subrepo> develop --allow-unrelated-histories

# 3 remove subrepo's remote (optional)
git remote rm <subrepo>
```

It is recommended to do the updates in a new feature branch (branched off 
of `ui-runtime/develop`) so the original `ui-runtime/develop` is not botched if 
something goes awry.

During the update there might be some conflicts, fix those and finish the update
with a commit.

Example:
```shell script
# 1 add the remote (if it was removed)
$ git remote add -f ui-vendor git@github.com:manywho/ui-vendor.git

# 2 update the code
$ git pull -s subtree -Xsubtree=ui-vendor ui-vendor develop --allow-unrelated-histories

# 3 remove subrepo's remote (optional)
git remote rm ui-vendor
```
