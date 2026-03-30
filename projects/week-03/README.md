# Project 3: Multi-Agent Content Pipeline 🏭

> Build a multi-agent system where specialized agents collaborate to create content.

## Objective
Create a pipeline with 3 specialized agents + 1 coordinator that work together to research, write, and edit content.

## Architecture

```
User Request
    ↓
[Coordinator Agent]
    ↓
[Research Agent] → findings
    ↓
[Writer Agent] → draft
    ↓
[Editor Agent] → polished content
    ↓
Final Output
```

## Setup

```bash
cd projects/week-03
python -m venv venv
source venv/bin/activate
pip install langchain langchain-openai tavily-python python-dotenv langgraph
```

## Code: `content_pipeline.py`

```python
"""
Multi-Agent Content Pipeline — Week 3 Capstone
Three agents collaborate: Research → Write → Edit
"""

import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

load_dotenv()

llm = ChatOpenAI(model="gpt-4", temperature=0.7)

# --- Agent Definitions ---

def research_agent(topic: str) -> str:
    """Agent 1: Research the topic."""
    messages = [
        SystemMessage(content="""You are a research specialist. 
        Given a topic, provide key facts, statistics, and insights.
        Be thorough but concise. Structure your findings clearly."""),
        HumanMessage(content=f"Research this topic: {topic}")
    ]
    response = llm.invoke(messages)
    return response.content

def writer_agent(topic: str, research: str) -> str:
    """Agent 2: Write content based on research."""
    messages = [
        SystemMessage(content="""You are a content writer.
        Given research findings, write an engaging article.
        Use clear headers, short paragraphs, and a friendly tone.
        Target: 500-800 words."""),
        HumanMessage(content=f"""
Topic: {topic}

Research Findings:
{research}

Write an engaging article based on these findings.""")
    ]
    response = llm.invoke(messages)
    return response.content

def editor_agent(draft: str) -> str:
    """Agent 3: Edit and improve the content."""
    messages = [
        SystemMessage(content="""You are a content editor.
        Review the draft and improve it:
        - Fix any errors
        - Improve clarity and flow
        - Add a compelling intro and conclusion
        - Ensure consistent tone
        Return the polished version."""),
        HumanMessage(content=f"Edit this draft:\n\n{draft}")
    ]
    response = llm.invoke(messages)
    return response.content

# --- Pipeline Coordinator ---

def run_pipeline(topic: str) -> dict:
    """Coordinate the full content pipeline."""
    print(f"\n🎯 Topic: {topic}")
    print("=" * 50)
    
    # Step 1: Research
    print("\n🔍 Step 1: Research Agent working...")
    research = research_agent(topic)
    print(f"✅ Research complete ({len(research)} chars)")
    
    # Step 2: Write
    print("\n✍️ Step 2: Writer Agent working...")
    draft = writer_agent(topic, research)
    print(f"✅ Draft complete ({len(draft)} chars)")
    
    # Step 3: Edit
    print("\n📝 Step 3: Editor Agent working...")
    final = editor_agent(draft)
    print(f"✅ Final content ready ({len(final)} chars)")
    
    return {
        "topic": topic,
        "research": research,
        "draft": draft,
        "final": final
    }

# --- CLI ---

if __name__ == "__main__":
    print("🏭 Multi-Agent Content Pipeline")
    print("Enter a topic to create content about.\n")
    
    topic = input("Topic> ")
    result = run_pipeline(topic)
    
    # Save outputs
    with open(f"output_{topic.replace(' ', '_')[:30]}.md", "w") as f:
        f.write(f"# {result['topic']}\n\n")
        f.write(result['final'])
    
    print(f"\n{'=' * 50}")
    print("📄 FINAL CONTENT:")
    print("=" * 50)
    print(result['final'])
```

## Daily Breakdown

### Day 18: Setup & Coordinator
- Set up the project structure
- Implement the coordinator logic
- Test with placeholder agents (just echo back)

### Day 19: Build Agents & Integrate
- Implement all 3 agents (research, writer, editor)
- Wire up the pipeline
- Test end-to-end with a real topic

### Day 20: Polish & Extend
- Add error handling
- Add a quality check step (editor can reject and send back)
- Add output formatting options (markdown, HTML)
- Test with 3 different topics
- Document the architecture

## Stretch Goals
- Add a Tavily search tool to the research agent
- Add parallel research (multiple sub-topics)
- Add a "social media" agent that creates RedNote posts from the content
- Use LangGraph for proper state management

## Deliverable
A working multi-agent content pipeline you can demo on Day 21!
