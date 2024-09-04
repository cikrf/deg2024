if [ $# -eq 0 ]
    then
	export CONT_K=5
	export CONT_N=7
    else
	export CONT_K=$1
	export CONT_N=$2
fi
/opt/cprocsp/bin/amd64/csptest -passwd -newk -cont $CONT_NAME'div' -shared_reader '\\.\EPHEMERICAL\' -k $CONT_K -n $CONT_N -keyt exchange -provtype 80 -exportable
