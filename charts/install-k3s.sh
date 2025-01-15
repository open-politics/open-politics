#!/bin/bash

# Update and upgrade the system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io
sudo systemctl enable docker
sudo systemctl start docker

# Install k3s
curl -sfL https://get.k3s.io | sh -

# Verify k3s installation
sudo k3s kubectl get nodes

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash

# Set up kubectl symlink for easier access
sudo ln -s /usr/local/bin/k3s /usr/local/bin/kubectl
