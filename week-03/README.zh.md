🌐 [English](README.md) | 中文

# 第三周：进阶模式 🚀

> 多 Agent 系统、生产级模式，以及你的毕业项目。

## 每日安排

### 第 15 天：多 Agent 架构
**时间：** 60 分钟（45 分钟视频 + 15 分钟笔记）

**观看：**
- 🎥 [Multi-Agent Systems Explained](https://www.youtube.com/watch?v=hvAPnpSfSGo) — LangChain（15 分钟）
- 🎥 [DeepLearning.AI: AI Agents in LangGraph](https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/) — 多 Agent 课程
- 🎥 [CrewAI: Multi-Agent Framework](https://www.youtube.com/watch?v=sPzc6hMg7So) —（15 分钟）

**核心概念：**
- **监督者模式（Supervisor）：** 一个 Agent 协调其他 Agent
- **对等模式（Peer）：** Agent 之间平等协作
- **流水线模式（Pipeline）：** Agent 按顺序传递工作
- **辩论模式（Debate）：** Agent 之间相互质疑推理过程

**活动：** 打开 `diagrams/04-multi-agent.excalidraw`

---

### 第 16 天：Agent 通信模式
**时间：** 60 分钟（40 分钟视频 + 20 分钟笔记）

**观看：**
- 🎥 [Agent Communication Protocols](https://www.youtube.com/watch?v=hvAPnpSfSGo) — LangChain（20 分钟）
- 🎥 [DeepLearning.AI: Multi-Agent Workflows](https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/) — 多 Agent 课程（20 分钟）

**核心概念：**
- Agent 之间的消息传递
- 共享状态 vs 隔离状态
- 交接协议（何时传递控制权）
- 多 Agent 系统中的错误恢复

---

### 第 17 天：生产级模式与安全
**时间：** 60 分钟（40 分钟视频 + 20 分钟笔记）

**观看：**
- 🎥 [CrewAI: Multi-Agent Framework](https://www.youtube.com/watch?v=sPzc6hMg7So) — 生产级模式（20 分钟）
- 🎥 [OpenAI Function Calling Tutorial](https://www.youtube.com/watch?v=aqdWSYWC_LI) — 工具安全模式（20 分钟）

**核心概念：**
- **人机协作（Human-in-the-loop）：** 何时需要请求人工审批
- **速率限制：** 不要让 Agent 失控运行
- **沙箱隔离：** 限制工具的操作范围
- **监控：** 追踪 Agent 的决策和成本
- **降级策略：** 优雅的错误处理

---

### 第 18 天：毕业项目启动 💻
**时间：** 60 分钟（项目启动）

**项目：** 构建一个多 Agent 内容创作流水线。

查看 `projects/week-03/` 获取完整项目指南。

**系统架构：**
- **研究 Agent：** 查找某个主题的相关信息
- **写作 Agent：** 根据研究结果创作内容
- **编辑 Agent：** 审查并改进内容
- **协调器：** 编排整个流水线

**今日目标：**
1. 搭建项目结构
2. 定义 Agent 角色和工具
3. 构建协调器逻辑

---

### 第 19 天：毕业项目：构建与集成
**时间：** 60 分钟（项目继续）

**今日目标：**
1. 实现三个子 Agent
2. 连接它们之间的通信
3. 用一个简单主题测试完整流水线

---

### 第 20 天：毕业项目：打磨与部署
**时间：** 60 分钟（项目收尾）

**今日目标：**
1. 添加错误处理和日志记录
2. 添加简单的命令行界面
3. 用 3 个不同主题进行测试
4. 编写架构文档

---

### 第 21 天：课程回顾 + 最终分享 🎉
**时间：** 60 分钟（30 分钟回顾 + 30 分钟庆祝发帖）

**回顾：**
- 这三周你学到了什么？
- 你最大的"前后对比"变化是什么？
- 接下来你想构建什么？
- 更新 README.md 中的学习进度看板

**在小红书分享：**
使用 `build-in-public/week-03-post.md` 中的模板

**🎉 你做到了！21 天，21 小时，从 AI 用户蜕变为 Agent 开发者。**

---

## 📚 第三周资源

- [CrewAI Documentation](https://docs.crewai.com/)
- [AutoGen: Multi-Agent Framework](https://microsoft.github.io/autogen/)
- [LangGraph Multi-Agent Tutorial](https://langchain-ai.github.io/langgraph/tutorials/multi_agent/)
- [Anthropic: Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
