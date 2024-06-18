This directory is accessed by the Nitro KV as assets:server.
Contents are ignored by Git. Copy your server assets here or mount
a Docker volume to this directory to provide the necessary files.

Kafka SSL files are expected in a subdirectory called kafka-ssl.
So the path to the Kafka SSL files should be server/assets/kafka-ssl/...
where the required files are:
- ca-cert.pem
- webui-cert.pem
- webui-priv-key.pem