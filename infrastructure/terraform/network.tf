resource "oci_core_vcn" "main" {
  compartment_id = var.oci_compartment_ocid
  display_name   = "card-games-vcn"
  cidr_blocks    = [var.vcn_cidr]
  dns_label      = "cardgames"
}

resource "oci_core_internet_gateway" "main" {
  compartment_id = var.oci_compartment_ocid
  vcn_id         = oci_core_vcn.main.id
  display_name   = "card-games-igw"
  enabled        = true
}

resource "oci_core_route_table" "main" {
  compartment_id = var.oci_compartment_ocid
  vcn_id         = oci_core_vcn.main.id
  display_name   = "card-games-rt"

  route_rules {
    network_entity_id = oci_core_internet_gateway.main.id
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
  }
}

resource "oci_core_subnet" "public" {
  compartment_id             = var.oci_compartment_ocid
  vcn_id                     = oci_core_vcn.main.id
  display_name               = "card-games-public-subnet"
  cidr_block                 = var.subnet_cidr
  dns_label                  = "public"
  route_table_id             = oci_core_route_table.main.id
  security_list_ids          = [oci_core_security_list.main.id]
  prohibit_public_ip_on_vnic = false
}
