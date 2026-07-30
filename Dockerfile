FROM docker.io/n8nio/n8n:2.31.6

USER root

RUN npm install --location=global cheerio marked imapflow mailparser nodemailer \
	&& ln -sfn "$(npm root -g)" /opt/n8n-globals

ARG LOCAL_AI_NODE_PACKAGE=n8n-nodes-local-ai-0.1.1.tgz
COPY custom-nodes/n8n-nodes-local-ai/release/${LOCAL_AI_NODE_PACKAGE} \
	/opt/n8n-custom-packages/n8n-nodes-local-ai.tgz
COPY --chmod=0755 n8n-with-local-ai.sh /usr/local/bin/n8n-with-local-ai

ENV NODE_PATH=/opt/n8n-globals:/usr/local/lib/node_modules/n8n/node_modules

USER node

ENTRYPOINT ["tini", "--", "/usr/local/bin/n8n-with-local-ai"]
