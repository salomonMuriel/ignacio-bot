-- Migration: Add template_type column to prompt_templates table
-- This allows distinguishing between admin-created and user-created templates

-- Add template_type column to prompt_templates table
ALTER TABLE prompt_templates 
ADD COLUMN template_type text NOT NULL DEFAULT 'admin';

-- Create index for efficient querying by template type and user
CREATE INDEX idx_prompt_templates_type_user ON prompt_templates(template_type, created_by);

-- Update existing templates to be admin type (they were created by admins)
-- The default value already handles this, but this makes it explicit
UPDATE prompt_templates 
SET template_type = 'admin' 
WHERE template_type = 'admin';

-- Add check constraint to ensure only valid template types
ALTER TABLE prompt_templates 
ADD CONSTRAINT chk_template_type 
CHECK (template_type IN ('admin', 'user'));