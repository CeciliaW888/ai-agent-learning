🌐 [English](README.md) | 中文

# 第二周：动手构建 🔨

> 撸起袖子开干！构建你的第一个 AI Agent。

## 每日安排

### 第 8 天：LangChain 基础
**时间：** 60 分钟（45 分钟课程 + 15 分钟环境搭建）

**观看：**
- 🎥 [DeepLearning.AI: Functions, Tools and Agents with LangChain](https://www.deeplearning.ai/short-courses/functions-tools-agents-langchain/) — 第 1-2 课

**环境搭建：**
```bash
pip install langchain langchain-openai python-dotenv
echo "OPENAI_API_KEY=your-key-here" > .env
```

**核心概念：**
- LangChain 是一个用于构建 LLM 应用的框架
- 链（Chains）：一系列调用的序列（提示词 → LLM → 输出）
- Agent：能够选择使用哪些工具的 LLM
- 工具（Tools）：Agent 可以调用的函数

---

### 第 9 天：Agent 提示词工程
**时间：** 60 分钟（40 分钟视频 + 20 分钟练习）

**观看：**
- 🎥 [DeepLearning.AI: Functions, Tools and Agents](https://www.deeplearning.ai/short-courses/functions-tools-agents-langchain/) — 第 3 课
- 🎥 [OpenAI Function Calling Tutorial](https://www.youtube.com/watch?v=aqdWSYWC_LI) —（20 分钟）

**核心概念：**
- 系统提示词定义了 Agent 的个性和约束条件
- ReAct 提示：思考（Thought）→ 行动（Action）→ 观察（Observation）循环
- 少样本示例帮助 Agent 理解工具用法
- 安全护栏：定义 Agent 应该做和不应该做的事

**练习：** 为一个研究助手 Agent 编写系统提示词

---

### 第 10 天：工具调用深入探索
**时间：** 60 分钟（30 分钟视频 + 30 分钟编码）

**观看：**
- 🎥 [DeepLearning.AI: Functions, Tools and Agents](https://www.deeplearning.ai/short-courses/functions-tools-agents-langchain/) — 第 4-5 课

**跟着写代码：**
```python
from langchain.tools import tool
from langchain_openai import ChatOpenAI

@tool
def search_web(query: str) -> str:
    """Search the web for information."""
    # Your search implementation
    return f"Results for: {query}"

@tool
def calculate(expression: str) -> str:
    """Calculate a math expression."""
    return str(eval(expression))

# Create agent with tools
llm = ChatOpenAI(model="gpt-4")
tools = [search_web, calculate]
```

---

### 第 11 天：构建搜索 Agent 💻
**时间：** 60 分钟（项目启动）

**项目：** 构建一个能够搜索网络并总结研究结果的 Agent。

查看 `projects/week-02/` 获取完整项目指南。

**今日目标：**
1. 搭建项目结构
2. 定义工具（网络搜索、摘要生成）
3. 使用 LangChain 创建 Agent
4. 用简单查询进行测试

---

### 第 12 天：为 Agent 添加记忆
**时间：** 60 分钟（项目继续）

**观看：**
- 🎥 [DeepLearning.AI: AI Agents in LangGraph](https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/) — 持久化课程

**今日目标：**
1. 添加对话记忆（记住之前的查询）
2. 添加笔记工具（保存研究发现）
3. 测试多轮研究对话

---

### 第 13 天：测试与调试 Agent
**时间：** 60 分钟（项目完善）

**观看：**
- 🎥 [LangSmith for Agent Debugging](https://www.youtube.com/watch?v=tFXm5ijih98) —（15 分钟）

**今日目标：**
1. 添加错误处理（工具调用失败怎么办？）
2. 添加日志记录（追踪 Agent 的推理过程）
3. 测试边界情况
4. 记录你构建的内容

---

### 第 14 天：第二周回顾 + 分享 📱
**时间：** 60 分钟（30 分钟回顾 + 30 分钟发帖）

**回顾：**
- 演示你的研究 Agent
- 什么进展顺利？什么比预期更难？
- 你会如何改进？

**在小红书分享：**
使用 `build-in-public/week-02-post.md` 中的模板

---

## 📚 第二周资源

- [LangChain Python Docs](https://docs.langchain.com/oss/python/langchain/overview)
- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [LangGraph Documentation](https://docs.langchain.com/oss/python/langgraph/overview)
- [Tavily Search API](https://tavily.com/)（免费套餐可用于搜索工具）
