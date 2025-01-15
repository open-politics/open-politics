#!/bin/bash

# Path: open-politics/charts/setup.sh
set -e

# Update and upgrade the system
sudo apt update && sudo apt upgrade -y

# Install prerequisites
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Install Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io
sudo systemctl enable docker
sudo systemctl start docker

# Install k3s with proper kubeconfig permissions
curl -sfL https://get.k3s.io | sh -s - --write-kubeconfig-mode 644

# Wait for k3s to be ready
sleep 10

# Configure kubectl for current user
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash

# Add required Helm repositories
helm repo add jetstack https://charts.jetstack.io
helm repo add kong https://charts.konghq.com
helm repo update

# Run the boot.sh script to deploy the application
bash open-politics/charts/boot.sh