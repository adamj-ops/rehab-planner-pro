-- Migration: Notebook Tables for Project Journals
-- Creates tables for project notebooks, pages, contextual links, tags, and attachments

-- ============================================================================
-- NOTEBOOK STRUCTURE TABLES
-- ============================================================================

-- Project notebooks (one per project)
CREATE TABLE project_notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES rehab_projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id)
);

-- Notebook pages with nested structure support
CREATE TABLE notebook_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID NOT NULL REFERENCES project_notebooks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  icon TEXT, -- emoji or icon name (e.g., '📝', 'file-text')
  content JSONB NOT NULL DEFAULT '[]'::jsonb, -- Plate.js editor content
  template_type TEXT, -- 'walkthrough-notes', 'daily-log', 'vendor-meeting', etc.
  parent_page_id UUID REFERENCES notebook_pages(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contextual links within notes (links to rooms, vendors, scope items, etc.)
CREATE TABLE notebook_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES notebook_pages(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL, -- 'room', 'vendor', 'scope_item', 'material', 'color', 'timeline_phase'
  link_id UUID NOT NULL, -- ID of the linked entity
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags for organization
CREATE TABLE notebook_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES notebook_pages(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page_id, tag)
);

-- Media attachments
CREATE TABLE notebook_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES notebook_pages(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL, -- Supabase storage path
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'image', 'video', 'audio', 'document'
  mime_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- notebook_pages indexes
CREATE INDEX idx_notebook_pages_notebook_id ON notebook_pages(notebook_id);
CREATE INDEX idx_notebook_pages_parent_page_id ON notebook_pages(parent_page_id);
CREATE INDEX idx_notebook_pages_template_type ON notebook_pages(template_type) WHERE template_type IS NOT NULL;
CREATE INDEX idx_notebook_pages_created_at ON notebook_pages(created_at DESC);

-- notebook_links indexes
CREATE INDEX idx_notebook_links_page_id ON notebook_links(page_id);
CREATE INDEX idx_notebook_links_link_type_id ON notebook_links(link_type, link_id);

-- notebook_tags indexes
CREATE INDEX idx_notebook_tags_page_id ON notebook_tags(page_id);
CREATE INDEX idx_notebook_tags_tag ON notebook_tags(tag);

-- notebook_attachments indexes
CREATE INDEX idx_notebook_attachments_page_id ON notebook_attachments(page_id);

-- project_notebooks indexes
CREATE INDEX idx_project_notebooks_project_id ON project_notebooks(project_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE project_notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebook_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebook_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebook_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebook_attachments ENABLE ROW LEVEL SECURITY;

-- project_notebooks policies
CREATE POLICY "Users can view their project notebooks"
  ON project_notebooks FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create notebooks for their projects"
  ON project_notebooks FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their project notebooks"
  ON project_notebooks FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their project notebooks"
  ON project_notebooks FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

-- notebook_pages policies
CREATE POLICY "Users can view pages in their notebooks"
  ON notebook_pages FOR SELECT
  USING (
    notebook_id IN (
      SELECT id FROM project_notebooks WHERE project_id IN (
        SELECT id FROM rehab_projects WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create pages in their notebooks"
  ON notebook_pages FOR INSERT
  WITH CHECK (
    notebook_id IN (
      SELECT id FROM project_notebooks WHERE project_id IN (
        SELECT id FROM rehab_projects WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update pages in their notebooks"
  ON notebook_pages FOR UPDATE
  USING (
    notebook_id IN (
      SELECT id FROM project_notebooks WHERE project_id IN (
        SELECT id FROM rehab_projects WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete pages in their notebooks"
  ON notebook_pages FOR DELETE
  USING (
    notebook_id IN (
      SELECT id FROM project_notebooks WHERE project_id IN (
        SELECT id FROM rehab_projects WHERE user_id = auth.uid()
      )
    )
  );

-- notebook_links policies
CREATE POLICY "Users can view links in their notebooks"
  ON notebook_links FOR SELECT
  USING (
    page_id IN (
      SELECT np.id FROM notebook_pages np
      JOIN project_notebooks pn ON np.notebook_id = pn.id
      WHERE pn.project_id IN (
        SELECT id FROM rehab_projects WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create links in their notebooks"
  ON notebook_links FOR INSERT
  WITH CHECK (
    page_id IN (
      SELECT np.id FROM notebook_pages np
      JOIN project_notebooks pn ON np.notebook_id = pn.id
      WHERE pn.project_id IN (
        SELECT id FROM rehab_projects WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete links in their notebooks"
  ON notebook_links FOR DELETE
  USING (
    page_id IN (
      SELECT np.id FROM notebook_pages np
      JOIN project_notebooks pn ON np.notebook_id = pn.id
      WHERE pn.project_id IN (
        SELECT id FROM rehab_projects WHERE user_id = auth.uid()
      )
    )
  );

-- notebook_tags policies
CREATE POLICY "Users can view tags in their notebooks"
  ON notebook_tags FOR SELECT
  USING (
    page_id IN (
      SELECT np.id FROM notebook_pages np
      JOIN project_notebooks pn ON np.notebook_id = pn.id
      WHERE pn.project_id IN (
        SELECT id FROM rehab_projects WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create tags in their notebooks"
  ON notebook_tags FOR INSERT
  WITH CHECK (
    page_id IN (
      SELECT np.id FROM notebook_pages np
      JOIN project_notebooks pn ON np.notebook_id = pn.id
      WHERE pn.project_id IN (
        SELECT id FROM rehab_projects WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete tags in their notebooks"
  ON notebook_tags FOR DELETE
  USING (
    page_id IN (
      SELECT np.id FROM notebook_pages np
      JOIN project_notebooks pn ON np.notebook_id = pn.id
      WHERE pn.project_id IN (
        SELECT id FROM rehab_projects WHERE user_id = auth.uid()
      )
    )
  );

-- notebook_attachments policies
CREATE POLICY "Users can view attachments in their notebooks"
  ON notebook_attachments FOR SELECT
  USING (
    page_id IN (
      SELECT np.id FROM notebook_pages np
      JOIN project_notebooks pn ON np.notebook_id = pn.id
      WHERE pn.project_id IN (
        SELECT id FROM rehab_projects WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create attachments in their notebooks"
  ON notebook_attachments FOR INSERT
  WITH CHECK (
    page_id IN (
      SELECT np.id FROM notebook_pages np
      JOIN project_notebooks pn ON np.notebook_id = pn.id
      WHERE pn.project_id IN (
        SELECT id FROM rehab_projects WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete attachments in their notebooks"
  ON notebook_attachments FOR DELETE
  USING (
    page_id IN (
      SELECT np.id FROM notebook_pages np
      JOIN project_notebooks pn ON np.notebook_id = pn.id
      WHERE pn.project_id IN (
        SELECT id FROM rehab_projects WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notebook_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_project_notebooks_updated_at
  BEFORE UPDATE ON project_notebooks
  FOR EACH ROW
  EXECUTE FUNCTION update_notebook_updated_at();

CREATE TRIGGER trigger_notebook_pages_updated_at
  BEFORE UPDATE ON notebook_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_notebook_updated_at();

-- ============================================================================
-- GRANTS FOR SERVICE ROLE
-- ============================================================================

GRANT ALL ON project_notebooks TO service_role;
GRANT ALL ON notebook_pages TO service_role;
GRANT ALL ON notebook_links TO service_role;
GRANT ALL ON notebook_tags TO service_role;
GRANT ALL ON notebook_attachments TO service_role;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE project_notebooks IS 'Stores one notebook per project for journaling and documentation';
COMMENT ON TABLE notebook_pages IS 'Individual pages within a notebook with Plate.js JSONB content';
COMMENT ON TABLE notebook_links IS 'Contextual links from pages to project entities (rooms, vendors, etc.)';
COMMENT ON TABLE notebook_tags IS 'User-defined tags for organizing notebook pages';
COMMENT ON TABLE notebook_attachments IS 'Media attachments (images, videos, audio) linked to pages';

COMMENT ON COLUMN notebook_pages.content IS 'Plate.js editor content stored as JSONB array';
COMMENT ON COLUMN notebook_pages.template_type IS 'Template used: walkthrough-notes, daily-log, vendor-meeting, design-decision, lessons-learned, budget-variance-analysis';
COMMENT ON COLUMN notebook_links.link_type IS 'Type of linked entity: room, vendor, scope_item, material, color, timeline_phase';
