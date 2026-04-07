output "app_id" {
  description = "The ID of the Koyeb app"
  value       = koyeb_app.continuum.id
}

output "service_id" {
  description = "The ID of the Koyeb service"
  value       = koyeb_service.continuum.id
}

output "app_name" {
  description = "The name of the deployed app"
  value       = koyeb_app.continuum.name
}

output "terraform_managed" {
  description = "Note that this app is managed by Terraform and is different from the main continuum app"
  value       = "This is a Terraform-managed version of the continuum app. The app name was changed to avoid conflicts with existing apps that may be pending deletion in Koyeb."
}
