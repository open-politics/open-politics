
#! /bin/bash

helm uninstall open-politics -n open-politics

kubectl delete certificate open-politics-tls -n open-politics 

bash tls-reboot.sh

helm install open-politics helm/open-politics-webapp --namespace open-politics --create-namespace

helm upgrade open-politics helm/open-politics-webapp --namespace open-politics --install


