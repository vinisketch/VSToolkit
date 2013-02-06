#!/bin/sh

mkdir -p tmp/
git clone https://github.com/vinisketch/VSToolkit.git tmp
rm -rf lib
rm -rf examples
mv tmp/lib .
mv tmp/examples .
rm -rf tmp
