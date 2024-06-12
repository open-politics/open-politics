#!/bin/bash

# Flush existing rules
sudo iptables -F
sudo iptables -X

# Allow loopback traffic
sudo iptables -A INPUT -i lo -j ACCEPT
sudo iptables -A OUTPUT -o lo -j ACCEPT

# Allow established and related connections
sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
sudo iptables -A OUTPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Allow DNS traffic
sudo iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
sudo iptables -A INPUT -p udp --sport 53 -j ACCEPT
sudo iptables -A OUTPUT -p tcp --dport 53 -j ACCEPT
sudo iptables -A INPUT -p tcp --sport 53 -j ACCEPT

# Allow HTTP/HTTPS traffic
sudo iptables -A OUTPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A OUTPUT -p tcp --dport 443 -j ACCEPT

# Allow incoming traffic on common ports
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 5432 -j ACCEPT

# Drop all other incoming traffic
sudo iptables -P INPUT DROP
sudo iptables -P FORWARD DROP

# Allow all outgoing traffic
sudo iptables -P OUTPUT ACCEPT

# Save the iptables rules
sudo iptables-save > /etc/iptables/rules.v4

echo "Updated iptables rules to allow DNS and HTTP/HTTPS traffic."

