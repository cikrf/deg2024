#!/bin/bash

stunnel_check() {
  
    if [ ! -f "/opt/cprocsp/sbin/$arch/stunnel_fork" ] 
    then 
    echo "Not installed package cprocsp-stunnel, install this package from distr CSP 
    and restart hsm_connect.sh"
    exit 1
    fi 
    }
    
    
reg_HSM_prov() {
    set -e
    
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro HSM CSP$num" -add string 'Image Path' /opt/cprocsp/lib/$arch/libcspr.so
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro HSM CSP$num" -add long Type 75
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro HSM CSP$num" -add string Channel .clientk2$channel
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro HSM CSP$num" -add string Media HSMDB
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro HSM CSP$num" -add string 'Function Table Name' CPSRV_GetFunctionTable

    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro GOST R 34.10-2012 HSM CSP$num" -add string 'Image Path' /opt/cprocsp/lib/$arch/libcspr.so
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro GOST R 34.10-2012 HSM CSP$num" -add long Type 80
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro GOST R 34.10-2012 HSM CSP$num" -add string Channel .clientk2$channel
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro GOST R 34.10-2012 HSM CSP$num" -add string Media HSMDB
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro GOST R 34.10-2012 HSM CSP$num" -add string 'Function Table Name' CPSRV_GetFunctionTable

    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro GOST R 34.10-2012 Strong HSM CSP$num" -add string 'Image Path' /opt/cprocsp/lib/$arch/libcspr.so
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro GOST R 34.10-2012 Strong HSM CSP$num" -add long Type 81
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro GOST R 34.10-2012 Strong HSM CSP$num" -add string Channel .clientk2$channel
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro GOST R 34.10-2012 Strong HSM CSP$num" -add string Media HSMDB
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro GOST R 34.10-2012 Strong HSM CSP$num" -add string 'Function Table Name' CPSRV_GetFunctionTable
    
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro HSM RSA CSP$num" -add string 'Image Path' /opt/cprocsp/lib/$arch/libcspr.so
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro HSM RSA CSP$num" -add long Type 1
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro HSM RSA CSP$num" -add string Channel .clientk2$channel
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro HSM RSA CSP$num" -add string Media HSMDB
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro HSM RSA CSP$num" -add string 'Function Table Name' CPSRV_GetFunctionTable
    
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro ECDSA and AES HSM CSP$num" -add string 'Image Path' /opt/cprocsp/lib/$arch/libcspr.so
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro ECDSA and AES HSM CSP$num" -add long Type 16
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro ECDSA and AES HSM CSP$num" -add string Channel .clientk2$channel
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro ECDSA and AES HSM CSP$num" -add string Media HSMDB
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro ECDSA and AES HSM CSP$num" -add string 'Function Table Name' CPSRV_GetFunctionTable
    
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro Enhanced RSA and AES HSM CSP$num" -add string 'Image Path' /opt/cprocsp/lib/$arch/libcspr.so
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro Enhanced RSA and AES HSM CSP$num" -add long Type 24
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro Enhanced RSA and AES HSM CSP$num" -add string Channel .clientk2$channel
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro Enhanced RSA and AES HSM CSP$num" -add string Media HSMDB
    /opt/cprocsp/sbin/$arch/cpconfig -ini "\cryptography\Defaults\Provider\Crypto-Pro Enhanced RSA and AES HSM CSP$num" -add string 'Function Table Name' CPSRV_GetFunctionTable
    set +e
    }

    
    
Check_prov() {
    service cprocsp restart
    killall stunnel_fork
    /opt/cprocsp/sbin/$arch/stunnel_fork
    echo "
Registered providers:

Crypto-Pro HSM RSA CSP$num  (1)
Crypto-Pro ECDSA and AES HSM CSP$num  (16)
Crypto-Pro Enhanced RSA and AES HSM CSP$num  (24)
Crypto-Pro GOST HSM CSP$num  (75)
Crypto-Pro GOST R 34.10-2012 HSM CSP$num  (80)
Crypto-Pro GOST R 34.10-2012 Strong HSM CSP$num  (81)

Check HSM$num connect :
"
    /opt/cprocsp/bin/$arch/csptest -enum -provider "Crypto-Pro HSM CSP$num" -provtype 75 -info
    }

    
enum_cont(){
    set -e
    mkdir -p /root/cert/
    /opt/cprocsp/bin/$arch/csptestf -keys -enum -verifyc -fqcn > /tmp/tmpkeys
    cat /tmp/tmpkeys | grep '\\\\.\\*\\*' > /tmp/keys
    rm -f /tmp/tmpkeys
    keys=/tmp/keys
    sed '/./=' $keys | sed '/./N;s/\n//'
    read -p "Choice index of key K2 channel: " index
    key=`sed -n "$index"p $keys`
    read -sp "Input pincode to $key: " pin_code
    echo "$key" > /tmp/keys
    sed "s:\\\\:\\\\\\\\:g;s: :\\\\ :g" /tmp/keys > /tmp/cont
    key=`cat /tmp/cont`
    rm -f /tmp/keys
    rm -f /tmp/cont
    set +e
    }
    
    
install_certs() {
    set -e
    if [ "$key" ]; then
    echo "
$key Installing certificates"
    sh -c "/opt/cprocsp/bin/$arch/csptest -keys -check -cont $key -password \"$pin_code\" "
    sh -c "/opt/cprocsp/bin/$arch/csptest -keys -cont $key -saveext /root/cert/HSMroot$i.cer" > /dev/null
    sh -c "/opt/cprocsp/bin/$arch/certmgr -inst -cont $key"
    sh -c "/opt/cprocsp/bin/$arch/certmgr -exp -cont $key -dest /root/cert/HSMuser$i.cer" > /dev/null
    sh -c "/opt/cprocsp/bin/$arch/certmgr -inst -store mroot -file /root/cert/HSMroot$i.cer" > /dev/null
    rm -f /root/cert/HSMroot$i.cer
    rm -f /tmp/keys
    else
    echo "Not specifid key K2-channel, use -c <cont name>"
    exit 1
    fi
    set +e
    }

make_stunnel_conf() {
    set -e
    mkdir -p /etc/opt/cprocsp/stunnel
    if [ -e /etc/opt/cprocsp/stunnel/stunnel.conf ]; then 
       mv -f /etc/opt/cprocsp/stunnel/stunnel.conf /etc/opt/cprocsp/stunnel/stunnel.conf.old
    fi
    cat <<-END >> /etc/opt/cprocsp/stunnel/stunnel.conf
setuid = root
setgid = root
pid = /var/opt/cprocsp/tmp/stunnel-K2.pid
socket = r:TCP_NODELAY=1
debug = 0
output=/var/log/stunnel-K2.log
for_hsm = yes

END
    set +e
    }

make_stunnel_channel() {    
    set -e
    echo "[clientk2$channel]" >> /etc/opt/cprocsp/stunnel/stunnel.conf
    echo "client = yes" >> /etc/opt/cprocsp/stunnel/stunnel.conf
    echo "accept = /var/opt/cprocsp/tmp/.clientk2$channel" >> /etc/opt/cprocsp/stunnel/stunnel.conf
    echo "connect = $ipaddress:1501" >> /etc/opt/cprocsp/stunnel/stunnel.conf
    echo "cert = /root/cert/HSMuser$i.cer" >> /etc/opt/cprocsp/stunnel/stunnel.conf
    if [ -z "$pin_code" ]; then 
        echo "#pincode =" >> /etc/opt/cprocsp/stunnel/stunnel.conf
        else
        echo "pincode =$pin_code" >> /etc/opt/cprocsp/stunnel/stunnel.conf
        fi
    echo "" >> /etc/opt/cprocsp/stunnel/stunnel.conf
    set +e
    }
    
usage() {
    echo "Usage: `basename $0` -i ip_hsm -c cont_name -p pincode"
    echo "    -i    ip address of HSM"
    echo "    -c    name of container that will be used in connection to HSM"
    echo "    -p     pin_code for user container"
    echo " "
    echo "Example: sudo `basename $0` -i 192.168.26.2 -c HSMClient -p 11111111"
    exit 1
    }

checkargs() {
    if [ $OPTARG = ~ ^ -[cip]$ ]; then 
        echo "Unknown argument. Use -h for help param.
        or use hsm_connect without argument"
        exit 1
    fi            
}



if [ $# -eq 0 ]
    then 
        arch=`ls -1 /opt/cprocsp/bin/`
        stunnel_check
        echo "input HSM count (1-5):" 
        read count
        make_stunnel_conf

        for ((i = 0; i < $count; i++)) 
            do
                case $i in
                    0)    
                    num=""
                    channel=""
                    echo "Input ip-address HSM$num:"
                    read ipaddress
                    enum_cont 
                    install_certs
                    make_stunnel_channel
                    reg_HSM_prov
                    Check_prov
                    ;;
                    1)
                    num=" 01"
                    channel="a"
                    echo "Input ip-address HSM$num:"
                    read ipaddress
                    enum_cont 
                    install_certs
                    make_stunnel_channel
                    reg_HSM_prov
                    Check_prov
                    ;;
                    2)
                    num=" 02"
                    channel="b"
                    echo "Input ip-address HSM$num:"
                    read ipaddress
                    enum_cont 
                    install_certs
                    make_stunnel_channel
                    reg_HSM_prov
                    Check_prov
                    ;;
                    3)
                    num=" 03"
                    channel="c"
                    echo "Input ip-address HSM$num:"
                    read ipaddress
                    enum_cont 
                    install_certs
                    make_stunnel_channel
                    reg_HSM_prov
                    Check_prov
                    ;;
                    4)
                    num=" 04"
                    channel="d"
                    echo "Input ip-address HSM$num:"
                    read ipaddress
                    enum_cont 
                    install_certs
                    make_stunnel_channel
                    reg_HSM_prov
                    Check_prov
                    ;;
                esac
            done
    else
        arch=`ls -1 /opt/cprocsp/bin/`
        make_stunnel_conf
        while getopts "i:c:p:" opt
            do
                case $opt in 
                    i)
                    ipaddress=$OPTARG
                    ;;
                    c)
                    key=$OPTARG
                    ;;
                    p)
                    pin_code=$OPTARG
                    ;;
                    \?)
                    usage
                esac
            done
    num=""
    channel=""
    checkargs
    install_certs
    make_stunnel_channel
    reg_HSM_prov
    Check_prov
    fi
    
