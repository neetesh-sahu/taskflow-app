provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "TaskFlow"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
