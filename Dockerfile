FROM rickydunlop/nodejs-ffmpeg

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json ./

# RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

# Create logs directory and uploads directory
RUN mkdir -p server/logs \
 && mkdir -p server/uploads \
 && mkdir -p server/uploads/videos \
 && mkdir -p server/uploads/images

EXPOSE 3000
CMD [ "npm", "start" ]
