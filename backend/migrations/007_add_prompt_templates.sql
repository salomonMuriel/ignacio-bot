-- Migration 007: Add prompt_templates table
-- Adds support for admin-created prompt templates that users can select in chat

CREATE TABLE IF NOT EXISTS prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for performance
CREATE INDEX idx_prompt_templates_is_active ON prompt_templates(is_active);
CREATE INDEX idx_prompt_templates_created_by ON prompt_templates(created_by);
CREATE INDEX idx_prompt_templates_tags ON prompt_templates USING GIN(tags);

-- Update trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_prompt_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prompt_templates_updated_at
    BEFORE UPDATE ON prompt_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_prompt_templates_updated_at();

-- Add some sample prompt templates for testing (optional)
INSERT INTO prompt_templates (title, content, tags, created_by) VALUES
    ('Business Model Canvas', 'I need help creating a business model canvas for my project. Can you guide me through each of the 9 key building blocks and help me define them for my specific project?', ARRAY['business', 'strategy', 'planning'], 
     (SELECT id FROM users WHERE is_admin = true LIMIT 1)),
    ('Market Research', 'Help me conduct market research for my project. I want to understand my target market, competitors, and market size. Can you guide me through this process step by step?', ARRAY['research', 'market', 'analysis'], 
     (SELECT id FROM users WHERE is_admin = true LIMIT 1)),
    ('Financial Projections', 'I need help creating financial projections for my project. Can you help me understand what key financial metrics I should track and how to create realistic projections?', ARRAY['finance', 'projections', 'planning'], 
     (SELECT id FROM users WHERE is_admin = true LIMIT 1)),
    ('Marketing Strategy', 'Help me develop a comprehensive marketing strategy for my project. I want to understand my target audience, messaging, and the best channels to reach potential customers.', ARRAY['marketing', 'strategy', 'audience'], 
     (SELECT id FROM users WHERE is_admin = true LIMIT 1)),
    ('MVP Planning', 'I want to plan my Minimum Viable Product (MVP). Can you help me identify the core features I should include and create a development roadmap?', ARRAY['mvp', 'product', 'development'], 
     (SELECT id FROM users WHERE is_admin = true LIMIT 1));