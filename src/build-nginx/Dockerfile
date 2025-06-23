FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=frontend /app/dist /usr/share/nginx/html

COPY default.conf.template /etc/nginx/templates/default.conf.template

CMD ["nginx", "-g", "daemon off;"]
