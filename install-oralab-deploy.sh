#!/bin/sh
echo "### installing deploy-orlab scripts ###"

echo "## creating deploy-orlab-base.sh ..."
cat << 'EOF' >  deploy-orlab-base.sh
#!/bin/sh
dst=$1
local_base_path=$2
service_name=$3
initd_name=$4

echo "## removing files from server ..."
ssh ${dst} "rm -fr /home/pi/${service_name}/db-* && rm -fr /home/pi/${service_name}/lib && rm -fr /home/pi/${service_name}/staticResources"
echo "## updating db ..."
scp -r ${local_base_path}/db-*  ${dst}:/home/pi/${service_name}
echo "## updating libs jars ..."
scp -r ${local_base_path}/target/resources  ${dst}:/home/pi/${service_name}/lib
echo "## updating staticResources ..."
scp -r ${local_base_path}/staticResources/  ${dst}:/home/pi/${service_name}/staticResources
echo "## restarting service ${service_name} ..."
ssh ${dst} "/etc/init.d/${initd_name} restart"
echo "## ..done"
EOF

chmod +x deploy-orlab-base.sh


echo "## creating deploy-orlab-vo.sh ..."
cat << 'EOF' > deploy-orlab-vo.sh
#!/bin/sh
./deploy-orlab-base.sh "pi@orlab.local" "./OpenRobertaServer" "OpenRoberta-VO" "openrobertalab-vo"
EOF

chmod +x deploy-orlab-vo.sh


echo "## ... done"
echo "## usage to deploy: 
	in openroberta directory use command: 
	./deploy-orlab-vo.sh"
