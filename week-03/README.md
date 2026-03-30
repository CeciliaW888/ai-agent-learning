# Week 3: Advanced Patterns 🚀

> Multi-agent systems, production patterns, and your capstone project.

## Daily Schedule

### Day 15: Multi-Agent Architectures
**Time:** 60 min (45 min video + 15 min notes)

**Watch:**
- 🎥 [LangGraph: Multi-Agent Workflows](https://www.youtube.com/watch?v=hvAPnpSfSGo) — LangChain (15 min)
- 🎥 [DeepLearning.AI: AI Agents in LangGraph](https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/) — Multi-agent lesson
- 🎥 [CrewAI Tutorial: Complete Crash Course for Beginners](https://www.youtube.com/watch?v=sPzc6hMg7So) — aiwithbrandon (15 min)

**Key Concepts:**
- **Supervisor pattern:** One agent coordinates others
- **Peer pattern:** Agents collaborate as equals
- **Pipeline pattern:** Agents pass work sequentially
- **Debate pattern:** Agents challenge each other's reasoning

**Activity:** Open `diagrams/04-multi-agent.excalidraw`

---

### Day 16: Agent Communication Patterns
**Time:** 60 min (40 min video + 20 min notes)

**Watch:**
- 🎥 [LangGraph: Multi-Agent Workflows](https://www.youtube.com/watch?v=hvAPnpSfSGo) — LangChain (20 min)
- 🎥 [DeepLearning.AI: Multi-Agent Workflows](https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/) — Multi-agent lesson (20 min)

**Key Concepts:**
- Message passing between agents
- Shared state vs isolated state
- Handoff protocols (when to pass control)
- Error recovery in multi-agent systems

---

### Day 17: Production Patterns & Safety
**Time:** 60 min (40 min video + 20 min notes)

**Watch:**
- 🎥 [CrewAI Tutorial: Production Multi-Agent Framework](https://www.youtube.com/watch?v=sPzc6hMg7So) — aiwithbrandon (20 min)
- 🎥 [AI Prompt Engineering: A Deep Dive](https://www.youtube.com/watch?v=T9aRN5JkmL8) — Anthropic — Safety & guardrails in prompting

**Key Concepts:**
- **Human-in-the-loop:** When to ask for approval
- **Rate limiting:** Don't let agents run wild
- **Sandboxing:** Limit what tools can do
- **Monitoring:** Track agent decisions and costs
- **Fallback patterns:** Graceful degradation

---

### Day 18: Capstone Project Start 💻
**Time:** 60 min (project start)

**Project:** Build a multi-agent content creation pipeline.

See `projects/week-03/` for the full project guide.

**The System:**
- **Research Agent:** Finds information on a topic
- **Writer Agent:** Creates content from research
- **Editor Agent:** Reviews and improves the content
- **Coordinator:** Orchestrates the pipeline

**Today's Goal:**
1. Set up project structure
2. Define agent roles and tools
3. Build the coordinator logic

---

### Day 19: Capstone: Build & Integrate
**Time:** 60 min (project continue)

**Today's Goal:**
1. Implement all three sub-agents
2. Wire up communication between them
3. Test the full pipeline with a simple topic

---

### Day 20: Capstone: Polish & Deploy
**Time:** 60 min (project finish)

**Today's Goal:**
1. Add error handling and logging
2. Add a simple CLI interface
3. Test with 3 different topics
4. Document the architecture

---

### Day 21: Course Review + Final Post 🎉
**Time:** 60 min (30 min review + 30 min celebration post)

**Review:**
- What did you learn across all 3 weeks?
- What's your biggest "before vs after" change?
- What do you want to build next?
- Update your progress dashboard in README.md

**Share on RedNote:**
Use the template in `build-in-public/week-03-post.md`

**🎉 You did it! 21 days, 21 hours, from AI user to agent builder.**

---

## 📚 Week 3 Resources

- [CrewAI Documentation](https://docs.crewai.com/)
- [AutoGen: Multi-Agent Framework](https://microsoft.github.io/autogen/)
- [LangGraph Multi-Agent Tutorial](https://docs.langchain.com/oss/python/langchain/multi-agent)
- [Anthropic: Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
