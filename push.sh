#!/bin/sh

rsync -r -v --exclude=".*" --exclude='node/node_modules/' ~/Research/WebApps/DMDesign/DMDesign ~/Projects/dma/Web/

cd ~/Projects/dma
hg addremove .
hg ci -m "deploy from script"
hg push