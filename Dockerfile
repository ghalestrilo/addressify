# Use Node.js LTS with build tools
FROM node:20-bullseye

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV LIBPOSTAL_DATA_DIR=/opt/libpostal_data

# Install system dependencies required for libpostal
RUN apt-get update && apt-get install -y \
    curl \
    autoconf \
    automake \
    libtool \
    pkg-config \
    build-essential \
    python2.7 \
    python2.7-dev \
    python-is-python2 \
    git \
    && rm -rf /var/lib/apt/lists/*

# Create directory for libpostal data with sufficient space
RUN mkdir -p $LIBPOSTAL_DATA_DIR

# Clone and build libpostal
WORKDIR /tmp
RUN git clone https://github.com/openvenues/libpostal.git
WORKDIR /tmp/libpostal

# Bootstrap, configure, and build libpostal
# This will download ~750MB of data and take significant time
RUN ./bootstrap.sh
RUN ./configure --datadir=$LIBPOSTAL_DATA_DIR
RUN make -j$(nproc)
RUN make install

# Update library cache
RUN ldconfig

# Install node-gyp globally
RUN npm install -g node-gyp

# Create app directory
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["yarn", "start:prod"]
