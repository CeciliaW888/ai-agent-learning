# Project 2: Research Agent 🔎

> Build a simple research agent using LangChain that can search the web and summarize findings.

## Objective
Create an agent that takes a research question, searches for information, and produces a summary.

## Setup

```bash
cd projects/week-02
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
