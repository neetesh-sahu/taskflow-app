locals {
  ecr_repositories = [
    "taskflow-frontend",
    "taskflow-gateway",
    "taskflow-auth",
    "taskflow-task",
    "taskflow-user",
    "taskflow-team"
  ]
}

resource "aws_ecr_repository" "taskflow" {
  for_each = toset(local.ecr_repositories)

  name                 = each.value
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Name = each.value
  }
}
