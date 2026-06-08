# Infrastructure

Terraform config to provision the production environment on Oracle Cloud and Cloudflare. Runs locally — no CI required.

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.7
- [OCI CLI](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm) (for initial key setup and AD lookup)
- A Tailscale account
- A Cloudflare account with `playcards.games` added as a zone

## One-time credential setup

### 1. OCI API keys

```bash
oci setup config
```

Follow the prompts. This creates `~/.oci/config` with your `tenancy_ocid`, `user_ocid`, `fingerprint`, and key file path — copy these into `terraform.tfvars`.

To find your availability domain name:

```bash
oci iam availability-domain list --compartment-id <tenancy_ocid>
```

Copy the full `name` value from the output (e.g. `iAkj:UK-LONDON-1-AD-1`).

### 2. Tailscale

Two separate Tailscale credentials are needed:

**Instance auth key** (used by cloud-init to join the server to your tailnet):

Tailscale admin console → Settings → Keys → Generate auth key. Enable **Reusable**, add tag `tag:server`. Copy the key into `terraform.tfvars` as `tailscale_auth_key`.

The auth key is consumed once during cloud-init — the instance joins the tailnet and stays there via its node key indefinitely, regardless of whether the auth key itself later expires. You do not need to rotate it.

**GitHub Actions OAuth client** (allows the deploy runner to join your tailnet temporarily):

Tailscale admin console → Settings → OAuth clients → Create client. Grant `auth_keys` write scope, set tag `tag:github-actions`. Copy the client ID and secret into GitHub secrets `TAILSCALE_OAUTH_CLIENT_ID` and `TAILSCALE_OAUTH_SECRET`.

**ACL** — in the Tailscale admin console under Access Controls, allow the Actions runner to SSH to the server:

```json
{
  "tagOwners": {
    "tag:server":         ["your@email.com"],
    "tag:github-actions": ["your@email.com"]
  },
  "acls": [
    { "action": "accept", "src": ["tag:github-actions"], "dst": ["tag:server:22"] }
  ]
}
```

### 3. Cloudflare

Create an API token scoped to `playcards.games` with the following permissions:

- **Zone: DNS: Edit** — DNS records
- **Zone: Zone Settings: Edit** — SSL mode (`strict`)

The zone ID is on the domain's Overview page in the Cloudflare dashboard.

## Provisioning

### 1. Create the state bucket

Terraform state is stored in OCI Object Storage. Create the bucket before running `terraform init` (it can't manage its own state bucket):

```bash
oci os bucket create \
  --compartment-id <tenancy_ocid> \
  --name card-games-terraform-state \
  --versioning Enabled
```

Versioning is recommended so previous state files can be recovered if state becomes corrupted.

### 2. Configure backend

```bash
cp backend.hcl.example backend.hcl
# fill in your namespace
```

Find your namespace:

```bash
oci os ns get
```

Authentication uses the same OCI API key configured in step 1 — no additional credentials needed.

### 3. Apply

```bash
cp terraform.tfvars.example terraform.tfvars
# fill in all values

terraform init -backend-config=backend.hcl
terraform plan
terraform apply
```

OCI A1.Flex always-free capacity is shared and can occasionally fail with *Out of host capacity*. If this happens, wait 5–30 minutes and retry, or try a different availability domain.

## Post-apply steps

Cloud-init takes 3–5 minutes to complete. The instance joins Tailscale automatically — once it appears in the [Tailscale admin console](https://login.tailscale.com/admin/machines), copy its Tailscale IP.

Verify cloud-init finished:

```bash
ssh ubuntu@<tailscale-ip> cloud-init status
```

Then add the remaining GitHub Actions secrets (see [docs/deployment.md](../docs/deployment.md) for the full list).

## Updating infrastructure

Edit the relevant `.tf` files, then:

```bash
terraform plan   # review changes
terraform apply
```

Terraform state is stored remotely in the OCI Object Storage bucket.

## Destroying

```bash
terraform destroy
```

This removes all OCI and Cloudflare resources. The Tailscale node will linger in the admin console until it expires or is manually removed.
