sudo DOMAIN=domain USERNAME=admin PASSWORD=changeThis EMAIL=jimvw@open-politics.org HASHED_PASSWORD=$(openssl passwd -apr1 $PASSWORD) docker compose -f docker-compose.traefik.yml up
