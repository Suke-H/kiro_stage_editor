variable "project" {
  type = string
}

variable "roles" {
  type = list(string)
}

variable "service_account_email" {
  type = string
}

resource "google_project_iam_member" "binding" {
  for_each = toset(var.roles)
  
  project = var.project
  role    = each.key
  member  = "serviceAccount:${var.service_account_email}"
}
