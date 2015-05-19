#!/bin/sh

cp -R ~/Research/WebApps/DMDesign ~/Projects/dma/Web/
cp -R ~/Research/WebApps/DMDesign ~/Projects/dma/Web/mod

cd ~/Projects/dma
hg addremove .
hg ci -m "deploy from script"
hg push