# 🚀 TaskFlow — Cloud-Native Task Management Platform

TaskFlow is a production-style task management application built using a microservices architecture and deployed on AWS EC2 using Docker Compose.

The project demonstrates an end-to-end DevOps CI/CD workflow using Terraform, AWS, Docker, GitHub Actions, Amazon ECR, Docker Hub, and a self-hosted GitHub Actions runner.

---

## 🌐 Architecture

```text
Developer
    │
    │ git push
    ▼
GitHub Repository
    │
    ▼
GitHub Actions
    │
    ▼
Self-Hosted GitHub Runner
(AWS EC2)
    │
    ├───────────────┐
    ▼               ▼
Amazon ECR      Docker Hub
    │
    ▼
AWS EC2
    │
    ▼
Docker Compose
    │
    ├── Nginx / Frontend
    ├── API Gateway
    ├── Auth Service
    ├── Task Service
    ├── User Service
    ├── Team Service
    └── PostgreSQL
```

---

## ✨ Features

### Authentication
- User registration
- User login
- JWT-based authentication
- Protected API endpoints
- Password hashing using bcrypt

### Task Management
- Create tasks
- View tasks
- Update tasks
- Delete tasks
- Task status management

### User Management
- User profile
- Profile updates
- Authentication-based access

### Team Management
- Create teams
- View team members
- Send team invitations
- Accept invitations

---

## 🏗️ Microservices

| Service | Port | Responsibility |
|---|---:|---|
| Frontend | 80 | React + Nginx |
| API Gateway | 5000 | API routing |
| Auth Service | 5001 | Authentication & JWT |
| Task Service | 5002 | Task management |
| User Service | 5003 | User/profile management |
| Team Service | 5004 | Teams & invitations |
| PostgreSQL | 5432 | Application database |

---

## 🛠️ Technology Stack

### Frontend
- React
- Vite
- JavaScript
- Nginx
- Lucide React

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT
- bcryptjs

### DevOps
- Docker
- Docker Compose
- Git
- GitHub
- GitHub Actions
- Self-hosted GitHub Actions Runner
- Docker Buildx

### AWS
- Amazon EC2
- Amazon ECR
- IAM
- VPC
- Public Subnets
- Private Subnets
- Internet Gateway
- NAT Gateway
- Security Groups

### Infrastructure as Code
- Terraform

---

## ☁️ AWS Infrastructure

Terraform manages the AWS infrastructure required for TaskFlow.

### VPC

```text
VPC: 10.0.0.0/16
│
├── Public Subnet 1
│   └── EC2
├── Public Subnet 2
├── Private Subnet 1
└── Private Subnet 2
```

### Networking

- VPC CIDR: `10.0.0.0/16`
- 2 Public Subnets
- 2 Private Subnets
- Internet Gateway
- NAT Gateway
- Public Route Table
- Private Route Table
- Security Groups

---

## 🐳 Docker Architecture

Each application component runs as an independent container.

```text
taskflow-frontend
taskflow-gateway
taskflow-auth
taskflow-task
taskflow-user
taskflow-team
taskflow-postgres
```

All application containers communicate through:

```text
taskflow-network
```

PostgreSQL uses a persistent Docker volume:

```text
taskflow-postgres-data
```

---

## 🌐 Nginx Reverse Proxy

```text
Browser
   │
   ├── /
   │    └── React Application
   │
   └── /api
        │
        ▼
      Nginx
        │
        ▼
   API Gateway
        │
        ├── Auth Service
        ├── Task Service
        ├── User Service
        └── Team Service
```

---

## 🔐 GitHub OIDC Authentication

GitHub Actions does not use long-lived AWS access keys.

```text
GitHub Actions
      │
      ▼
GitHub OIDC
      │
      ▼
AWS IAM Role
      │
      ▼
Amazon ECR
```

IAM role:

```text
TaskFlowGitHubActionsRole
```

---

## 🔄 CI/CD Pipeline

Every push to `main` triggers the pipeline.

```text
Git Push
   │
   ▼
GitHub Actions
   │
   ├── Checkout Code
   ├── Setup Node.js
   ├── Install Dependencies
   ├── Build Frontend
   ├── Configure AWS using OIDC
   ├── Login to Amazon ECR
   ├── Login to Docker Hub
   ├── Build Docker Images
   ├── Push Images to ECR
   ├── Push Images to Docker Hub
   │
   └── Deploy to EC2
          │
          ├── Pull Images
          └── Docker Compose Up
```

---

## 🖥️ Self-Hosted GitHub Actions Runner

The self-hosted runner runs on AWS EC2 and has access to:

- Docker
- Docker Compose
- AWS CLI
- Amazon ECR
- EC2 deployment environment

```text
GitHub Actions
      │
      ▼
EC2 Self-Hosted Runner
      │
      ▼
Amazon ECR
      │
      ▼
docker compose pull
      │
      ▼
docker compose up -d
```

---

## 📦 Amazon ECR

Six Docker repositories are maintained in Amazon ECR:

```text
taskflow-frontend
taskflow-gateway
taskflow-auth
taskflow-task
taskflow-user
taskflow-team
```

Images use:

```text
<git-sha>
latest
```

Amazon ECR is the primary registry and Docker Hub is the secondary registry.

---

## 📁 Project Structure

```text
taskflow/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── gateway/
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
│
├── services/
│   ├── auth-service/
│   ├── task-service/
│   └── user-service/
│
├── team-service/
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
│
├── src/
│   ├── App.jsx
│   ├── Analytics.jsx
│   ├── Settings.jsx
│   ├── App.css
│   ├── index.css
│   ├── main.jsx
│   └── services/
│       └── api.js
│
├── terraform/
│   ├── versions.tf
│   ├── providers.tf
│   ├── variables.tf
│   ├── main.tf
│   ├── outputs.tf
│   ├── ecr.tf
│   ├── ecr-outputs.tf
│   ├── ec2.tf
│   ├── ec2-iam.tf
│   └── github-oidc.tf
│
├── Dockerfile
├── docker-compose.yml
├── docker-compose.prod.yml
├── nginx.conf
├── .dockerignore
├── .gitignore
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Local Development

```bash
git clone https://github.com/neetesh-sahu/taskflow-app.git
cd taskflow-app
npm install
npm run dev
```

For the complete local Docker environment:

```bash
docker compose up -d
docker compose ps
```

---

## 🏭 Production Deployment

Production deployment is handled through GitHub Actions.

Production configuration:

```text
docker-compose.prod.yml
```

Images are pulled from Amazon ECR.

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Production environment variables:

```text
POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD
JWT_SECRET
AWS_REGION
ECR_REGISTRY
IMAGE_TAG
```

Secrets are not committed to Git.

---

## 🔒 Security Practices

- GitHub OIDC instead of long-lived AWS access keys
- IAM roles for GitHub Actions
- IAM instance role for EC2
- JWT authentication
- Password hashing using bcrypt
- Environment-based secrets
- `.env` excluded from Git
- Docker network isolation
- ECR image scanning
- AWS Security Groups
- Private subnet architecture prepared through Terraform

---

## 🏗️ Infrastructure as Code

```bash
cd terraform
terraform init
terraform fmt
terraform validate
terraform plan
terraform apply
```

To destroy Terraform-managed infrastructure:

```bash
terraform destroy
```

> The current architecture stores PostgreSQL inside Docker on EC2. Destroying the EC2 infrastructure can remove the current application/database environment. Production data should be moved to a managed database before treating the environment as persistent production infrastructure.

---

## 📊 Current Project Status

| Component | Status |
|---|---|
| React Frontend | ✅ |
| Nginx | ✅ |
| API Gateway | ✅ |
| Auth Service | ✅ |
| Task Service | ✅ |
| User Service | ✅ |
| Team Service | ✅ |
| PostgreSQL | ✅ |
| Docker | ✅ |
| Docker Compose | ✅ |
| Terraform | ✅ |
| AWS VPC | ✅ |
| AWS EC2 | ✅ |
| Amazon ECR | ✅ |
| Docker Hub | ✅ |
| GitHub Actions | ✅ |
| Self-Hosted Runner | ✅ |
| GitHub OIDC | ✅ |
| Automated EC2 Deployment | ✅ |

---

# 🔮 Future Roadmap

## Phase 1 — AWS RDS PostgreSQL

Move PostgreSQL from the EC2 Docker container to Amazon RDS.

```text
EC2
 │
 ├── Frontend
 ├── Gateway
 ├── Auth
 ├── Task
 ├── User
 └── Team
       │
       ▼
   AWS RDS
  PostgreSQL
```

Benefits:
- Managed database
- Automated backups
- Better recovery
- Database independent of EC2 lifecycle
- Easier scaling

---

## Phase 2 — AWS Secrets Manager

Move sensitive values into AWS Secrets Manager.

Potential secrets:

```text
Database Password
JWT Secret
Application Credentials
```

---

## Phase 3 — Application Load Balancer

```text
Internet
   │
   ▼
Application Load Balancer
   │
   ▼
EC2
   │
   ▼
TaskFlow
```

Potential benefits:
- Health checks
- Centralized traffic routing
- HTTPS termination
- Multiple EC2 instances

---

## Phase 4 — HTTPS & Custom Domain

Introduce:

- Route 53
- AWS Certificate Manager
- HTTPS
- Custom domain

Target:

```text
https://taskflow.example.com
```

---

## Phase 5 — High Availability

```text
                 ALB
                  │
          ┌───────┴───────┐
          ▼               ▼
       EC2 #1           EC2 #2
          │               │
          └───────┬───────┘
                  ▼
                 RDS
```

Potential AWS services:

- Auto Scaling Group
- Application Load Balancer
- Multiple Availability Zones
- Amazon RDS

---

## Phase 6 — Monitoring & Observability

Introduce:

- Amazon CloudWatch
- Application logs
- Container logs
- CPU monitoring
- Memory monitoring
- Application health checks
- Alerts

```text
Application
    │
    ▼
CloudWatch
    │
    ├── Logs
    ├── Metrics
    └── Alerts
```

---

## Phase 7 — Advanced Deployment

Improve deployment with:

- Rolling deployments
- Blue/Green deployments
- Health checks
- Automated rollback
- Immutable Docker image tags
- Deployment verification

Production images can use:

```text
taskflow-auth:<git-sha>
taskflow-task:<git-sha>
taskflow-user:<git-sha>
taskflow-team:<git-sha>
taskflow-gateway:<git-sha>
taskflow-frontend:<git-sha>
```

---

# ☸️ Future Kubernetes Migration

After stabilizing the EC2 + Docker Compose architecture, TaskFlow can be migrated to Kubernetes.

```text
                    Internet
                       │
                       ▼
                    AWS ALB
                       │
                       ▼
                    Amazon EKS
                       │
          ┌────────────┼────────────┐
          │            │            │
       Frontend      Gateway     Services
                                    │
                           ┌────────┼────────┐
                           ▼        ▼        ▼
                         Auth     Task     User/Team
                                    │
                                    ▼
                                   RDS
```

Potential technologies:

- Amazon EKS
- Kubernetes Deployments
- Kubernetes Services
- Ingress
- ConfigMaps
- Secrets
- Helm

---

# 🔄 Future GitOps Architecture

```text
Developer
    │
    ▼
GitHub
    │
    ▼
GitHub Actions
    │
    ├── Test
    ├── Build
    └── Push Docker Image
             │
             ▼
          Amazon ECR
             │
             ▼
        GitOps Repository
             │
             ▼
           Argo CD
             │
             ▼
          Amazon EKS
```

CI and CD become separated:

```text
CI = Build + Test + Image Publishing
CD = GitOps-based Deployment
```

---

# 🧪 Future Testing & Security

Future CI/CD improvements:

- Unit testing
- Integration testing
- API testing
- Terraform validation
- Terraform plan checks
- Docker image vulnerability scanning
- Dependency scanning
- Secret scanning
- Container security scanning
- Automated deployment health checks

Future pipeline:

```text
Code
  │
  ▼
Lint
  │
  ▼
Unit Tests
  │
  ▼
Build
  │
  ▼
Docker Build
  │
  ▼
Security Scan
  │
  ▼
Push to ECR
  │
  ▼
Deploy
  │
  ▼
Health Check
```

---

# 🎯 Project Goals

TaskFlow demonstrates practical DevOps and Cloud Engineering concepts:

- Infrastructure as Code
- AWS networking
- EC2 deployment
- Microservices architecture
- Docker containerization
- Docker Compose
- CI/CD automation
- GitHub Actions
- Self-hosted runners
- AWS IAM
- GitHub OIDC
- Amazon ECR
- Docker Hub
- Automated deployments
- Nginx reverse proxy
- PostgreSQL
- Production-oriented architecture

---

# 🚀 Project Evolution

```text
TaskFlow v1
Docker Compose + EC2
        │
        ▼
TaskFlow v2
RDS + ALB + HTTPS
        │
        ▼
TaskFlow v3
Multi-EC2 + Auto Scaling
        │
        ▼
TaskFlow v4
Amazon EKS + Kubernetes
        │
        ▼
TaskFlow v5
Argo CD + GitOps + Observability
```

---

# 👨‍💻 Author

## Neetesh Sahu

B.Tech Computer Science Engineering

DevOps / Cloud Engineering

GitHub: https://github.com/neetesh-sahu

---

# ⭐ Project Summary

TaskFlow demonstrates the complete journey from application development to automated cloud deployment.

```text
Application Code
       │
       ▼
      Git
       │
       ▼
GitHub Actions
       │
       ▼
Docker Build
       │
       ▼
Amazon ECR
       │
       ▼
AWS EC2
       │
       ▼
Docker Compose
       │
       ▼
Nginx + Microservices
       │
       ▼
PostgreSQL
       │
       ▼
Live Application
```

TaskFlow is designed to evolve from a single EC2 + Docker Compose deployment toward a highly available AWS architecture using RDS, ALB, Auto Scaling, Kubernetes/EKS, GitOps, and observability.
