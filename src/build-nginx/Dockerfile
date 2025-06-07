FROM nginx:alpine

COPY ./nginx.conf /etc/nginx/nginx.conf

COPY --from=frontend /app/build /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
