🌐 [English](README.md) | 中文

# 第一周：基础知识 🧠

> 理解什么是 AI Agent、它们如何工作，以及为什么它们如此重要。

## 每日安排

### 第 1 天：什么是 AI Agent？
**时间：** 60 分钟（40 分钟视频 + 20 分钟笔记）

**观看：**
- 🎥 [What are AI Agents?](https://www.youtube.com/watch?v=F8NKVhkZZWI) — IBM Technology（15 分钟）
- 🎥 [AI Agents Explained - How They Actually Work](https://www.youtube.com/watch?v=g24tJk8Flsk) — LearnThatStack（12 分钟）
- 🎥 [DeepLearning.AI: What is an Agent?](https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/) — 第 1 课（15 分钟）

**核心概念：**
- Agent 是一个能够**感知**、**决策**和**行动**的自主 AI 系统
- Agent 使用大语言模型（LLM）作为"大脑"，并在此基础上增加工具、记忆和规划能力
- 使用 AI（聊天机器人）与 AI 使用工具（Agent）之间的区别

**笔记模板：**
```markdown
## 第 1 天笔记：什么是 AI Agent？

### 我的定义（用自己的话）：


### 关键收获：


### 让我意外的一点：


### 我还有的疑问：

```

---

### 第 2 天：PDA Loop（感知-决策-行动）
**时间：** 60 分钟（30 分钟视频 + 30 分钟画图）

**观看：**
- 🎥 [AI Agents Explained - How They Actually Work](https://www.youtube.com/watch?v=g24tJk8Flsk) — LearnThatStack — 重点关注推理循环
- 🎥 [ReAct Pattern Explained](https://www.youtube.com/watch?v=Eug2clsLtFs) — Sam Witteveen（20 分钟）

**核心概念：**
- **感知（Perceive）：** Agent 接收输入（用户查询、工具结果、环境数据）
- **决策（Decide）：** LLM 推理下一步该做什么（思维链、ReAct）
- **行动（Act）：** Agent 执行操作（调用工具、回复用户、更新记忆）
- 循环不断重复，直到任务完成

**活动：** 打开 `diagrams/01-pda-loop.excalidraw` 并追踪整个循环过程

---

### 第 3 天：Agent vs 聊天机器人 vs RAG
**时间：** 60 分钟（40 分钟视频 + 20 分钟对比）

**观看：**
- 🎥 [What are AI Agents?](https://www.youtube.com/watch?v=F8NKVhkZZWI) — IBM Technology — 对比部分
- 🎥 [What is RAG?](https://www.youtube.com/watch?v=T-D1OfcDW1M) — IBM Technology（8 分钟）

**核心概念：**

| 特性 | 聊天机器人 | RAG | Agent |
|------|-----------|-----|-------|
| 记忆 | 仅当前会话 | 检索文档 | 持久化存储 |
| 工具 | 无 | 搜索/检索 | 多种工具 |
| 规划 | 无 | 无 | 多步骤规划 |
| 自主性 | 被动响应 | 被动响应 | 主动执行 |

**活动：** 打开 `diagrams/02-agent-vs-chatbot-vs-rag.excalidraw`

---

### 第 4 天：工具与函数调用
**时间：** 60 分钟（40 分钟视频 + 20 分钟演示）

**观看：**
- 🎥 [OpenAI GPT-4 Function Calling: Unlimited Potential](https://www.youtube.com/watch?v=0lOSvOoF2to) — sentdex（25 分钟）
- 🎥 [OpenAI Function Calling](https://www.youtube.com/watch?v=aqdWSYWC_LI) —（15 分钟）

**核心概念：**
- 函数调用 = LLM 与外部工具交互的方式
- JSON Schema 定义了哪些工具可用
- LLM 决定调用**哪个**工具以及传入**什么**参数
- 结果返回后由 LLM 进行解读

**活动：** 打开 `diagrams/03-tool-calling.excalidraw`

---

### 第 5 天：记忆与上下文
**时间：** 60 分钟（40 分钟视频 + 20 分钟笔记）

**观看：**
- 🎥 [AI Agent Memory Explained](https://www.youtube.com/watch?v=X05uK0TZozM) — James Briggs（20 分钟）
- 🎥 [DeepLearning.AI: Persistence and Memory](https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/) — 第 3 课（20 分钟）

**核心概念：**
- **短期记忆：** 当前对话上下文
- **长期记忆：** 跨会话存储的知识（向量数据库、文件等）
- **工作记忆：** 任务执行过程中的中间结果
- 记忆使 Agent 能够不断学习和进步

---

### 第 6 天：探索现有 Agent 💻
**时间：** 60 分钟（动手实践）

**活动：** 查看 `projects/week-01/` 获取完整项目指南。

1. **AutoGPT**（20 分钟）— 阅读文档，观看演示
2. **BabyAGI**（15 分钟）— 理解任务分解
3. **Claude Code**（15 分钟）— 你正在使用的就是一个！分析它的工作原理
4. **总结**（10 分钟）— 对比各种架构

---

### 第 7 天：第一周回顾 + 分享 📱
**时间：** 60 分钟（30 分钟回顾 + 30 分钟发帖）

**回顾：**
- 重新审视第 1-5 天的笔记
- 更新概念图
- 找出你最大的"顿悟时刻"

**在小红书分享：**
使用 `build-in-public/week-01-post.md` 中的模板

---

## 📚 第一周资源

- [DeepLearning.AI: AI Agents in LangGraph](https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/)
- [LangChain Docs: Agents](https://docs.langchain.com/oss/python/langchain/overview)
- [Lilian Weng: LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/)
