terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

# Random IDs for bucket name obfuscation
resource "random_id" "bucket_suffix" {
  for_each = var.environment_configs
  
  byte_length = each.value.random_suffix_length / 2 # Because each byte becomes 2 hex chars
}

# S3 Buckets - development
resource "aws_s3_bucket" "dev_bucket" {
  # Obfuscated bucket name: project-name-env-randomsuffix
  bucket = "${var.project_name}-dev-${random_id.bucket_suffix["dev"].hex}"
  
  force_destroy = true
  
  tags = {
    Name        = "${var.project_name}-dev"
    Environment = "dev"
  }
  # No prevent_destroy for testing
}

# S3 Buckets - preview
resource "aws_s3_bucket" "preview_bucket" {
  # Obfuscated bucket name: project-name-env-randomsuffix
  bucket = "${var.project_name}-preview-${random_id.bucket_suffix["preview"].hex}"
  
  force_destroy = true
  
  tags = {
    Name        = "${var.project_name}-preview"
    Environment = "preview"
  }
  # No prevent_destroy for testing
}

# S3 Buckets - production
resource "aws_s3_bucket" "prod_bucket" {
  # Obfuscated bucket name: project-name-env-randomsuffix
  bucket = "${var.project_name}-prod-${random_id.bucket_suffix["prod"].hex}"
  
  # This is a production bucket, so we don't want to destroy it
  force_destroy = false
  
  tags = {
    Name        = "${var.project_name}-prod"
    Environment = "prod"
  }
}

# Bucket versioning
resource "aws_s3_bucket_versioning" "dev_bucket_versioning" {
  bucket = aws_s3_bucket.dev_bucket.id
  versioning_configuration {
    status = "Suspended"
  }
}

resource "aws_s3_bucket_versioning" "preview_bucket_versioning" {
  bucket = aws_s3_bucket.preview_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_versioning" "prod_bucket_versioning" {
  bucket = aws_s3_bucket.prod_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

# CORS configuration
resource "aws_s3_bucket_cors_configuration" "dev_cors_config" {
  bucket = aws_s3_bucket.dev_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = var.allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_cors_configuration" "preview_cors_config" {
  bucket = aws_s3_bucket.preview_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = var.allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_cors_configuration" "prod_cors_config" {
  bucket = aws_s3_bucket.prod_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = var.allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Production bucket-specific configurations
resource "aws_s3_bucket_public_access_block" "prod_bucket_public_access_block" {
  bucket = aws_s3_bucket.prod_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Create default folders in each bucket
locals {
  buckets = {
    dev     = aws_s3_bucket.dev_bucket
    preview = aws_s3_bucket.preview_bucket
    prod    = aws_s3_bucket.prod_bucket
  }
}

resource "aws_s3_object" "audio_folder" {
  for_each = local.buckets

  bucket  = each.value.id
  key     = "audio/"
  content = "" # Empty content as this is just a prefix/folder
}

resource "aws_s3_object" "mdx_folder" {
  for_each = local.buckets

  bucket  = each.value.id
  key     = "mdx/"
  content = ""
}

resource "aws_s3_object" "image_folder" {
  for_each = local.buckets

  bucket  = each.value.id
  key     = "image/"
  content = "" 
}

resource "aws_s3_object" "other_folder" {
  for_each = local.buckets

  bucket  = each.value.id
  key     = "other/"
  content = ""  # things that aren't for my continuum, can be any other blob
}
