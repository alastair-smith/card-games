resource "cloudflare_record" "root" {
  zone_id = var.cloudflare_zone_id
  name    = "@"
  type    = "A"
  value   = oci_core_instance.app.public_ip
  proxied = true
  ttl     = 1
}

resource "cloudflare_zone_settings_override" "main" {
  zone_id = var.cloudflare_zone_id
  settings {
    ssl = "full"
  }
}
