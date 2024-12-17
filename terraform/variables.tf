variable "project_id" {
  type        = string
  description = "GCP Project ID"
}

variable "region" {
  type        = string
  description = "GCP Region"
  default     = "asia-northeast1"
}

variable "github_repo" {
  type        = string
  description = "GitHubリポジトリ (例: user/repo)"
}

variable "artifact_registry_repo_name" {
  type        = string
  description = "Artifact Registryのリポジトリ名"
}

variable "terraform_sa_name" {
  type        = string
  description = "Terraform用サービスアカウントの名前"
  default     = "terraform-sa"
}

variable "github_actions" {
  type = object({
    service_account_name            = string
    workload_identity_pool_name     = string
    workload_identity_provider_name = string
  })
  description = "GitHub Actions関連の設定"
}

variable "enabled_apis" {
  type        = list(string)
  description = "プロジェクトに必要なAPI"
  default     = [
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "run.googleapis.com",
    "artifactregistry.googleapis.com"
  ]
}

variable "terraform_sa_roles" {
  type        = list(string)
  description = "Terraform用サービスアカウントに付与するロール"
  default     = [
    "roles/iam.serviceAccountAdmin",
    "roles/iam.workloadIdentityPoolAdmin",
    "roles/serviceusage.serviceUsageAdmin"
  ]
}

variable "github_actions_roles" {
  type        = list(string)
  description = "GitHub Actions用サービスアカウントに付与するロール"
  default     = [
    "roles/run.admin",
    "roles/iam.serviceAccountUser",
    "roles/artifactregistry.writer"
  ]
}
