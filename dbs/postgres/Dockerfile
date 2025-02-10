FROM postgres:latest

RUN mkdir -p /docker-entrypoint-initdb.d

COPY init.sql /docker-entrypoint-initdb.d/
