terraform {
  required_version = ">= 1.7"

  backend "s3" {
    bucket = "card-games-terraform-state"
    key    = "terraform.tfstate"
    region = "uk-london-1"

    # OCI S3-compatible object storage — credentials and endpoint in backend.hcl
    skip_credentials_validation = true
    skip_region_validation      = true
    skip_metadata_api_check     = true
    force_path_style            = true
  }

  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 6.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "oci" {
  tenancy_ocid     = var.oci_tenancy_ocid
  user_ocid        = var.oci_user_ocid
  fingerprint      = var.oci_fingerprint
  private_key_path = var.oci_private_key_path
  region           = var.oci_region
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}
