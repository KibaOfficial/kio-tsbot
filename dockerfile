# Copyright (c) 2025 KibaOfficial
# 
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT

FROM node:20

WORKDIR /app

# copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# install dependencies
RUN npm install

# copy the rest of the application code
COPY . .

# build the application
RUN npm run build

CMD ["npm", "run", "start"]