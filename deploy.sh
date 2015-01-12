#!/bin/sh

cp -R ~/Research/WebApps/DMDesign ~/Projects/dma/Web/

cd ~/Projects/dma
sudo hg addremove .
sudo hg ci -m "deploy"
sudo hg pull
sudo hg push