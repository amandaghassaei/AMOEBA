#!/bin/sh

cd ~/Research/CBAStuff/git/dmdesign
git co master
git fetch upstream
git merge upstream/master
git push origin master
cd ~/Research/CBAStuff/git/archives/dma
git fetch origin
git merge origin/master
git subtree pull -P Web/mod/dmdesign fabpeople:people/amanda.ghassaei/dmdesign master --squash
git push origin master
