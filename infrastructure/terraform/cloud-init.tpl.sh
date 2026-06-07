#!/bin/bash
set -euo pipefail

# ---------------------------------------------------------------------------
# Docker CE (arm64)
# ---------------------------------------------------------------------------
apt-get update -qq
apt-get install -y -qq ca-certificates curl gnupg

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=arm64 signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu jammy stable" \
  > /etc/apt/sources.list.d/docker.list

apt-get update -qq
apt-get install -y -qq \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin

systemctl enable --now docker
usermod -aG docker ubuntu

# ---------------------------------------------------------------------------
# Tailscale
# ---------------------------------------------------------------------------
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up --authkey="${tailscale_auth_key}" --advertise-tags=tag:server --ssh

# ---------------------------------------------------------------------------
# Automatic OS security updates
# ---------------------------------------------------------------------------
apt-get install -y -qq unattended-upgrades
printf 'APT::Periodic::Update-Package-Lists "1";\nAPT::Periodic::Unattended-Upgrade "1";\n' \
  > /etc/apt/apt.conf.d/20auto-upgrades

# ---------------------------------------------------------------------------
# Firewall — open web ports only; SSH is via Tailscale only
# ---------------------------------------------------------------------------
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow in on tailscale0
ufw --force enable

# ---------------------------------------------------------------------------
# App directory
# ---------------------------------------------------------------------------
mkdir -p /opt/card-games
chown ubuntu:ubuntu /opt/card-games
