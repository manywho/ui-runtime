# 1 add sub-repo's remote
git remote add -f ui-vendor git@github.com:manywho/ui-vendor.git
# 2 subtree merge the changes
git pull -s subtree -Xsubtree=ui-vendor ui-vendor develop --allow-unrelated-histories
# 3 remove sub-repo's remote again
git remote rm ui-vendor
