data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_vpc" "taskflow" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "taskflow-${var.environment}-vpc"
  }
}

# =====================================================
# INTERNET GATEWAY
# =====================================================

resource "aws_internet_gateway" "taskflow" {
  vpc_id = aws_vpc.taskflow.id

  tags = {
    Name = "taskflow-${var.environment}-igw"
  }
}

# =====================================================
# PUBLIC SUBNETS
# =====================================================

resource "aws_subnet" "public" {
  count = length(var.public_subnet_cidrs)

  vpc_id                  = aws_vpc.taskflow.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "taskflow-${var.environment}-public-${count.index + 1}"

    "kubernetes.io/role/elb" = "1"
  }
}

# =====================================================
# PRIVATE SUBNETS
# =====================================================

resource "aws_subnet" "private" {
  count = length(var.private_subnet_cidrs)

  vpc_id            = aws_vpc.taskflow.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "taskflow-${var.environment}-private-${count.index + 1}"

    "kubernetes.io/role/internal-elb" = "1"
  }
}

# =====================================================
# ELASTIC IP FOR NAT GATEWAY
# =====================================================

resource "aws_eip" "nat" {
  domain = "vpc"

  tags = {
    Name = "taskflow-${var.environment}-nat-eip"
  }
}

# =====================================================
# NAT GATEWAY
# =====================================================

resource "aws_nat_gateway" "taskflow" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id

  depends_on = [
    aws_internet_gateway.taskflow
  ]

  tags = {
    Name = "taskflow-${var.environment}-nat"
  }
}

# =====================================================
# PUBLIC ROUTE TABLE
# =====================================================

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.taskflow.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.taskflow.id
  }

  tags = {
    Name = "taskflow-${var.environment}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count = length(aws_subnet.public)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# =====================================================
# PRIVATE ROUTE TABLE
# =====================================================

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.taskflow.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.taskflow.id
  }

  tags = {
    Name = "taskflow-${var.environment}-private-rt"
  }
}

resource "aws_route_table_association" "private" {
  count = length(aws_subnet.private)

  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}
