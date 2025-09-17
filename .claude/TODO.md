# Agent Instruction System Refactor - TODO

## Task Overview
Refactor the agent system to separate base personality from domain-specific instructions, and expand to 8 specialized agents with tech-savvy tool recommendations.

## Core Requirements
- **Project Diversity**: ALL projects are entrepreneurial (NGOs, foundations, traditional companies, consultancies) - not just tech startups
- **Scrappy Mindset**: ALL projects have startup agility and go-getter attitude, but NOT all aim for unicorn scale/VC funding
- **Tech-Optimization**: ALL agents should suggest tech tools to automate/improve processes in their domain
- **Speed Focus**: Rapid prototyping, quick testing, fast iteration for competitive advantage

## Phase 1: Base Instructions Refactor
- [x] Extract base personality from `create_project_aware_instructions()` in `project_context_service.py`
- [ ] Create new `create_base_personality_instructions()` function with:
  - Project diversity awareness (NGOs, foundations, traditional companies, etc.)
  - Scrappy startup mindset without unicorn-scale assumptions
  - Tech-optimization emphasis for ALL project types
  - Speed and rapid iteration focus
  - Adaptive mentoring approach (Socratic + direct assistance)

## Phase 2: Domain-Specific Instructions (Research + Create)
Create domain-specific instruction functions with researched tool recommendations:

### Marketing Expert
- [ ] Research digital marketing tools (analytics, automation, social media, lead gen)
- [ ] Include: Google Analytics, Mailchimp, Buffer, Canva, HubSpot, Zapier, etc.
- [ ] Focus: Customer acquisition, growth hacking, conversion optimization
- [ ] Quick wins: GA setup, customer interviews, landing pages, email automation

### Technology Expert
- [ ] Research dev tools (no-code, low-code, development, infrastructure)
- [ ] Include: Bubble, Webflow, Retool, n8n, GitHub, Vercel, AWS, etc.
- [ ] Focus: Tech stack selection, rapid prototyping, MVP development
- [ ] Quick wins: No-code prototypes, development workflows, deployment

### Finance Expert
- [ ] Research financial tools (modeling, fundraising, accounting, analytics)
- [ ] Include: Airtable templates, QuickBooks, Stripe, ProfitWell, etc.
- [ ] Focus: Unit economics, cash flow, funding strategies, financial planning
- [ ] Quick wins: Financial model setup, expense tracking, revenue forecasting

### Sustainability Expert (NEW)
- [ ] Research ESG and impact measurement tools
- [ ] Include: B Impact Assessment, Salesforce Sustainability Cloud, etc.
- [ ] Focus: Environmental impact, social responsibility, ESG reporting
- [ ] Quick wins: Impact baseline, sustainability metrics, reporting setup

### Legal/Compliance Expert (NEW)
- [ ] Research legal tech tools (contracts, formation, compliance)
- [ ] Include: LegalZoom, Clerky, DocuSign, Ironclad, etc.
- [ ] Focus: Business formation, contracts, regulatory compliance
- [ ] Quick wins: Entity formation, contract templates, compliance checklists

### Operations Expert (NEW)
- [ ] Research process optimization tools (workflow, supply chain, logistics)
- [ ] Include: Notion, Airtable, Monday.com, Zapier, ShipStation, etc.
- [ ] Focus: Process automation, supply chain, workflow optimization
- [ ] Quick wins: Process documentation, automation setup, efficiency metrics

### Product/Design Expert (NEW)
- [ ] Research design and product development tools
- [ ] Include: Figma, Miro, UserVoice, Hotjar, Maze, ProdPad, etc.
- [ ] Focus: UX/UI design, product development, user research
- [ ] Quick wins: User research setup, design system, prototyping workflow

### Sales Expert (NEW)
- [ ] Research sales tools (CRM, pipeline, enablement, automation)
- [ ] Include: HubSpot, Pipedrive, Calendly, Loom, Outreach, etc.
- [ ] Focus: Sales strategy, pipeline management, customer relationships
- [ ] Quick wins: CRM setup, sales process documentation, automation workflows

## Phase 3: Implementation
- [ ] Create `create_domain_specific_instructions(domain: str)` function
- [ ] Update `create_project_aware_agent()` to use base + domain instructions
- [ ] Modify existing agent creation in `ai_service.py` to use new system

## Phase 4: Agent Expansion
- [ ] Create 5 new specialized agents in `IgnacioAgentService`:
  - Sustainability Expert
  - Legal/Compliance Expert
  - Operations Expert
  - Product/Design Expert
  - Sales Expert
- [ ] Update main Ignacio agent with all 8 specialists as tools
- [ ] Add proper handoff descriptions for each agent

## Phase 5: Testing & Validation
- [ ] Test base personality consistency across all agents
- [ ] Validate domain-specific tool recommendations
- [ ] Test agent coordination and handoffs
- [ ] Verify project context integration works with new system

## Key Files to Modify
- `backend/app/services/project_context_service.py` - Instruction refactor
- `backend/app/services/ai_service.py` - Agent creation and expansion

## Success Criteria
- All 8 agents have consistent base personality
- Each agent provides domain-specific, researched tool recommendations
- All agents emphasize tech-optimization and rapid iteration
- System supports diverse entrepreneurial project types (not just tech startups)
- Agents suggest appropriate tools based on user's tech comfort level