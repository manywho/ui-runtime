FROM nginx:alpine

COPY runtime_build/ /usr/share/nginx/html/
COPY conf/ /etc/nginx/conf.d/
