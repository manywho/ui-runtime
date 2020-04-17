# 1 add sub-repo's remote
git remote add -f ui-bootstrap git@github.com:manywho/ui-bootstrap.git
# 2 subtree merge the changes
git pull -s subtree -Xsubtree=ui-bootstrap ui-bootstrap develop --allow-unrelated-histories
# 3 remove sub-repo's remote again
git remote rm ui-bootstrap
