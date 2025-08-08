FROM node:23-slim
# Set the NODE_ENV environment variable to be passed to the build stage
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}
# Set pnpm envs
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
# Set working directory
WORKDIR /app
# Install pnpm globally
RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.bashrc" SHELL="$(which bash)" bash -
# Copy package.json and pnpm-lock.yaml first for better caching
COPY package.json pnpm-lock.yaml ./
# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile
# Copy the rest of the application code and build the app
COPY . .
# Build the application
RUN pnpm build
# Use the exec form of CMD with a shell command that evaluates the condition
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then pnpm start:prod; else pnpm start:debug; fi"]