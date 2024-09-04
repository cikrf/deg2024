/opt/cprocsp/bin/amd64/cryptcp -signf -detached -dir './' -dn "CN=$1" $CONT_NAME.pub_key -cert 
mv $CONT_NAME.pub_key.sgn $CONT_NAME.sig
