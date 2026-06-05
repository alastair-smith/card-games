resource "cloudflare_record" "root" {
  zone_id = var.cloudflare_zone_id
  name    = "@"
  type    = "A"
  value   = oci_core_instance.app.public_ip
  proxied = true
  ttl     = 1
}

resource "cloudflare_record" "www" {
  zone_id = var.cloudflare_zone_id
  name    = "www"
  type    = "CNAME"
  value   = var.domain
  proxied = true
  ttl     = 1
}

resource "cloudflare_ruleset" "www_redirect" {
  zone_id = var.cloudflare_zone_id
  name    = "www to apex redirect"
  kind    = "zone"
  phase   = "http_request_dynamic_redirect"

  rules {
    action = "redirect"
    action_parameters {
      from_value {
        status_code = 301
        target_url {
          expression = "concat(\"https://${var.domain}\", http.request.uri.path)"
        }
        preserve_query_string = true
      }
    }
    expression  = "http.host eq \"www.${var.domain}\""
    description = "Redirect www to apex domain"
    enabled     = true
  }
}

resource "cloudflare_zone_settings_override" "main" {
  zone_id = var.cloudflare_zone_id
  settings {
    ssl = "full_strict"
  }
}
