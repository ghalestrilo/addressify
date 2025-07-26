# Docker Setup for Addressify

This guide explains how to run the Addressify server using Docker with all necessary dependencies for `node-postal`.

## Overview

The Docker setup includes:
- **libpostal**: C library for address parsing/normalization
- **Node.js**: Runtime environment with development headers
- **Build tools**: Required for compiling native dependencies
- **ML Models**: ~2GB of machine learning models for address parsing

## Quick Start

### Development Mode

```bash
# Build and start the development server
docker-compose -f docker-compose.dev.yml up --build

# Or using the main compose file
docker-compose up addressify-app
```

The server will be available at `http://localhost:3000` with hot reloading enabled.

### Production Mode

```bash
# Start production server
docker-compose --profile production up addressify-prod

# Or build the optimized image
docker build -f Dockerfile.optimized -t addressify:optimized .
docker run -p 3000:3000 addressify:optimized
```

## Docker Files

### `Dockerfile`
Standard Dockerfile that:
- Installs system dependencies
- Compiles libpostal from source
- Downloads ML models (~750MB download, ~2GB unzipped)
- Installs Node.js dependencies
- Builds the application

### `Dockerfile.optimized`
Multi-stage build that:
- Reduces final image size
- Separates build and runtime dependencies
- Creates non-root user for security
- Includes health checks

### `docker-compose.yml`
Main compose file with:
- Development service (hot reloading)
- Production service (optimized)
- Persistent volumes for libpostal data
- Health checks

### `docker-compose.dev.yml`
Development-focused compose file with:
- Source code mounting for hot reloading
- Debug port exposure (9229)
- Development environment variables
- Optional database/cache services

## Persistent Volumes

The setup uses Docker volumes to persist libpostal data:

```yaml
volumes:
  libpostal_data:
```

This prevents re-downloading the ~750MB of ML models on container restarts.

## Build Times and Resources

**First Build:**
- Time: 15-30 minutes (depends on internet speed and CPU)
- Disk Space: ~3GB for models + build artifacts
- Memory: 2GB+ recommended during build

**Subsequent Builds:**
- Much faster due to Docker layer caching
- libpostal data persisted in volumes

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `LIBPOSTAL_DATA_DIR` | libpostal data directory | `/opt/libpostal_data` |
| `DEBUG` | Debug logging | `*` (dev only) |

## Development Workflow

1. **Start development server:**
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

2. **Run tests:**
   ```bash
   docker-compose -f docker-compose.dev.yml exec addressify-dev yarn test
   ```

3. **Install new dependencies:**
   ```bash
   docker-compose -f docker-compose.dev.yml exec addressify-dev yarn add <package>
   ```

4. **Debug mode:**
   ```bash
   docker-compose -f docker-compose.dev.yml up
   # Attach debugger to localhost:9229
   ```

## Production Deployment

1. **Build optimized image:**
   ```bash
   docker build -f Dockerfile.optimized -t addressify:latest .
   ```

2. **Run production container:**
   ```bash
   docker run -d \
     --name addressify-prod \
     -p 3000:3000 \
     -v libpostal_data:/opt/libpostal_data \
     --restart unless-stopped \
     addressify:latest
   ```

3. **With docker-compose:**
   ```bash
   docker-compose --profile production up -d
   ```

## Troubleshooting

### Build Issues

**libpostal compilation fails:**
```bash
# Check available disk space (needs ~3GB)
docker system df

# Clean up Docker to free space
docker system prune -a
```

**Network timeouts during model download:**
```bash
# Increase build timeout
docker-compose build --build-arg BUILDKIT_INLINE_CACHE=1 addressify-app
```

### Runtime Issues

**Container exits immediately:**
```bash
# Check logs
docker-compose logs addressify-app

# Common issue: insufficient memory
# Increase Docker memory allocation to 4GB+
```

**libpostal not found:**
```bash
# Verify libpostal installation
docker-compose exec addressify-app ldconfig -p | grep postal
```

### Performance

**Slow startup:**
- First run downloads large ML models
- Subsequent runs should be faster
- Use volumes to persist data

**High memory usage:**
- libpostal models require ~2GB RAM
- Normal for address parsing libraries
- Monitor with `docker stats`

## Health Checks

The containers include health checks:

```bash
# Check health status
docker-compose ps

# Manual health check
curl http://localhost:3000/health
```

## Security

The optimized Dockerfile:
- Runs as non-root user
- Uses minimal base image
- Excludes development dependencies

For production, consider:
- Using secrets for sensitive configuration
- Setting up proper logging
- Implementing rate limiting
- Using reverse proxy (nginx)

## Maintenance

**Update libpostal:**
```bash
# Rebuild without cache
docker-compose build --no-cache
```

**Clean up:**
```bash
# Remove unused images and volumes
docker system prune -a
docker volume prune
```

**Backup volumes:**
```bash
# Export libpostal data
docker run --rm -v libpostal_data:/data -v $(pwd):/backup alpine tar czf /backup/libpostal_backup.tar.gz -C /data .
```

## Integration with CI/CD

Example GitHub Actions:

```yaml
name: Docker Build
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -f Dockerfile.optimized -t addressify:${{ github.sha }} .
      - name: Run tests
        run: docker run --rm addressify:${{ github.sha }} yarn test
```

## Next Steps

- Set up monitoring (Prometheus/Grafana)
- Implement caching layer (Redis)
- Add database if needed (PostgreSQL)
- Configure logging aggregation
- Set up backup strategies
