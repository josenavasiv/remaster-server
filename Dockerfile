FROM node:18-alpine

WORKDIR /server

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci --omit=dev; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

COPY . .

ENV NODE_ENV production

RUN npx prisma generate

EXPOSE 4000

WORKDIR /server/dist

CMD ["node", "index.js"]