resource "oci_core_security_list" "main" {
  compartment_id = var.oci_compartment_ocid
  vcn_id         = oci_core_vcn.main.id
  display_name   = "card-games-security-list"

  # HTTP/HTTPS ingress is handled by the web security group (Cloudflare IPs only).
  # OCI evaluates security list rules and security group rules with OR logic, so the
  # security list must not have open ingress rules or they would bypass the security group.

  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
    stateless   = false
  }
}

data "cloudflare_ip_ranges" "current" {}

resource "oci_core_network_security_group" "web" {
  compartment_id = var.oci_compartment_ocid
  vcn_id         = oci_core_vcn.main.id
  display_name   = "card-games-web-sg"
}

resource "oci_core_network_security_group_security_rule" "cloudflare_ingress" {
  for_each = {
    for combo in setproduct(
      tolist(data.cloudflare_ip_ranges.current.ipv4_cidr_blocks),
      [80, 443]
    ) : "${combo[0]}-${combo[1]}" => {
      cidr = combo[0]
      port = combo[1]
    }
  }

  network_security_group_id = oci_core_network_security_group.web.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source                    = each.value.cidr
  source_type               = "CIDR_BLOCK"
  stateless                 = false

  tcp_options {
    destination_port_range {
      min = each.value.port
      max = each.value.port
    }
  }
}
