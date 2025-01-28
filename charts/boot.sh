#!/bin/bash
set -e

# Path: open-politics/charts/boot.sh

# 1. Apply Gateway API
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.1.0/standard-install.yaml

# 2. Define GatewayClass and Gateway
cat <<EOF | kubectl apply -f -
---
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata:
  name: kong
  annotations:
    konghq.com/gatewayclass-unmanaged: 'true'

spec:
  controllerName: konghq.com/kic-gateway-controller
---
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: kong
spec:
  gatewayClassName: kong
  listeners:
  - name: proxy
    port: 80
    protocol: HTTP
    allowedRoutes:
      namespaces:
        from: All
EOF

# 3. Add Helm repositories (if not already added)
helm repo add jetstack https://charts.jetstack.io || true
helm repo add kong https://charts.konghq.com || true
helm repo update

# 4. Create necessary namespaces
kubectl create namespace cert-manager || true
kubectl create namespace kong || true
kubectl create namespace open-politics || true

# 5. Install cert-manager using Helm
helm install \
  cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.16.2 \
  --set crds.enabled=true \
  --set global.leaderElection.namespace=cert-manager || true

# 6. Install Kong using Helm
helm install kong kong/kong --namespace kong --create-namespace || true

# 7. Install Open Politics Webapp using Helm
helm install open-politics open-politics-webapp --namespace open-politics --create-namespace || true

# 8. Export PROXY_IP and test
PROXY_IP=$(kubectl get svc --namespace kong kong-kong-proxy -o jsonpath='{.status.loadBalancer.ingress[0].ip}' || true)

if [ -z "$PROXY_IP" ]; then
  echo "PROXY_IP not found. Ensure the Kong proxy service has an external IP."
else
  echo "Proxy IP: $PROXY_IP"
  curl -i http://$PROXY_IP
fi