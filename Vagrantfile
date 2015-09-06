# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.box = "trusty64"

  config.vm.network "forwarded_port", guest: 6833, host: 6833

  config.vm.synced_folder \
    "~/.cache/ubuntu-14.04-apt-archives/", \
    "/var/cache/apt/archives/", \
    create: true

  config.vm.provider "virtualbox" do |vb|
  #   vb.gui = true
    vb.memory = "4096"
   end
  
  config.vm.provision "shell", inline: <<-SHELL
     sudo apt-get update
     sudo apt-get --yes install npm mongodb daemontools
     cd /vagrant
     npm install
   SHELL
end
