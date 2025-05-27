# Copyright (c) 2025 KibaOfficial
# 
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT

FROM node:22-slim

WORKDIR /app

# copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# install dependencies
RUN npm install

# install ffmpeg for discord-player
RUN apt-get update && apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# copy the rest of the application code
COPY . .

# build the application
RUN npm run build

CMD ["npm", "run", "start"]