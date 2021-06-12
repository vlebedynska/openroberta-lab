#!/bin/sh
echo "## creating ssh-key ..."
echo "## set passwd (optional) ..."
mkdir ssh_key_orlab
ssh-keygen -t rsa -f ssh_key_orlab/key_orlab
echo "## let's publish the new ssh-key to our orlab server..."
echo "## use default password 'raspberry'  to connect to pi ..." 
cat ssh_key_orlab/key_orlab.pub | ssh pi@orlab.local 'cat >> .ssh/authorized_keys'
echo "## key published on raspi server. Done"
echo ""
echo "## use 'ssh-add ssh_key_orlab/key_orlab' command to add the ssh-key to your session"
echo " try it:"
ssh-add ssh_key_orlab/key_orlab
echo "## "
echo "## see loaded keys by typing 'ssh-add -l':"
ssh-add -l
echo "## well done ##"
