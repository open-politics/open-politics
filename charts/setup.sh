#!/bin/bash
set -e

# Path: open-politics/charts/setup.sh

# 1. Update and upgrade the system
sudo apt update && sudo apt upgrade -y

# # 2. Install prerequisites
# sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# # 3. Install Docker from Official Repository
# curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
# sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
# sudo apt update
# sudo apt install -y docker-ce docker-ce-cli containerd.io
# sudo systemctl enable docker
# sudo systemctl start docker

# 4. Install k3s with proper kubeconfig permissions
curl -sfL https://get.k3s.io | sh -s - --write-kubeconfig-mode 644

# 5. Wait for k3s to initialize
echo "Waiting for k3s to initialize..."
sleep 10

# 6. Configure kubectl for the current user
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config

# 7. Install Helm
curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash

# 8. Add required Helm repositories
helm repo add jetstack https://charts.jetstack.io
helm repo add kong https://charts.konghq.com
helm repo update

# 9. Run the boot.sh script to deploy the application
bash open-politics/charts/boot.sh