rm -rf node_modules;
find ./ -name ".DS_Store" -depth -exec rm {} \;
source .compare_current.sh 0
npm i;