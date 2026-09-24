# =====================================================
# LATEST UBUNTU 24.04 LTS AMI
# =====================================================

data "aws_ami" "ubuntu_24" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# =====================================================
# EC2 SECURITY GROUP
# =====================================================

resource "aws_security_group" "taskflow_ec2" {
  name        = "taskflow-ec2-sg"
  description = "Security group for TaskFlow EC2 deployment server"
  vpc_id      = aws_vpc.taskflow.id

  # SSH
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # TaskFlow application
  ingress {
    description = "TaskFlow HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Temporary direct access to Vite/frontend port if needed
  ingress {
    description = "TaskFlow frontend"
    from_port   = 5173
    to_port     = 5173
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS outbound is allowed by default
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "TaskFlow-EC2-SG"
  }
}

# =====================================================
# TASKFLOW EC2 INSTANCE
# =====================================================

resource "aws_instance" "taskflow" {
  ami           = data.aws_ami.ubuntu_24.id
  instance_type = "t3.small"
  key_name      = "taskflow-ec2-key"

  subnet_id = aws_subnet.public[0].id

  vpc_security_group_ids = [
    aws_security_group.taskflow_ec2.id
  ]

  iam_instance_profile = aws_iam_instance_profile.taskflow_ec2.name

  associate_public_ip_address = true

  user_data = <<-USERDATA
    #!/bin/bash

    set -e

    apt-get update -y

    apt-get install -y \
      ca-certificates \
      curl \
      git \
      unzip \
      jq

    # Docker
    curl -fsSL https://get.docker.com | sh

    systemctl enable docker
    systemctl start docker

    usermod -aG docker ubuntu

    # AWS CLI
    if ! command -v aws >/dev/null 2>&1; then
      curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" \
        -o "/tmp/awscliv2.zip"

      unzip -q /tmp/awscliv2.zip -d /tmp

      /tmp/aws/install

      rm -rf /tmp/aws /tmp/awscliv2.zip
    fi

    # Docker Compose plugin
    mkdir -p /usr/local/lib/docker/cli-plugins

    curl -SL \
      https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
      -o /usr/local/lib/docker/cli-plugins/docker-compose

    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

    echo "TaskFlow EC2 bootstrap completed" > /var/log/taskflow-bootstrap.log
  USERDATA

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
    encrypted   = true
  }

  tags = {
    Name = "TaskFlow-Deployment-Server"
  }
}
