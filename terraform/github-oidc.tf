# =====================================================
# GITHUB ACTIONS OIDC PROVIDER
# =====================================================

data "tls_certificate" "github" {
  url = "https://token.actions.githubusercontent.com"
}

resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = [
    "sts.amazonaws.com"
  ]

  thumbprint_list = [
    data.tls_certificate.github.certificates[0].sha1_fingerprint
  ]

  tags = {
    Name = "taskflow-github-oidc"
  }
}

# =====================================================
# GITHUB ACTIONS IAM ROLE
# =====================================================

resource "aws_iam_role" "github_actions" {
  name = "TaskFlowGitHubActionsRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        }

        Action = "sts:AssumeRoleWithWebIdentity"

        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }

          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:neetesh-sahu@254239160/taskflow-app@1381019985:ref:refs/heads/main"
          }
        }
      }
    ]
  })

  tags = {
    Name = "TaskFlow GitHub Actions Role"
  }
}

# =====================================================
# ECR PUSH PERMISSIONS
# =====================================================

resource "aws_iam_role_policy" "github_ecr" {
  name = "TaskFlowECRPushPolicy"
  role = aws_iam_role.github_actions.id

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
          "ecr:CompleteLayerUpload",
          "ecr:InitiateLayerUpload",
          "ecr:PutImage",
          "ecr:UploadLayerPart"
        ]

        Resource = [
          for repository in aws_ecr_repository.taskflow :
          repository.arn
        ]
      }
    ]
  })
}
