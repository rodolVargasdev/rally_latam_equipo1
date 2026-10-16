# Image used to record the MVP video; pinned to the same Playwright version as package.json.
FROM mcr.microsoft.com/playwright:v1.63.0-noble
WORKDIR /work
COPY package.json package-lock.json ./
RUN npm ci
COPY mvp ./mvp
CMD ["npm", "run", "record"]
