# Ignacio Bot - Technical Specifications

## 1. System Architecture Overview

### High-Level Architecture
- **Backend**: Python FastAPI REST API
- **Frontend**: React with TypeScript (Single Page Application)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **External Integrations**: WhatsApp Business API
- **Authentication**: OTP-based authentication via WhatsApp

### System Components
1. **Web Frontend** - React/TypeScript SPA
2. **REST API Backend** - FastAPI Python application
3. **WhatsApp Service** - Integration service for WhatsApp Business API
4. **AI Processing Service** - OpenAI Agent SDK
5. **File Processing Service** - Media and document handling
6. **Authentication Service** - OTP and session management