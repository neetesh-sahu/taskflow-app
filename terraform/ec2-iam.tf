resource "aws_iam_role" "taskflow_ec2" {
  name = "TaskFlowEC2Role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Service = "ec2.amazonaws.com"
        }

        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name = "TaskFlowEC2Role"
  }
}

resource "aws_iam_role_policy" "taskflow_ec2_ecr" {
  name = "TaskFlowEC2ECRPullPolicy"
  role = aws_iam_role.taskflow_ec2.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Action = [
          "ecr:GetAuthorizationToken"
        ]

        Resource = "*"
      },
      {
        Effect = "Allow"

        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:BatchGetImage",
          "ecr:DescribeImages",
          "ecr:GetDownloadUrlForLayer"
        ]

        Resource = [
          for repository in aws_ecr_repository.taskflow :
          repository.arn
        ]
      }
    ]
  })
}

resource "aws_iam_instance_profile" "taskflow_ec2" {
  name = "TaskFlowEC2InstanceProfile"
  role = aws_iam_role.taskflow_ec2.name

  tags = {
    Name = "TaskFlowEC2InstanceProfile"
  }
}