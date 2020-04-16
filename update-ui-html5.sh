# 1 add sub-repo's remote
git remote add -f ui-html5 git@github.com:manywho/ui-html5.git
# 2 subtree merge the changes
git pull -s subtree -Xsubtree=ui-html5 ui-html5 develop --allow-unrelated-histories
# 3 remove sub-repo's remote again
git remote rm ui-html5
