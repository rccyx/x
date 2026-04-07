variable "koyeb_token" {
  description = "Koyeb API token"
  type        = string
  sensitive   = true
}

variable "app_name" {
  description = "Name of the Koyeb app"
  type        = string
  default     = "continuum"
}

variable "service_name" {
  description = "Name of the Koyeb service"
  type        = string
  default     = "continuum"
}

variable "docker_image" {
  description = "Docker image to deploy"
  type        = string
  default     = "docker.io/rccyx/continuum:latest"
}

variable "docker_image_preview" {
  description = "Docker image to deploy for preview environment"
  type        = string
  default     = "docker.io/rccyx/continuum:preview"
}

variable "docker_username" {
  description = "Docker registry username"
  type        = string
  default     = ""
}

variable "docker_password" {
  description = "Docker registry password"
  type        = string
  default     = ""
  sensitive   = true
}

variable "port" {
  description = "Port the service listens on"
  type        = number
  default     = 3001
}

variable "environment_variables" {
  description = "Environment variables for the service"
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "instance_type" {
  description = "Koyeb instance type"
  type        = string
  default     = "micro" // smol continuum frfr
}

variable "region" {
  description = "Region to deploy to"
  type        = string
  default     = "fra" // lowkey faster in frankfurt
}