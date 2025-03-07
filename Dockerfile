FROM node:22-bookworm as build-stage

RUN apt update && apt upgrade -y
RUN apt install python3 make g++

WORKDIR /app

COPY package*.json ./

# install dependencies. Timeout for buildx emulation, it is so slow that NPM install might time-out
RUN npm install --fetch-timeout=600000 --save-dev --legacy-peer-deps

COPY . .

RUN npm run test
RUN npm run build

ARG APP_API_URL
ARG APP_BASE
ARG APP_NAME=Streamsink
ARG APP_VERSION=1.0.0-alpha
ARG APP_FILEURL
ARG APP_SOCKETURL
ARG APP_BUILD

ENV VUE_APP_APIURL $APP_API_URL
ENV VUE_APP_BASE $APP_BASE
ENV VUE_APP_NAME $APP_NAME
ENV VUE_APP_FILEURL $APP_FILEURL
ENV VUE_APP_SOCKETURL $APP_SOCKETURL

# The build number is once written to a file after the build.
RUN cat >./dist/build.js <<EOL
window.VUE_APP_BUILD = "${APP_BUILD}";
window.VUE_APP_VERSION = "${APP_VERSION}";
EOL

# production stage
FROM nginx:stable as production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY ./nginx.conf.default /etc/nginx/nginx.conf
# Add only if you want simple basic authentication protection to the app
#COPY .htpasswd /etc/nginx

EXPOSE 80

COPY docker-entrypoint.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
