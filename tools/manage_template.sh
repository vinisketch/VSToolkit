#!/bin/sh

export TARGET_FILE="template.js"
export TEMPLATE_PATH=$2
export COMPNAME_NAME=$1

export TEMP=temp_file.tmp
export TEMP_BIS=temp_file_bis.tmp

export CAR="'"

cat $TEMPLATE_PATH > $TEMP_BIS
sed -e 's/ xmlns="http:\/\/www.w3.org\/1999\/xhtml"//' -e 's/"/'$CAR'/g' $TEMP_BIS > $TEMP
rm $TEMP_BIS

echo $COMPNAME_NAME'.prototype.html_template = "' > $TEMP_BIS
cat $TEMP >> $TEMP_BIS
sed -e 's/$/\\/' $TEMP_BIS > $TEMP
echo '' > $TEMP_BIS
cat $TEMP >> $TEMP_BIS
echo '";' >> $TEMP_BIS
cat $TEMP_BIS >> $TARGET_FILE

rm $TEMP
rm $TEMP_BIS
