data "oci_core_images" "ubuntu_22_arm" {
  compartment_id           = var.oci_compartment_ocid
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "22.04"
  shape                    = "VM.Standard.A1.Flex"
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

resource "oci_core_instance" "app" {
  compartment_id      = var.oci_compartment_ocid
  availability_domain = var.oci_availability_domain
  display_name        = "card-games-prod"
  shape               = "VM.Standard.A1.Flex"

  shape_config {
    ocpus         = 2
    memory_in_gbs = 4
  }

  source_details {
    source_type = "image"
    source_id   = data.oci_core_images.ubuntu_22_arm.images[0].id
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.public.id
    assign_public_ip = true
    display_name     = "card-games-vnic"
    nsg_ids          = [oci_core_network_security_group.web.id]
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    user_data = base64encode(templatefile("${path.module}/cloud-init.tpl.sh", {
      tailscale_auth_key = var.tailscale_auth_key
    }))
  }

  timeouts {
    create = "60m"
  }
}
