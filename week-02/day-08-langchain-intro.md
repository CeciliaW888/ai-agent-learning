# Day 8: LangChain Introduction

> *"The best way to learn is by doing. The second best way is by building."*

## 🎯 Learning Objectives

By the end of today, you will be able to:

- Understand what LangChain is and why it exists
- Set up a development environment for agent building
- Build a simple chain (prompt → LLM → output)
- Create a basic agent with tools using LangChain
- Know the difference between chains, agents, and graphs

## 📚 Core Concepts

### Why This Matters

Last week you learned the theory. Now it's time to build. LangChain is the most popular framework for building LLM-powered applications, including agents. It handles the plumbing — tool execution, prompt management, memory — so you can focus on the logic.

Think of it like this: you *could* build a website with raw HTTP sockets, but you'd use React or Django instead. LangChain is the React of AI agents.

### What is LangChain?

LangChain is a Python (and JavaScript) framework that provides:

1. **LLM abstractions** — swap between OpenAI, Anthropic, local models with the same code
2. **Prompt templates** — reusable, parameterized prompts
3. **Tool integration** — easy way to give LLMs tools
4. **Agent framework** — the PDA loop, built in
5. **Memory systems** — conversation and persistent memory
6. **LangGraph** — advanced graph-based agent workflows (we'll cover this in Week 3)

### The LangChain Ecosystem

```
LangChain Ecosystem:
├── langchain-core       ← Base abstractions (prompts, LLMs, tools)
├── langchain            ← Chains, agents, high-level APIs
├── langchain-openai     ← OpenAI integration
├── langchain-anthropic  ← Anthropic integration
├── langchain-community  ← Community integrations (100+ tools)
├── langgraph            ← Graph-based agent workflows
└── langsmith            ← Tracing, debugging, evaluation
```

### Setup

```bash
# Create a project directory
mkdir my-first-agent && cd my-first-agent

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install langchain langchain-openai python-dotenv

# Create .env file for your API key
echo "OPENAI_API_KEY=your-key-here" > .env
```

```python
# verify_setup.py — Run this to confirm everything works
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

llm = ChatOpenAI(model="gpt-4o-mini")  # Cheaper model for testing
response = llm.invoke("Say hello in 3 words.")
print(response.content)
# Expected output: Something like "Hello there, friend!"
```

### Building Block 1: The LLM

```python
from langchain_openai import ChatOpenAI

# Create an LLM instance
llm = ChatOpenAI(
    model="gpt-4o-mini",    # Model name
    temperature=0,           # 0 = deterministic, 1 = creative
)

# Simple invocation
response = llm.invoke("What is an AI agent?")
print(response.content)
```

**Swapping providers is easy:**
```python
from langchain_anthropic import ChatAnthropic
llm = ChatAnthropic(model="claude-sonnet-4-20250514")  # Same .invoke() API!
```

### Building Block 2: Prompt Templates

Instead of hardcoding prompts, use templates:

```python
from langchain_core.prompts import ChatPromptTemplate

# Create a reusable template
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant who explains {topic} in simple terms."),
    ("user", "{question}")
])

# Fill in the blanks
formatted = prompt.invoke({
    "topic": "AI agents",
    "question": "What is function calling?"
})

# Send to LLM
response = llm.invoke(formatted)
print(response.content)
```

### Building Block 3: Chains

A **chain** connects components together — prompt → LLM → output parser:

```python
from langchain_core.output_parsers import StrOutputParser

# The | operator creates a chain (like Unix pipes)
chain = prompt | llm | StrOutputParser()

# Run the chain
result = chain.invoke({
    "topic": "machine learning",
    "question": "What is overfitting?"
})
print(result)  # Clean string output
```

**Why chains matter:** They're composable. You can build complex workflows by piping simple components together.

### Building Block 4: Tools

This is where it gets exciting. Let's give an LLM the ability to do things:

```python
from langchain_core.tools import tool

@tool
def search_web(query: str) -> str:
    """Search the web for current information about any topic."""
    # In production, use Tavily or Brave Search API
    # For now, we'll simulate
    return f"Search results for '{query}': AI agents are autonomous systems..."

@tool 
def calculate(expression: str) -> str:
    """Calculate a mathematical expression. Use for any math computation."""
    try:
        result = eval(expression)  # ⚠️ Use a safe parser in production!
        return f"Result: {result}"
    except Exception as e:
        return f"Error: {e}"

@tool
def get_current_date() -> str:
    """Get today's date. Use when user asks about current date."""
    from datetime import date
    return str(date.today())

# List your tools
tools = [search_web, calculate, get_current_date]
```

**Notice the docstrings!** LangChain uses them as the tool descriptions for the LLM. Write them carefully — they directly affect when and how the LLM uses each tool.

### Building Block 5: Agents

Now let's combine everything into an actual agent:

```python
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent

# 1. Create the LLM
llm = ChatOpenAI(model="gpt-4o-mini")

# 2. Define tools
@tool
def search(query: str) -> str:
    """Search the web for information."""
    return f"Results for '{query}': [simulated search results]"

@tool
def calculate(expression: str) -> str:
    """Calculate a math expression."""
    import ast
    return str(ast.literal_eval(expression))

tools = [search, calculate]

# 3. Create the agent (this gives you the full PDA loop!)
agent = create_react_agent(llm, tools)

# 4. Run it!
result = agent.invoke({
    "messages": [{"role": "user", "content": "What's 15% tip on a $85 dinner?"}]
})

# Print the conversation
for message in result["messages"]:
    print(f"{message.type}: {message.content}")
```

**What `create_react_agent` does under the hood:**
1. Formats the tools into JSON schemas for the LLM
2. Runs the PDA loop (perceive → decide → act → repeat)
3. Handles tool execution
4. Manages the message history
5. Returns when the LLM gives a final answer

### Chains vs Agents vs Graphs

| Feature | Chain | Agent | Graph (LangGraph) |
|---------|-------|-------|--------------------|
| **Flow** | Linear (A → B → C) | Loop (decide → act → repeat) | Custom (any shape) |
| **Flexibility** | Fixed path | LLM decides path | Developer designs path |
| **Use case** | Simple pipelines | Open-ended tasks | Complex workflows |
| **Predictability** | High | Medium | High |
| **Complexity** | Low | Medium | High |

- **Chain:** "Always do A, then B, then C" — like an assembly line
- **Agent:** "Figure out what to do and keep going" — like a freelancer
- **Graph:** "Follow this specific workflow with branches and conditions" — like a flowchart

### Common Gotchas

⚠️ **Version confusion:** LangChain has evolved a lot. Make sure you're reading docs for the latest version (v0.3+). Many tutorials use outdated APIs.

⚠️ **The `@tool` decorator requires docstrings.** If you forget the docstring, the LLM won't know what the tool does.

⚠️ **Temperature matters.** For agents, use `temperature=0` for reliability. Higher temperatures make agents unpredictable.

⚠️ **Start with `gpt-4o-mini` for testing.** It's 10-20x cheaper than GPT-4. Switch to GPT-4 only when you need better reasoning.

⚠️ **Don't fight the framework.** If you're writing a lot of custom code around LangChain, you might be doing it wrong — or you might not need LangChain.

## 🔑 Key Terminology

| Term | Definition |
|------|-----------|
| **LangChain** | Python/JS framework for building LLM applications |
| **Chain** | A linear pipeline of components (prompt → LLM → parser) |
| **Agent** | An LLM in a loop that decides which tools to use |
| **Tool** | A function the agent can call, defined with `@tool` |
| **LangGraph** | Graph-based framework for complex agent workflows |
| **LangSmith** | Debugging and evaluation platform for LLM apps |
| **Prompt Template** | Reusable prompt with variable placeholders |
| **Output Parser** | Converts LLM output into structured data |

## 💻 Full Working Example

```python
"""
Your first LangChain agent — a research assistant.
Save as: first_agent.py
Run: python first_agent.py
"""
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent

load_dotenv()

# === Define Tools ===

@tool
def search_web(query: str) -> str:
    """Search the web for current information. Use for any factual question
    that requires up-to-date data."""
    # Replace with real search API (Tavily, Brave, etc.)
    return f"""Search results for '{query}':
    1. AI agents are autonomous systems powered by LLMs
    2. The market for AI agents is expected to grow significantly
    3. Key frameworks include LangChain, CrewAI, and AutoGen"""

@tool
def calculate(expression: str) -> str:
    """Evaluate a mathematical expression. Input should be a valid
    Python math expression like '2 + 2' or '100 * 0.15'."""
    try:
        result = eval(expression)
        return f"{expression} = {result}"
    except Exception as e:
        return f"Error calculating '{expression}': {e}"

@tool
def save_note(title: str, content: str) -> str:
    """Save a note to a file for later reference. Use when the user
    wants to save or record information."""
    filename = f"notes/{title.lower().replace(' ', '_')}.md"
    # In production, actually write the file
    return f"Note saved as '{filename}'"

# === Create Agent ===
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
tools = [search_web, calculate, save_note]
agent = create_react_agent(llm, tools)

# === Interactive Loop ===
def chat():
    print("🤖 Research Assistant (type 'quit' to exit)")
    print("=" * 50)
    
    while True:
        user_input = input("\nYou: ").strip()
        if user_input.lower() in ("quit", "exit", "q"):
            print("Goodbye! 👋")
            break
        
        result = agent.invoke({
            "messages": [{"role": "user", "content": user_input}]
        })
        
        # Print tool calls and final response
        for msg in result["messages"][1:]:  # Skip the user message
            if hasattr(msg, 'tool_calls') and msg.tool_calls:
                for tc in msg.tool_calls:
                    print(f"  🔧 Using: {tc['name']}({tc['args']})")
            elif msg.type == "tool":
                print(f"  📋 Result: {msg.content[:100]}...")
            elif msg.type == "ai" and msg.content:
                print(f"\n🤖 Agent: {msg.content}")

if __name__ == "__main__":
    chat()
```

## ✏️ Hands-On Exercise

### Exercise 1: Setup & Hello World (15 min)

1. Create a new project directory
2. Install LangChain packages
3. Create a `.env` file with your API key
4. Run the verify_setup.py script above
5. Try changing the model and temperature

### Exercise 2: Build a Chain (15 min)

Create a chain that:
1. Takes a topic as input
2. Generates 3 quiz questions about that topic
3. Formats the output as a numbered list

```python
# Starter code
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a quiz master. Generate exactly 3 quiz questions."),
    ("user", "Create quiz questions about: {topic}")
])

# Your code here: create the chain and invoke it
```

### Exercise 3: Add a Custom Tool (15 min)

Add a new tool to the full example above. Ideas:
- `get_time()` — returns current time
- `translate(text, language)` — translates text
- `word_count(text)` — counts words in text

Make sure to write a clear docstring!

## 📖 Curated Resources

### Videos
- 🎥 [LangChain Explained in 13 Minutes](https://www.youtube.com/watch?v=aywZrzNaKjs) — Rabbitmetrics — Quick overview
- 🎥 [DeepLearning.AI: Functions, Tools and Agents with LangChain](https://www.deeplearning.ai/short-courses/functions-tools-agents-langchain/) — Lessons 1-2 (free course)
- 🎥 [Build an AI Agent From Scratch in Python](https://www.youtube.com/watch?v=bTMPwUgLZf0) — Tech With Tim — Code walkthrough

### Reading
- 📄 [LangChain Python Docs](https://docs.langchain.com/oss/python/langchain/overview) — Official documentation
- 📄 [LangChain Concepts: Agents](https://docs.langchain.com/oss/python/langchain/overview) — Conceptual guide
- 📄 [LangGraph Quick Start](https://docs.langchain.com/oss/python/langgraph/overview) — Modern agent building

### GitHub
- ⭐ [LangChain](https://github.com/langchain-ai/langchain) — Main repo
- ⭐ [LangGraph](https://github.com/langchain-ai/langgraph) — Graph-based agents
- ⭐ [LangChain Templates](https://github.com/langchain-ai/langchain/tree/master/templates) — Starter projects

## 🤔 Reflection Questions

1. **What does LangChain give you that raw API calls don't?** Is the abstraction worth the added dependency?

2. **Why is the `@tool` decorator's docstring so important?** What happens if it's vague?

3. **When would you use a chain vs an agent?** Give a concrete example of each.

4. **What's the advantage of LangChain's provider abstraction?** Why is swapping between OpenAI/Anthropic/local useful?

5. **How does `create_react_agent` implement the PDA loop from Day 2?** Can you trace the connection?

## ➡️ Next Steps

Tomorrow: **Prompt Engineering for Agents** — how to write system prompts that make agents reliable, focused, and effective. The quality of your prompts determines the quality of your agent.

**Come prepared with:** Your working LangChain setup from today's exercises. We'll build on it tomorrow!

---

*Day 8 of 21 • [← Day 7](../week-01/day-07-week-review.md) • [Course Overview](../README.md) • [Day 9 →](day-09-prompt-engineering.md)*
