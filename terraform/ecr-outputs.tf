output "ecr_repository_urls" {
  description = "TaskFlow ECR repository URLs"
  value = {
    for name, repository in aws_ecr_repository.taskflow :
    name => repository.repository_url
  }
}
