#!/bin/bash

# Log in to Docker Hub
#echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_HUB_USERNAME" --password-stdin

# Build and push Docker image
cd eureka-server-registry
docker build -t $DOCKER_HUB_USERNAME/eureka-server-registry .
docker push "$DOCKER_HUB_USERNAME/eureka-server-registry"
cd ..

cd email-marketing-gateway
docker build -t $DOCKER_HUB_USERNAME/email-marketing-gateway .
docker push "$DOCKER_HUB_USERNAME/blue-pilot-gateway"
cd ..

cd core-service
docker build -t $DOCKER_HUB_USERNAME/core-service .
docker push "$DOCKER_HUB_USERNAME/core-service"
cd ..

cd auth-service
docker build -t $DOCKER_HUB_USERNAME/auth-service .
docker push "$DOCKER_HUB_USERNAME/auth-service"
cd ..

# Log out from Docker Hub (optional)
#docker logout
