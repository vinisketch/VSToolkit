#!/bin/sh

rm -rf temp
mkdir temp
jscoverage --no-instrument=jsunit ../lib_debug temp
cp -R jsunit temp
cp -R gui temp

export TEST_PATH=`pwd`

echo "<html><head><title>Test</title><meta http-equiv=\"refresh\" content=\"0;url=file://$TEST_PATH/jsunit/testRunner.html?testPage=$TEST_PATH/unit/index.html&autoRun=true\" /></head><body></body></html>" > temp/index.html
open -a Safari temp/index.html
open -a Safari temp/gui/index.html