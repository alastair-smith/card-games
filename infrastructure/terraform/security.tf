resource "oci_core_security_list" "main" {
  compartment_id = var.oci_compartment_ocid
  vcn_id         = oci_core_vcn.main.id
  display_name   = "card-games-security-list"

  # HTTP/HTTPS ingress is handled by the web NSG (Cloudflare IPs only).
  # OCI evaluates security list rules and NSG rules with OR logic, so the
  # security list must not have open ingress rules or they would bypass the NSG.

  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
    stateless   = false
  }
}
