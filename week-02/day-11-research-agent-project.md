# Day 11: Building a Research Agent — Project Start

> *"The best projects are the ones you actually use."*

## 🎯 Learning Objectives

By the end of today, you will be able to:

- Design a complete agent project from scratch
- Set up a proper project structure with tools, prompts, and agent logic
- Build a working research agent that searches, reads, and synthesizes
- Understand the full architecture of a real agent application

## 📚 Project Overview

### What We're Building

A **Research Agent** that can:
1. Take a research question from the user
2. Search the web for relevant information
3. Read and extract content from web pages
4. Synthesize findings into a structured report
5. Save the report for future reference

This is a real, useful tool — the kind of agent people actually pay for.

### Project Architecture

```
research-agent/
├── main.py              ← Entry point & interactive loop
├── agent.py             ← Agent setup & configuration
├── tools/
│   ├── __init__.py
│   ├── search.py        ← Web search tool
│   ├── reader.py        ← Webpage reader tool
│   ├── writer.py        ← File writing tool
│   └── calculator.py    ← Math tool
├── prompts/
│   └── system.py        ← System prompt
├── output/              ← Saved research reports
├── .env                 ← API keys
├── requirements.txt
└── README.md
```

### Step-by-Step Build

#### Step 1: Project Setup

```bash
mkdir research-agent && cd research-agent
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install langchain langchain-openai langgraph python-dotenv tavily-python requests beautifulsoup4

# Create structure
mkdir -p tools prompts output
touch tools/__init__.py

# Create requirements
pip freeze > requirements.txt

# API Keys
cat > .env << 'EOF'
OPENAI_API_KEY=your-openai-key
TAVILY_API_KEY=your-tavily-key
EOF
```

> 💡 **Get a free Tavily API key** at [tavily.com](https://tavily.com) — 1,000 free searches/month.

#### Step 2: Build the Tools

```python
# tools/search.py
import os
from langchain_core.tools import tool

@tool
def search_web(query: str) -> str:
    """Search the web for current information on any topic.
    
    Returns the top 3 results with titles, snippets, and URLs.
    Use for: facts, news, statistics, recent events.
    
    Args:
        query: Specific search query. More specific = better results.
               Good: "AI agent market size 2024 report"
               Bad: "AI"
    """
    try:
        from tavily import TavilyClient
        client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
        results = client.search(query, max_results=3)
        
        if not results.get("results"):
            return f"No results found for '{query}'. Try a different query."
        
        output = []
        for i, r in enumerate(results["results"], 1):
            output.append(
                f"{i}. **{r.get('title', 'Untitled')}**\n"
                f"   {r.get('content', 'No preview available')[:300]}\n"
                f"   URL: {r.get('url', 'N/A')}"
            )
        
        return "\n\n".join(output)
    
    except Exception as e:
        return f"Search error: {str(e)}. Try again with a different query."
```

```python
# tools/reader.py
import requests
from langchain_core.tools import tool

@tool
def read_webpage(url: str) -> str:
    """Read and extract the main text content from a webpage.
    
    Use this to get detailed information from a specific URL
    found in search results.
    
    Args:
        url: Full URL of the webpage (e.g., 'https://example.com/article')
    """
    try:
        from bs4 import BeautifulSoup
        
        headers = {"User-Agent": "ResearchAgent/1.0"}
        response = requests.get(url, headers=headers, timeout=15)
        
        if response.status_code != 200:
            return f"Error: Could not fetch page (status {response.status_code})"
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove scripts, styles, nav
        for tag in soup(['script', 'style', 'nav', 'footer', 'header']):
            tag.decompose()
        
        # Get text
        text = soup.get_text(separator='\n', strip=True)
        
        # Clean up and truncate
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        text = '\n'.join(lines)
        
        if len(text) > 4000:
            text = text[:4000] + f"\n\n[Truncated — original was {len(text)} characters]"
        
        return text if text else "Error: No readable content found on this page."
    
    except requests.Timeout:
        return "Error: Page took too long to load (15s timeout)."
    except Exception as e:
        return f"Error reading page: {str(e)}"
```

```python
# tools/writer.py
import os
from datetime import datetime
from langchain_core.tools import tool

@tool
def save_report(topic: str, content: str) -> str:
    """Save a research report as a markdown file.
    
    Use this after you've completed your research to save the findings.
    
    Args:
        topic: Research topic (used as the filename)
        content: Full report content in markdown format
    """
    os.makedirs("output", exist_ok=True)
    
    filename = topic.lower().replace(" ", "-").replace("/", "-")[:50]
    filename = ''.join(c for c in filename if c.isalnum() or c == '-')
    filepath = f"output/{filename}-{datetime.now().strftime('%Y%m%d')}.md"
    
    report = f"""# Research Report: {topic}

_Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}_
_Agent: Research Assistant v1.0_

---

{content}

---
_End of report_
"""
    
    with open(filepath, 'w') as f:
        f.write(report)
    
    return f"✅ Report saved to '{filepath}' ({len(report)} characters)"
```

```python
# tools/calculator.py
from langchain_core.tools import tool

@tool
def calculate(expression: str) -> str:
    """Calculate a mathematical expression.
    
    Use for any computation: arithmetic, percentages, comparisons.
    
    Args:
        expression: Math expression (e.g., '1000000 * 0.15', '(80 + 20) / 3')
    """
    safe_chars = set("0123456789+-*/.() ")
    if not all(c in safe_chars for c in expression):
        return "Error: Only use numbers and operators (+, -, *, /, parentheses)."
    try:
        result = eval(expression)
        if isinstance(result, float):
            result = round(result, 4)
        return f"{expression} = {result}"
    except ZeroDivisionError:
        return "Error: Cannot divide by zero."
    except:
        return f"Error: Could not evaluate '{expression}'."
```

#### Step 3: Define the System Prompt

```python
# prompts/system.py

RESEARCH_AGENT_PROMPT = """You are a Senior Research Analyst. Your job is to 
thoroughly research topics and produce clear, well-sourced reports.

## How You Work

1. **Understand** the research question — what exactly is being asked?
2. **Search** for information — use 2-4 targeted searches
3. **Read** the most promising sources for details
4. **Synthesize** findings into a clear, structured response
5. **Save** important findings as a report when the user asks

## Research Standards

- Search BEFORE making factual claims
- Read at least 2 sources for important facts
- Note when sources disagree
- Clearly separate facts from your analysis
- Cite sources with URLs
- Use the calculator for any math (don't estimate)

## Response Format

Structure every research response as:

### Summary
2-3 sentence overview of key findings

### Key Findings
- Bullet points with specific facts and data
- Each finding cited with source

### Analysis
Your interpretation and insights

### Sources
List of URLs consulted

### Confidence Level
Rate your confidence: High / Medium / Low (with explanation)

## Constraints

- Maximum 4 searches per question (cost control)
- If you can't find reliable information, say so
- Don't speculate beyond what sources support
- Never fabricate statistics or quotes
"""
```

#### Step 4: Wire Up the Agent

```python
# agent.py
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent

from tools.search import search_web
from tools.reader import read_webpage
from tools.writer import save_report
from tools.calculator import calculate
from prompts.system import RESEARCH_AGENT_PROMPT

load_dotenv()

def create_agent():
    """Create and return the research agent."""
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    tools = [search_web, read_webpage, save_report, calculate]
    
    agent = create_react_agent(
        llm, 
        tools, 
        prompt=RESEARCH_AGENT_PROMPT
    )
    
    return agent
```

#### Step 5: Create the Main Entry Point

```python
# main.py
"""
Research Agent — Your AI Research Assistant
Usage: python main.py
"""
from agent import create_agent

def main():
    agent = create_agent()
    
    print("🔬 Research Agent v1.0")
    print("=" * 50)
    print("Ask me to research anything! I'll search the web,")
    print("read articles, and give you a structured report.")
    print("Type 'quit' to exit.\n")
    
    messages = []
    
    while True:
        user_input = input("📝 You: ").strip()
        
        if not user_input:
            continue
        if user_input.lower() in ('quit', 'exit', 'q'):
            print("👋 Goodbye!")
            break
        
        messages.append({"role": "user", "content": user_input})
        
        print("\n🔍 Researching...\n")
        
        result = agent.invoke({"messages": messages})
        
        # Display tool usage and final response
        for msg in result["messages"][len(messages):]:
            if hasattr(msg, 'tool_calls') and msg.tool_calls:
                for tc in msg.tool_calls:
                    print(f"  🔧 {tc['name']}({list(tc['args'].values())[0][:60]}...)")
            elif msg.type == "tool":
                preview = msg.content[:80].replace('\n', ' ')
                print(f"  📋 → {preview}...")
            elif msg.type == "ai" and msg.content:
                print(f"\n🤖 Agent:\n{msg.content}\n")
        
        # Update message history
        messages = [m if isinstance(m, dict) else {"role": m.type, "content": m.content} 
                    for m in result["messages"]]

if __name__ == "__main__":
    main()
```

## ✏️ Hands-On Exercise

### Exercise 1: Build It! (30 min)

Follow the steps above to build the research agent. Your checklist:

- [ ] Project directory created
- [ ] Dependencies installed
- [ ] `.env` file with API keys
- [ ] All 4 tools implemented
- [ ] System prompt defined
- [ ] Agent wired together
- [ ] `main.py` running

### Exercise 2: Test With These Queries (15 min)

Once running, try these research questions:

1. **Simple:** "What is the current population of Australia?"
2. **Multi-step:** "Compare the GDP of Japan and South Korea. Which grew faster in the last 5 years?"
3. **Analysis:** "What are the top 3 AI agent frameworks in 2024? Compare their pros and cons."
4. **Save:** "Research the history of Python programming and save a report."

For each, note:
- How many tool calls did the agent make?
- Was the response well-structured?
- Did it follow the system prompt format?

### Exercise 3: Improve It (15 min)

Pick one improvement and implement it:
- Add a `list_reports()` tool that shows saved research
- Add conversation memory (agent remembers previous questions)
- Add a `compare(item_a, item_b)` tool that structures comparisons
- Improve error messages in the tools

## 📖 Curated Resources

### Videos
- 🎥 [Build an AI Agent From Scratch in Python](https://www.youtube.com/watch?v=bTMPwUgLZf0) — Tech With Tim — Full code tutorial
- 🎥 [LangGraph: Multi-Agent Workflows](https://www.youtube.com/watch?v=hvAPnpSfSGo) — LangChain

### Reading
- 📄 [LangGraph: Build an Agent](https://docs.langchain.com/oss/python/langgraph/overview) — Official tutorial
- 📄 [Tavily API Documentation](https://docs.tavily.com/) — For the search tool
- 📄 [BeautifulSoup Documentation](https://www.crummy.com/software/BeautifulSoup/bs4/doc/) — For the reader tool

## 🤔 Reflection Questions

1. **What was the hardest part of building this agent?** Was it the code, the prompt, or the tool design?

2. **How would you improve the agent's search strategy?** Does it search effectively or waste queries?

3. **What happens when the agent encounters a paywall or blocked website?** How would you handle that?

4. **How would you add evaluation?** How do you measure if the agent's research is actually good?

## ➡️ Next Steps

Tomorrow: **Adding Memory** — we'll give the research agent persistent memory so it can build on past research, remember user preferences, and maintain context across sessions.

**Come prepared with:** Your working research agent from today!

---

*Day 11 of 21 • [← Day 10](day-10-tool-calling-practice.md) • [Course Overview](../README.md) • [Day 12 →](day-12-adding-memory.md)*

---

## 🔎 Project: Research Agent

> Build a simple research agent using LangChain that can search the web and summarize findings.

## Objective
Create an agent that takes a research question, searches for information, and produces a summary.

## Setup

```bash
cd week-02
python -m venv venv
source venv/bin/activate
pip install langchain langchain-openai tavily-python python-dotenv
```

Create `.env`:
```
OPENAI_API_KEY=your-key-here
TAVILY_API_KEY=your-key-here  # Free at tavily.com
```

## Code: `research_agent.py`

```python
"""
Research Agent — Week 2 Project
A simple agent that searches the web and summarizes findings.
"""

import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.tools import tool
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.tools.tavily_search import TavilySearchResults

load_dotenv()

# --- Tools ---

search_tool = TavilySearchResults(max_results=3)

@tool
def save_note(content: str, filename: str = "research_notes.md") -> str:
    """Save a research note to a file."""
    with open(filename, "a") as f:
        f.write(f"\n---\n{content}\n")
    return f"Note saved to {filename}"

# --- Agent Setup ---

llm = ChatOpenAI(model="gpt-4", temperature=0)

prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a research assistant. Your job is to:
1. Search for information on the user's topic
2. Synthesize findings into clear, concise summaries
3. Save important findings as notes

Be thorough but concise. Cite your sources."""),
    MessagesPlaceholder(variable_name="chat_history", optional=True),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

tools = [search_tool, save_note]
agent = create_openai_tools_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# --- Run ---

if __name__ == "__main__":
    print("🔎 Research Agent Ready!")
    print("Type your research question (or 'quit' to exit)\n")
    
    while True:
        question = input("Research> ")
        if question.lower() in ("quit", "exit", "q"):
            break
        
        result = executor.invoke({"input": question})
        print(f"\n📋 {result['output']}\n")
```

## Daily Breakdown

### Day 11: Setup & Basic Agent
- Copy the code above
- Get API keys (OpenAI + Tavily)
- Run a test query
- Understand the agent's reasoning (verbose=True shows thoughts)

### Day 12: Add Memory
- Add `ConversationBufferMemory` for multi-turn research
- The agent should remember previous queries
- Test: "Search for X" → "Now compare that with Y"

### Day 13: Polish & Debug
- Add error handling (what if search fails?)
- Add a `summarize_notes` tool
- Test edge cases
- Clean up the output

## Deliverable
A working research agent you can demo on Day 14!
