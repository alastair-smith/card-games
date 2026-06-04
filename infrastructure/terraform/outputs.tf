output "instance_public_ip" {
  description = "Public IP of the OCI instance (used for Cloudflare DNS and finding the Tailscale IP)"
  value       = oci_core_instance.app.public_ip
}

output "instance_id" {
  description = "OCID of the compute instance"
  value       = oci_core_instance.app.id
}
