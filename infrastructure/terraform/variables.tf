variable "oci_tenancy_ocid" {
  type        = string
  description = "OCID of the OCI tenancy"
}

variable "oci_user_ocid" {
  type        = string
  description = "OCID of the OCI user"
}

variable "oci_fingerprint" {
  type        = string
  description = "API key fingerprint"
}

variable "oci_private_key_path" {
  type        = string
  description = "Path to the OCI API signing private key (PEM format)"
}

variable "oci_region" {
  type        = string
  description = "OCI region identifier"
  default     = "uk-london-1"
}

variable "oci_availability_domain" {
  type        = string
  description = "Full availability domain name, e.g. iAkj:UK-LONDON-1-AD-1"
}

variable "oci_compartment_ocid" {
  type        = string
  description = "OCID of the compartment to create resources in (use tenancy OCID for root)"
}

variable "vcn_cidr" {
  type        = string
  description = "CIDR block for the VCN"
  default     = "10.0.0.0/16"
}

variable "subnet_cidr" {
  type        = string
  description = "CIDR block for the public subnet (must be within vcn_cidr)"
  default     = "10.0.1.0/24"
}

variable "cloudflare_api_token" {
  type      = string
  sensitive = true
  description = "Cloudflare API token with Zone:DNS:Edit permission"
}

variable "cloudflare_zone_id" {
  type        = string
  description = "Cloudflare zone ID for the domain (found on the domain's Overview page)"
}

variable "domain" {
  type    = string
  default = "playcards.games"
}

variable "instance_ocpus" {
  type        = number
  description = "Number of OCPUs for the compute instance"
  default     = 2
}

variable "instance_memory_in_gbs" {
  type        = number
  description = "Memory in GB for the compute instance"
  default     = 4
}

variable "tailscale_auth_key" {
  type        = string
  sensitive   = true
  description = "Reusable Tailscale auth key tagged tag:server, used by cloud-init to join the instance to your tailnet"
}
