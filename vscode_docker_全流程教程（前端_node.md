# VSCode + Docker 全流程教程（面向前端 + Node.js 后端）

> 目标读者：熟悉 VSCode、会写前端（如 React/Vite/静态页面）和 Node.js 后端（Express 等），想把开发流程容器化、在 VSCode 中无缝开发和调试。

---

## 目录

1. 前言与准备工作
2. Docker 的核心概念（快速理解）
3. 第一个示例：把一个简单的 Express 应用放进容器
4. 开发环境最佳实践（热重载、node_modules 问题）
5. 使用 docker-compose 管理多服务（后端 + 数据库）
6. 前端（Vite/CRA）— 开发 vs 生产 镜像（多阶段构建 + nginx）
7. 在 VSCode 中使用 Docker：Docker 插件、Remote - Containers（devcontainer）
8. 在容器中调试 Node.js（VSCode 配置）
9. 常见问题排查与性能、安全建议
10. 常用命令速查表、.dockerignore、项目结构建议
11. 附录：完整示例文件（可直接复制）

---

# 1. 前言与准备工作

**前置要求**：

- 已安装 VSCode
- 已安装 Node.js（推荐 16/18/20）与 npm/yarn
- 已安装 Docker（Windows/Mac：Docker Desktop；Linux：Docker Engine + docker-compose）
- 推荐安装的 VSCode 扩展：
  - Docker（ms-azuretools.vscode-docker）
  - Remote - Containers / Dev Containers（ms-vscode-remote.remote-containers）
  - ESLint、Prettier（可选）

**检查 Docker 是否正常**：

```bash
docker --version
docker-compose --version   # 如果你使用 compose V2，则命令可能是 docker compose version
```

---

# 2. Docker 的核心概念（快速理解）

- **Image（镜像）**：只读模板（像打包好的文件系统 + 运行时），可重用。
- **Container（容器）**：镜像的运行实例（有生命周期、可以停止/删除）。
- **Dockerfile**：定义如何从基础镜像构建你的镜像（分层缓存）。
- **Volume（卷）/Bind mount（绑定挂载）**：把主机目录或持久化卷挂载到容器里，用于持久化或开发实时同步。
- **Docker Compose**：用 YAML 描述多容器应用（例如前端、后端、数据库、缓存一起启动）。
- **Registry（仓库）**：存放镜像的地方，比如 Docker Hub、私有仓库。

---

# 3. 第一个示例：Express 应用

## 项目结构（示例）

```
demo-node-app/
├─ package.json
├─ index.js
└─ Dockerfile
```

### index.js（一个非常简单的 Express 服务）

```js
// index.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello from Dockerized Express!');
});

app.listen(port, () => console.log(`Listening on ${port}`));
```

### package.json

```json
{
  "name": "demo-node-app",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "start:debug": "node --inspect=0.0.0.0:9229 index.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
```

### Dockerfile（用于**生产**的简单示例 - 多使用缓存的写法）

```Dockerfile
# 使用官方 Node 运行时镜像（alpine 更小但有时需要编译依赖）
FROM node:18-alpine

# 工作目录
WORKDIR /usr/src/app

# 先拷贝 package* 以便利用 Docker cache（若 package.json 未变，后续 build 更快）
COPY package*.json ./

# 安装仅生产依赖
RUN npm ci --only=production

# 拷贝代码
COPY . .

# 使用非 root 用户运行（最佳实践）
USER node

EXPOSE 3000
CMD ["node", "index.js"]
```

**构建并运行**：

```bash
# 在项目根目录
docker build -t demo-node-app:1.0 .
docker run -p 3000:3000 --name demo-node -d demo-node-app:1.0
# 查看日志
docker logs -f demo-node
```

**要点**：
- 把 `COPY package*.json` 放在前面，`RUN npm ci` 之后再 `COPY . .`，可以提高构建缓存命中率。
- 容器内程序要监听 `0.0.0.0`（Express 默认监听所有地址或使用 `process.env.HOST`），否则外部无法访问。

---

# 4. 开发环境最佳实践（热重载、node_modules 问题）

开发环境经常希望：修改本地代码 -> 容器自动重载。常见做法：把代码目录 bind mount 到容器，同时在容器里运行 `nodemon`。

### Dockerfile（开发用）

```Dockerfile
FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

### docker-compose.dev.yml（示例）

```yaml
version: "3.8"
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile.dev   # 指向开发 Dockerfile（或与上面同名）
    volumes:
      - ./:/usr/src/app
      - /usr/src/app/node_modules   # 防止主机的 node_modules 覆盖容器中的 node_modules
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    command: ["npm","run","dev"]
```

**解释**：
- 第二个匿名卷 `/usr/src/app/node_modules` 可以保证容器里安装的 `node_modules` 不会被主机空目录覆盖（常见问题：使用 bind mount 会导致容器内安装的依赖在挂载时被主机空目录覆盖）。
- 如果你希望在开发中使用主机的 node_modules（极少需要），可以去掉该卷，但通常不推荐。

---

# 5. 使用 docker-compose 管理多服务（后端 + 数据库）

示例：Node + MongoDB（开发）

```yaml
version: '3.8'
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - ./:/usr/src/app
      - /usr/src/app/node_modules
    ports:
      - "3000:3000"
    environment:
      - MONGO_URL=mongodb://mongo:27017/mydb
    depends_on:
      - mongo

  mongo:
    image: mongo:6
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"

volumes:
  mongo-data:
```

**使用**：

```bash
docker compose up --build
# 或者旧版 docker-compose
# docker-compose up --build
```

在应用中把连接字符串指向 `mongodb://mongo:27017/...`（`mongo` 是服务名，docker-compose 内会自动 DNS 解析）。

---

# 6. 前端（Vite/CRA）— 开发 vs 生产 镜像（多阶段构建）

### 开发（Vite）
- Vite 默认 dev server 监听 `localhost`，所以需要以 `--host` 启动并监听 `0.0.0.0`，以便容器外能访问。

示例 `Dockerfile.dev`（Vite）

```Dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm","run","dev","--","--host"]
```

在 `package.json` 的 `dev` 脚本中常写 `vite` 或 `vite --port 5173`。

使用 bind mount 能实现热重载：

```yaml
services:
  frontend:
    build: .
    volumes:
      - ./:/app
      - /app/node_modules
    ports:
      - "5173:5173"
```

### 生产构建（多阶段 Dockerfile + nginx）

```Dockerfile
# build stage
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build   # Vite -> dist ; CRA -> build

# production stage
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
```

> 注意：CRA 输出到 `/build`，Vite 输出到 `/dist`，请根据项目调整路径。

---

# 7. 在 VSCode 中使用 Docker 和 Dev Containers

## Docker 扩展
- 可以在侧边栏看到 Containers、Images、Registries，右键快速 `Run`, `Attach Visual Studio Code`, `Open in Terminal` 等。
- 推荐用它来查看容器日志、进入容器终端、构建镜像、推送镜像到仓库。

## Remote - Containers（Dev Containers）
- 把 VSCode 的工作区放到容器中开发，容器里包含项目需要的工具和扩展，能保证环境一致。

示例 `.devcontainer/devcontainer.json`：

```json
{
  "name": "Node Dev",
  "dockerFile": "./Dockerfile.dev",
  "context": "..",
  "workspaceFolder": "/workspace",
  "extensions": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-azuretools.vscode-docker"
  ],
  "forwardPorts": [3000, 9229]
}
```

对应的 `.devcontainer/Dockerfile.dev` 可以基于 `node:18` 或使用官方 devcontainer 基础镜像 `mcr.microsoft.com/vscode/devcontainers/javascript-node:0-18`，里面已经预装常用工具。

**使用方式**：
- 打开 VSCode 命令面板（Ctrl+Shift+P） -> Remote-Containers: Reopen in Container，VSCode 会构建 devcontainer 并在容器内打开工作区。

---

# 8. 在容器中调试 Node.js（VSCode 配置）

要点：在容器内启动 Node 时开启 inspector，并把调试端口映射到主机。示例：

`package.json` 的脚本：

```json
"scripts": {
  "start:debug": "node --inspect=0.0.0.0:9229 index.js"
}
```

Dockerfile / docker-compose 中确保端口 9229 暴露并映射：

```yaml
ports:
  - "9229:9229"
```

在 VSCode 中添加 `launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Attach to Docker",
      "type": "node",
      "request": "attach",
      "address": "localhost",
      "port": 9229,
      "localRoot": "${workspaceFolder}",
      "remoteRoot": "/usr/src/app",
      "protocol": "inspector",
      "restart": true
    }
  ]
}
```

然后在容器中以 debug 模式启动，VSCode 可以 attach 到容器内的进程，设置断点、单步执行。

---

# 9. 常见问题排查与建议

**容器启动但无法访问**：
- 确认服务监听的是 `0.0.0.0`，而不是 `127.0.0.1`。
- 确认 `docker run -p` 或 docker-compose 中 `ports` 配置正确。

**node_modules 在宿主机和容器之间冲突**：
- 使用匿名卷 `- /usr/src/app/node_modules` 或在 compose 中声明命名卷，用于挂载，避免主机空目录覆盖容器内已安装依赖。

**权限问题（Linux）**：
- 如果每次都需要 `sudo docker ...`，可以把当前用户加入 `docker` 组：
  ```bash
  sudo usermod -aG docker $USER
  # 然后退出并重新登录
  ```

**镜像过大**：
- 使用多阶段构建、选择 `alpine` 或 `slim` 基础镜像、移除无用文件、用 `npm ci --only=production`。

**安全建议**：
- 生产镜像尽量以非 root 用户运行。
- 不要把敏感信息硬编码到镜像里——使用环境变量或 secret 管理（在云平台/CI 使用 secret 管理）。

---

# 10. 常用命令速查表

```text
# 构建镜像
docker build -t myapp:latest .

# 运行容器
docker run -p 3000:3000 --name myapp -d myapp:latest

# 查看容器
docker ps -a

# 查看日志
docker logs -f myapp

# 进入容器 shell
docker exec -it myapp /bin/sh   # 或 /bin/bash（取决于基础镜像）

# 停止并移除容器
docker stop myapp && docker rm myapp

# 清理未使用的镜像与容器
docker system prune -a

# compose（v2）
docker compose up --build
docker compose down
```

---

# 11. .dockerignore 示例

```
node_modules
npm-debug.log
Dockerfile*
.dockerignore
.git
.gitignore
.vscode
dist
build
.env
```

---

# 12. 推荐的项目目录结构（示例）

```
project-root/
├─ backend/
│  ├─ package.json
│  ├─ index.js
│  ├─ Dockerfile         # 生产用
│  └─ Dockerfile.dev     # 开发用（可选）
├─ frontend/
│  ├─ package.json
│  ├─ src/
│  └─ Dockerfile
├─ docker-compose.yml
├─ docker-compose.override.yml   # 可放开发专属覆盖（热重载配置）
└─ .devcontainer/
   ├─ devcontainer.json
   └─ Dockerfile
```

---

# 13. 完整示例：后端 Dockerfile + docker-compose（可直接复制）

**Dockerfile.dev（后端开发）**

```Dockerfile
FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm","run","dev"]
```

**docker-compose.yml（开发）**

```yaml
version: '3.8'
services:
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    volumes:
      - ./backend:/usr/src/app
      - /usr/src/app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development

  mongo:
    image: mongo:6
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"

volumes:
  mongo-data:
```

---

# 14. 下一步建议（给你的个性化路线）

1. 如果你想快速上手：把上面给的 Express 示例放到一个目录，按照 `Dockerfile` 构建并运行；再切换到 `Dockerfile.dev` + `docker compose up` 做热重载开发。
2. 想把前后端连起来：创建 `docker-compose.yml` 把前端的开发服务和后端、数据库放在同一网络中。
3. 想在 VSCode 里一键进入容器开发：尝试 `devcontainer`，并把常用扩展写入 `devcontainer.json`。
4. 我可以帮你生成一个包含前端（Vite）和后端（Express）的 starter 模板（含 Dockerfile、docker-compose、.devcontainer、调试配置），要我给你生成吗？

---

# 参考与延伸（小贴士）

- 用 `docker stats` 查看容器资源占用。
- CI/CD 中把构建好的镜像推到私有 registry（或 Docker Hub）并在生产环境拉取部署。
- 生产环境常用镜像管理策略：打版本 tag、扫描漏洞、自动化构建/回滚。

---

祝你学习顺利！如果你愿意，我可以：

- 直接为你生成一个完整的 starter 仓库模板（包含前端 Vite + 后端 Express + docker-compose + devcontainer + 调试配置），或者
- 帮你把你现有的项目（把目录结构发给我）一步步容器化。

你想怎么开始？

