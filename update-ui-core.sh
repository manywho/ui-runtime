# 1 add sub-repo's remote
git remote add -f ui-core git@github.com:manywho/ui-core.git
# 2 subtree merge the changes
git pull -s subtree -Xsubtree=ui-core ui-core develop --allow-unrelated-histories
# 3 remove sub-repo's remote again
git remote rm ui-core
