# Main bucket for continuum content
resource "aws_s3_bucket" "blog_content" {
  bucket = local.bucket_name
}

# Lifecycle configuration to prevent destroy (only applied for non-dev environments)
resource "null_resource" "prevent_destroy" {
  count = var.environment != "dev" ? 1 : 0
  
  triggers = {
    bucket_id = aws_s3_bucket.blog_content.id
  }
  
  lifecycle {
    prevent_destroy = true
  }
}

# Block all public access
resource "aws_s3_bucket_public_access_block" "blog_content_block_public" {
  bucket = aws_s3_bucket.blog_content.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable versioning
resource "aws_s3_bucket_versioning" "blog_content_versioning" {
  bucket = aws_s3_bucket.blog_content.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Enable server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "blog_content_encryption" {
  bucket = aws_s3_bucket.blog_content.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# CORS configuration
resource "aws_s3_bucket_cors_configuration" "blog_content_cors" {
  bucket = aws_s3_bucket.blog_content.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = var.allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Create folder structure in S3 bucket
resource "aws_s3_object" "folders" {
  for_each = toset(local.folders)
  
  bucket  = aws_s3_bucket.blog_content.id
  key     = each.value
  content = ""
  
  # Required to create a "folder" in S3
  content_type = "application/x-directory"
}

# Lifecycle policy to delete old versions after 30 days
resource "aws_s3_bucket_lifecycle_configuration" "blog_content_lifecycle" {
  bucket = aws_s3_bucket.blog_content.id

  rule {
    id     = "cleanup-old-versions"
    status = "Enabled"
    
    filter {
      prefix = ""  # Apply to all objects
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# S3 bucket policy to allow CloudFront access
resource "aws_s3_bucket_policy" "blog_content_policy" {
  bucket = aws_s3_bucket.blog_content.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontAccess"
        Effect    = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.blog_oai.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.blog_content.arn}/*"
      }
    ]
  })
} 