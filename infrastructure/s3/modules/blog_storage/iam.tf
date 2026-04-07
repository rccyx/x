# IAM user for continuum content operations
resource "aws_iam_user" "blog_uploader" {
  name = "${var.environment}-${var.project_name}-uploader"
  path = "/system/"
}

# Create access keys for the IAM user
resource "aws_iam_access_key" "blog_uploader" {
  user = aws_iam_user.blog_uploader.name
}

# IAM policy for continuum content operations
resource "aws_iam_policy" "blog_uploader_policy" {
  name        = "${var.environment}-${var.project_name}-uploader-policy"
  description = "Policy for uploading/managing continuum content"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "ListBucket"
        Effect   = "Allow"
        Action   = [
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ]
        Resource = aws_s3_bucket.blog_content.arn
      },
      {
        Sid      = "ManageObjects"
        Effect   = "Allow"
        Action   = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.blog_content.arn}/*"
      }
    ]
  })
}

# Attach the policy to the user
resource "aws_iam_user_policy_attachment" "blog_uploader_attachment" {
  user       = aws_iam_user.blog_uploader.name
  policy_arn = aws_iam_policy.blog_uploader_policy.arn
} 