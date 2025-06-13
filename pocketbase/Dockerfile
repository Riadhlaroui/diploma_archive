# pocketbase/Dockerfile

FROM alpine:latest

# Install curl and unzip
RUN apk --no-cache add curl unzip

# Download PocketBase v0.23.2
RUN curl -L -o /pb.zip https://github.com/pocketbase/pocketbase/releases/download/v0.23.2/pocketbase_0.23.2_linux_amd64.zip \
  && unzip /pb.zip -d /pb \
  && chmod +x /pb/pocketbase \
  && rm /pb.zip

WORKDIR /pb
EXPOSE 8090

CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090"]
