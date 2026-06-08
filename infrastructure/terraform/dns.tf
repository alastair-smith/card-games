resource "cloudflare_dns_record" "root" {
  zone_id = var.cloudflare_zone_id
  name    = "@"
  type    = "A"
  content = oci_core_instance.app.public_ip
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "www" {
  zone_id = var.cloudflare_zone_id
  name    = "www"
  type    = "CNAME"
  content = var.domain
  proxied = true
  ttl     = 1
}

resource "cloudflare_zone_setting" "ssl" {
  zone_id    = var.cloudflare_zone_id
  setting_id = "ssl"
  value      = "strict"
}
