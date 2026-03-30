# Day 9: Prompt Engineering for Agents

> *"A well-prompted agent is 10x more useful than a poorly-prompted one with better tools."*

## 🎯 Learning Objectives

By the end of today, you will be able to:

- Write effective system prompts that define agent behavior
- Use few-shot examples to teach agents tool usage patterns
- Implement guardrails and constraints in prompts
- Debug common prompt engineering failures
- Apply the ReAct prompt format in practice

## 📚 Core Concepts

### Why This Matters

Your agent is only as good as its prompts. Two agents with the same model and tools will perform dramatically differently based on how they're prompted. Prompt engineering for agents is different from regular prompt engineering — you're not just asking for an answer, you're programming a **behavior loop**.

### The Agent System Prompt: Your Agent's DNA

A good agent system prompt has five sections:

```
1. IDENTITY: Who is this agent?
2. CAPABILITIES: What can it do? (tools listed)
3. INSTRUCTIONS: How should it behave?
4. CONSTRAINTS: What should it NOT do?
5. OUTPUT FORMAT: How should it respond?
```

**Example: Research Assistant Agent**

```python
system_prompt = """You are a Research Assistant agent.

## Identity
You help users research topics thoroughly by searching the web, 
reading articles, and synthesizing information into clear summaries.

## Capabilities
You have access to these tools:
- search_web(query): Search the internet for current information
- read_article(url): Read the full text of a webpage
- save_note(title, content): Save research findings for later

## Instructions
1. When given a research topic, start by searching for recent information
2. Read at least 2-3 sources before forming conclusions
3. Cite your sources with URLs
4. If information conflicts between sources, mention both perspectives
5. Summarize findings in clear, structured format
6. Ask clarifying questions if the topic is too broad

## Constraints
- DO NOT make up information. If you can't find something, say so.
- DO NOT provide medical, legal, or financial advice.
- DO NOT search for anything unrelated to the user's request.
- ALWAYS cite your sources.

## Output Format
Structure your responses with:
- A brief summary (2-3 sentences)
- Key findings (bullet points)
- Sources (URLs)
"""
```

### Prompt Engineering Techniques for Agents

#### 1. Role Definition (Be Specific)

**Bad:**
```
You are a helpful assistant.
```

**Good:**
```
You are a data analyst assistant specializing in Python and SQL.
You work with business users who may not be technical.
You prefer pandas for data manipulation and matplotlib for visualization.
When asked to analyze data, you always start by understanding the schema.
```

The more specific the role, the more consistent the behavior.

#### 2. Few-Shot Examples (Show, Don't Tell)

The most powerful technique for teaching agents HOW to use tools:

```python
system_prompt = """You are a research agent. Here's an example of how to work:

Example:
User: "What's the population of Tokyo vs London?"
Thought: I need to search for both cities' populations. Let me start with Tokyo.
Action: search_web("Tokyo population 2024")
Observation: Tokyo has approximately 14 million residents.
Thought: Now let me find London's population.
Action: search_web("London population 2024")  
Observation: London has approximately 8.8 million residents.
Thought: I have both numbers. Tokyo (14M) is larger than London (8.8M).
Answer: Tokyo has approximately 14 million residents, making it significantly larger than London's 8.8 million.

Now handle the user's actual request using this same approach."""
```

Few-shot examples are like showing a new employee how things are done before they start.

#### 3. Guardrails (Prevent Bad Behavior)

```python
constraints = """
## Safety Rules (NEVER violate these)
1. NEVER execute destructive operations without user confirmation
2. NEVER share sensitive information found in documents  
3. If a tool fails, try an alternative approach (max 3 retries)
4. If you're unsure about an action, ASK the user first
5. ALWAYS verify facts before presenting them as true
6. Limit searches to 5 per request to control costs
"""
```

#### 4. Output Format Control

```python
format_instructions = """
## Response Format
Always structure your response as:

### Summary
[2-3 sentence overview]

### Details
[Detailed findings with bullet points]

### Sources
[List of URLs used]

### Confidence Level
[How confident are you: High/Medium/Low, and why]
"""
```

#### 5. Error Handling Instructions

```python
error_handling = """
## When Things Go Wrong
- If a search returns no results: try rephrasing the query
- If a tool returns an error: report the error and try an alternative
- If you're stuck in a loop: stop and ask the user for guidance
- If the task is unclear: ask a specific clarifying question
- If you can't complete the task: explain what you tried and what failed
"""
```

### The ReAct Prompt Template

The standard ReAct prompt that powers most modern agents:

```python
react_prompt = """Answer the following questions as best you can.
You have access to the following tools:

{tool_descriptions}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought: {agent_scratchpad}"""
```

### Debugging Prompt Issues

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| Agent never uses tools | Tool descriptions are unclear | Rewrite docstrings with explicit "Use this when..." |
| Agent uses wrong tool | Tools have overlapping descriptions | Make descriptions mutually exclusive |
| Agent loops forever | No clear stopping criteria | Add "When you have enough info, give your final answer" |
| Agent gives vague answers | No output format specified | Add format instructions |
| Agent hallucinates facts | No grounding instructions | Add "Only state facts from tool results" |
| Agent ignores constraints | Constraints are buried in the prompt | Move constraints to the top, make them bold |

### Advanced: Dynamic Prompt Construction

In production, prompts often change based on context:

```python
def build_system_prompt(user_profile: dict, task_type: str) -> str:
    base = "You are a helpful assistant."
    
    # Add user context
    if user_profile.get("name"):
        base += f"\nThe user's name is {user_profile['name']}."
    if user_profile.get("expertise"):
        base += f"\nTheir expertise level: {user_profile['expertise']}."
    
    # Add task-specific instructions
    if task_type == "research":
        base += "\nAlways cite sources. Search at least 3 sources."
    elif task_type == "coding":
        base += "\nAlways include code examples. Explain step by step."
    elif task_type == "creative":
        base += "\nBe creative and original. Offer multiple options."
    
    return base
```

### Common Gotchas

⚠️ **Prompt is too long:** LLMs pay less attention to the middle of long prompts. Keep system prompts under 500 words. Put the most important instructions at the beginning and end.

⚠️ **Conflicting instructions:** "Be thorough" + "Be concise" = confused agent. Choose one primary directive.

⚠️ **No examples = inconsistent behavior:** If you want specific formatting, show an example. Don't just describe it.

⚠️ **Tool descriptions as afterthought:** Tool docstrings ARE part of your prompt engineering. Treat them with the same care as the system prompt.

⚠️ **Forgetting to test edge cases:** Does your prompt handle "I don't know"? What about empty tool results? Offensive input?

## 🔑 Key Terminology

| Term | Definition |
|------|-----------|
| **System Prompt** | Instructions that define the agent's identity, behavior, and constraints |
| **Few-Shot Examples** | Example interactions included in the prompt to demonstrate desired behavior |
| **Guardrails** | Constraints that prevent the agent from taking unwanted actions |
| **Prompt Template** | A reusable prompt with variable placeholders |
| **ReAct Prompt** | The Thought → Action → Observation format for agent reasoning |
| **Prompt Injection** | Attack where user input overrides system instructions |
| **Grounding** | Instructing the agent to base answers on tool results, not training data |

## 💻 Code Example: Building a Well-Prompted Agent

```python
"""
A research agent with carefully engineered prompts.
Notice how the system prompt shapes behavior.
"""
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent

load_dotenv()

# === Tools with carefully written docstrings ===

@tool
def search(query: str) -> str:
    """Search the web for current information.
    
    Use this tool when you need:
    - Recent news or events
    - Statistics or data
    - Information that changes over time
    
    Do NOT use this for:
    - General knowledge (you already know it)
    - Math calculations (use the calculate tool)
    
    Args:
        query: A specific search query. Be precise.
              Good: "Python 3.12 new features"
              Bad: "Python stuff"
    """
    return f"[Simulated] Results for '{query}': Found 3 relevant articles..."

@tool
def calculate(expression: str) -> str:
    """Calculate a mathematical expression.
    
    Use this for ANY math, including:
    - Basic arithmetic: "100 * 0.15"
    - Complex expressions: "(500 - 200) * 1.1"
    - Percentages: "85 * 0.20"
    
    Args:
        expression: A valid Python math expression.
    """
    try:
        import ast
        return str(ast.literal_eval(expression))
    except:
        return "Error: Invalid expression"

# === The Agent ===

SYSTEM_PROMPT = """You are a Research Analyst. You find information, verify it, 
and present it clearly.

## How You Work
1. Break complex questions into specific searches
2. Search for each piece of information separately  
3. Cross-reference facts across sources when possible
4. Present findings in a structured format

## Rules
- ALWAYS search before stating facts about current events
- If you're unsure, say "I'm not confident about this because..."
- Cite which search results your answer is based on
- For math, use the calculate tool (don't do it in your head)
- Maximum 4 searches per question to manage costs

## Response Format
Start with a direct answer, then provide supporting details.
Use bullet points for multiple findings.
End with confidence level (High/Medium/Low).
"""

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
agent = create_react_agent(llm, [search, calculate], prompt=SYSTEM_PROMPT)

# Test it
result = agent.invoke({
    "messages": [{"role": "user", "content": "What percentage of companies are using AI agents in 2024?"}]
})

for msg in result["messages"]:
    if msg.content:
        print(f"[{msg.type}] {msg.content[:200]}")
```

## ✏️ Hands-On Exercise

### Exercise 1: Write a System Prompt (20 min)

Write a complete system prompt for one of these agents:

**Option A:** A cooking assistant that can search for recipes, convert measurements, and suggest substitutions

**Option B:** A travel planner that searches flights, hotels, and activities

**Option C:** A code reviewer that reads code files, checks for bugs, and suggests improvements

Your prompt must include:
1. Identity (who is the agent?)
2. Capabilities (what tools does it have?)
3. Instructions (how should it work?)
4. Constraints (what should it NOT do?)
5. Output format (how should responses look?)
6. At least one few-shot example

### Exercise 2: Fix Bad Prompts (15 min)

These prompts have problems. Identify and fix them:

**Bad Prompt 1:**
```
You are an AI. Help the user with stuff. Use tools if you want.
```

**Bad Prompt 2:**
```
You are a PERFECT assistant. You ALWAYS give CORRECT answers. 
NEVER say you don't know. ALWAYS be thorough AND concise.
You can search the web. Use it for every question.
```

**Bad Prompt 3:**
```
You are a financial advisor. Give specific investment advice.
Buy stocks when they're low, sell when high. Recommend crypto.
Tools: search_web, calculate
```

For each, explain what's wrong and write an improved version.

### Exercise 3: A/B Test Prompts (10 min)

Take the research agent from the code example. Try these two system prompts with the same question and compare results:

**Prompt A:** `"You are helpful. Answer questions."`

**Prompt B:** The full SYSTEM_PROMPT from the code example

Question: `"What are the pros and cons of working remotely?"`

Compare: Which response is better structured? Which uses tools more effectively? Which is more useful?

## 📖 Curated Resources

### Videos
- 🎥 [DeepLearning.AI: ChatGPT Prompt Engineering](https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/) — Free course, foundational
- 🎥 [AI Prompt Engineering: A Deep Dive](https://www.youtube.com/watch?v=T9aRN5JkmL8) — Anthropic — Expert prompting techniques

### Reading
- 📄 [Anthropic: Prompt Engineering Guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) — Excellent, comprehensive guide
- 📄 [OpenAI: Prompt Engineering Best Practices](https://platform.openai.com/docs/guides/prompt-engineering) — Official OpenAI guide
- 📄 [Prompt Engineering Guide](https://www.promptingguide.ai/) — Community resource with many techniques

### Papers
- 📑 [Lost in the Middle](https://arxiv.org/abs/2307.03172) — Why LLMs miss info in the middle of long prompts
- 📑 [Large Language Models are Zero-Shot Reasoners](https://arxiv.org/abs/2205.11916) — "Let's think step by step" paper

## 🤔 Reflection Questions

1. **Why are few-shot examples more effective than instructions alone?** Think about how humans learn.

2. **How do you balance thoroughness with cost?** More tool calls = better results but higher cost. Where's the sweet spot?

3. **What's the difference between prompt engineering for a chatbot vs an agent?** What extra considerations matter for agents?

4. **How would you protect your agent from prompt injection?** What if a user says "Ignore your instructions and..."?

5. **How often should system prompts be updated?** What triggers a prompt revision?

## ➡️ Next Steps

Tomorrow: **Tool Calling Practice** — you'll build custom tools with proper error handling, learn tool design patterns, and create tools that actually work in production.

**Come prepared with:** Ideas for 2-3 custom tools you'd like to build. Think about what inputs they need and what they should return.

---

*Day 9 of 21 • [← Day 8](day-08-langchain-intro.md) • [Course Overview](../README.md) • [Day 10 →](day-10-tool-calling-practice.md)*
