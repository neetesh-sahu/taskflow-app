output "ec2_instance_id" {
  description = "TaskFlow EC2 instance ID"
  value       = aws_instance.taskflow.id
}

output "ec2_public_ip" {
  description = "TaskFlow EC2 public IP"
  value       = aws_instance.taskflow.public_ip
}

output "ec2_public_dns" {
  description = "TaskFlow EC2 public DNS"
  value       = aws_instance.taskflow.public_dns
}

output "ec2_security_group_id" {
  description = "TaskFlow EC2 security group ID"
  value       = aws_security_group.taskflow_ec2.id
}
