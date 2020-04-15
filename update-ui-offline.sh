# 1 add sub-repo's remote
git remote add -f ui-offline git@github.com:manywho/ui-offline.git
# 2 subtree merge the changes
git pull -s subtree -Xsubtree=ui-offline ui-offline develop --allow-unrelated-histories
# 3 remove sub-repo's remote again
git remote rm ui-offline
