# Addressify Docker Management Makefile
# Provides convenient commands for Docker operations

.PHONY: help build build-optimized dev prod test clean logs shell health install

# Default target
help: ## Show this help message
	@echo "Addressify Docker Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Build commands
build: ## Build the standard Docker image
	docker-compose build addressify-app

build-optimized: ## Build the optimized multi-stage Docker image
	docker build -f Dockerfile.optimized -t addressify:optimized .

build-dev: ## Build the development Docker image
	docker-compose -f docker-compose.dev.yml build

# Development commands
dev: ## Start development server with hot reloading
	docker-compose -f docker-compose.dev.yml up

dev-build: ## Build and start development server
	docker-compose -f docker-compose.dev.yml up --build

dev-detached: ## Start development server in background
	docker-compose -f docker-compose.dev.yml up -d

# Production commands
prod: ## Start production server
	docker-compose --profile production up addressify-prod

prod-detached: ## Start production server in background
	docker-compose --profile production up -d addressify-prod

prod-optimized: ## Run optimized production image
	docker run -d --name addressify-prod -p 3000:3000 -v libpostal_data:/opt/libpostal_data --restart unless-stopped addressify:optimized

# Testing commands
test: ## Run tests in Docker container
	docker-compose -f docker-compose.dev.yml exec addressify-dev yarn test

test-build: ## Build and run tests
	docker-compose -f docker-compose.dev.yml run --rm addressify-dev yarn test

test-coverage: ## Run tests with coverage
	docker-compose -f docker-compose.dev.yml exec addressify-dev yarn test:cov

lint: ## Run linting
	docker-compose -f docker-compose.dev.yml exec addressify-dev yarn lint

format: ## Format code
	docker-compose -f docker-compose.dev.yml exec addressify-dev yarn format

# Utility commands
logs: ## Show logs from running containers
	docker-compose logs -f

logs-dev: ## Show development logs
	docker-compose -f docker-compose.dev.yml logs -f

shell: ## Open shell in development container
	docker-compose -f docker-compose.dev.yml exec addressify-dev /bin/bash

shell-prod: ## Open shell in production container
	docker-compose --profile production exec addressify-prod /bin/bash

health: ## Check container health
	@echo "Checking container health..."
	@docker-compose ps
	@echo ""
	@echo "API Health Check:"
	@curl -f http://localhost:3000/health 2>/dev/null && echo "✅ API is healthy" || echo "❌ API is not responding"

# Installation and setup
install: ## Install dependencies in development container
	docker-compose -f docker-compose.dev.yml exec addressify-dev yarn install

install-build: ## Build container and install dependencies
	docker-compose -f docker-compose.dev.yml run --rm addressify-dev yarn install

# Cleanup commands
stop: ## Stop all running containers
	docker-compose stop
	docker-compose -f docker-compose.dev.yml stop

down: ## Stop and remove containers
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

clean: ## Clean up Docker images and containers
	docker-compose down -v --remove-orphans
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans
	docker system prune -f

clean-all: ## Clean everything including volumes (WARNING: This will delete libpostal data)
	docker-compose down -v --remove-orphans
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans
	docker system prune -a -f
	docker volume prune -f

# Backup and restore
backup-libpostal: ## Backup libpostal data
	@echo "Creating libpostal data backup..."
	docker run --rm -v addressify_libpostal_data:/data -v $(PWD):/backup alpine tar czf /backup/libpostal_backup_$(shell date +%Y%m%d_%H%M%S).tar.gz -C /data .

restore-libpostal: ## Restore libpostal data (specify BACKUP_FILE=filename)
	@if [ -z "$(BACKUP_FILE)" ]; then echo "Usage: make restore-libpostal BACKUP_FILE=libpostal_backup_YYYYMMDD_HHMMSS.tar.gz"; exit 1; fi
	@echo "Restoring libpostal data from $(BACKUP_FILE)..."
	docker run --rm -v addressify_libpostal_data:/data -v $(PWD):/backup alpine tar xzf /backup/$(BACKUP_FILE) -C /data

# Monitoring
stats: ## Show Docker container stats
	docker stats

inspect: ## Inspect Docker containers and volumes
	@echo "=== Containers ==="
	docker-compose ps
	@echo ""
	@echo "=== Volumes ==="
	docker volume ls | grep addressify
	@echo ""
	@echo "=== Images ==="
	docker images | grep addressify

# Development workflow helpers
restart-dev: ## Restart development server
	docker-compose -f docker-compose.dev.yml restart addressify-dev

rebuild-dev: ## Rebuild and restart development server
	docker-compose -f docker-compose.dev.yml up --build -d addressify-dev

# CI/CD helpers
ci-build: ## Build for CI/CD pipeline
	docker build -f Dockerfile.optimized -t addressify:$(shell git rev-parse --short HEAD) .

ci-test: ## Run tests for CI/CD pipeline
	docker run --rm addressify:$(shell git rev-parse --short HEAD) yarn test

# Quick setup for new developers
setup: ## Complete setup for new developers
	@echo "Setting up Addressify development environment..."
	@echo "This will take 15-30 minutes for the first run..."
	docker-compose -f docker-compose.dev.yml up --build -d
	@echo "Waiting for container to be ready..."
	@sleep 30
	@make health
	@echo ""
	@echo "✅ Setup complete! Development server is running at http://localhost:3000"
	@echo "Use 'make logs-dev' to see logs or 'make shell' to access the container"
