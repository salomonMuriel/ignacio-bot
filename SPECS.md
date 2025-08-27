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
4. **AI Processing Service** - PydanticAI-powered conversation handling with OpenAI models
5. **File Processing Service** - Media and document handling
6. **Authentication Service** - OTP and session management

## 2. Database Schema

### Users Table
```sql
users (
    id: UUID PRIMARY KEY,
    phone_number: VARCHAR(20) UNIQUE NOT NULL,
    name: VARCHAR(255),
    is_admin: BOOLEAN DEFAULT false,
    is_active: BOOLEAN DEFAULT true,
    created_at: TIMESTAMP DEFAULT NOW(),
    updated_at: TIMESTAMP DEFAULT NOW()
)
```

### Chat Conversations Table
```sql
conversations (
    id: UUID PRIMARY KEY,
    user_id: UUID REFERENCES users(id),
    title: VARCHAR(255),
    created_at: TIMESTAMP DEFAULT NOW(),
    updated_at: TIMESTAMP DEFAULT NOW()
)
```

### Chat Messages Table
```sql
messages (
    id: UUID PRIMARY KEY,
    conversation_id: UUID REFERENCES conversations(id),
    user_id: UUID REFERENCES users(id),
    content: TEXT,
    message_type: ENUM('text', 'image', 'audio', 'video', 'document'),
    file_path: VARCHAR(500), -- Supabase Storage path
    is_from_user: BOOLEAN,
    whatsapp_message_id: VARCHAR(100),
    created_at: TIMESTAMP DEFAULT NOW()
)
```

### User Sessions Table
```sql
user_sessions (
    id: UUID PRIMARY KEY,
    user_id: UUID REFERENCES users(id),
    session_token: VARCHAR(500) UNIQUE,
    expires_at: TIMESTAMP,
    created_at: TIMESTAMP DEFAULT NOW()
)
```

### OTP Codes Table
```sql
otp_codes (
    id: UUID PRIMARY KEY,
    phone_number: VARCHAR(20),
    code: VARCHAR(6),
    is_used: BOOLEAN DEFAULT false,
    expires_at: TIMESTAMP,
    created_at: TIMESTAMP DEFAULT NOW()
)
```

### User Files Table
```sql
user_files (
    id: UUID PRIMARY KEY,
    user_id: UUID REFERENCES users(id),
    file_name: VARCHAR(255),
    file_path: VARCHAR(500), -- Supabase Storage path
    file_type: VARCHAR(100),
    file_size: BIGINT,
    created_at: TIMESTAMP DEFAULT NOW()
)
```

## 3. API Endpoints

### Authentication Endpoints
- `POST /auth/request-otp` - Request OTP code
- `POST /auth/verify-otp` - Verify OTP and login
- `POST /auth/refresh` - Refresh session token
- `POST /auth/logout` - Logout user

### User Management Endpoints
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update current user profile
- `GET /users` - List all users (admin only)
- `POST /users` - Create new user (admin only)
- `PUT /users/{user_id}` - Update user (admin only)
- `DELETE /users/{user_id}` - Delete user (admin only)

### Chat Endpoints
- `GET /conversations` - Get user's conversations
- `POST /conversations` - Create new conversation
- `GET /conversations/{conversation_id}/messages` - Get conversation messages
- `POST /conversations/{conversation_id}/messages` - Send message
- `POST /conversations/{conversation_id}/files` - Upload file to conversation

### Admin Endpoints
- `GET /admin/conversations` - Get all conversations (admin only)
- `GET /admin/conversations/{conversation_id}` - Get specific conversation (admin only)
- `GET /admin/users/{user_id}/conversations` - Get user's conversations (admin only)

### WhatsApp Webhook Endpoints
- `POST /webhooks/whatsapp` - Receive WhatsApp messages
- `GET /webhooks/whatsapp` - WhatsApp webhook verification

### File Handling Endpoints
- `POST /files/upload` - Upload file
- `GET /files/{file_id}` - Get file metadata
- `GET /files/{file_id}/download` - Download file

## 4. Authentication Flow

### Web Login Flow
1. User enters phone number
2. System sends OTP via WhatsApp
3. User enters OTP code
4. System validates OTP and creates session
5. Frontend receives JWT token for API calls

### WhatsApp Authentication
- WhatsApp messages are authenticated by phone number
- System creates or finds user by phone number
- All WhatsApp interactions are logged to user's conversation history

## 5. WhatsApp Integration

### Required WhatsApp Business API Features
- Send/Receive text messages
- Send/Receive media files (images, audio, video)
- Send/Receive documents
- Message status tracking
- Webhook handling for incoming messages

### Message Processing Flow
1. Receive webhook from WhatsApp
2. Parse message content and media
3. Store media files in Supabase Storage
4. Process message with AI assistant
5. Generate contextual response
6. Send response back via WhatsApp API
7. Log complete interaction in database

## 6. File Handling Requirements

### Supported File Types
- **Images**: JPEG, PNG, GIF, WEBP
- **Audio**: MP3, WAV, OGG, M4A
- **Video**: MP4, MOV, AVI
- **Documents**: PDF, DOC, DOCX, TXT, RTF
- **Presentations**: PPT, PPTX
- **Spreadsheets**: XLS, XLSX

### File Processing
- All files uploaded via web or WhatsApp are stored in Supabase Storage
- Files are organized by user folders: `/users/{user_id}/files/`
- Maximum file size: 25MB
- Files are scanned for content extraction when relevant to conversations
- File metadata is stored in user_files table

## 7. AI Assistant Integration

### PydanticAI with OpenAI Models
- **Framework**: PydanticAI for type-safe AI interactions
- **Model Provider**: OpenAI (GPT-4, GPT-3.5-turbo)
- **Response Validation**: Pydantic models for structured responses
- **Error Handling**: Built-in validation and retry mechanisms

### Conversation Context
- AI assistant has access to user's conversation history
- AI can reference uploaded documents and files through PydanticAI context
- Responses are tailored based on user's project context
- System maintains conversation memory across sessions using PydanticAI state management
- Context is passed through structured Pydantic models

### Specialized Response Models
```python
class MarketingResponse(BaseModel):
    advice: str
    action_items: List[str]
    resources: List[str]

class TechnicalResponse(BaseModel):
    solution: str
    implementation_steps: List[str]
    considerations: List[str]

class ProjectManagementResponse(BaseModel):
    recommendations: str
    timeline_suggestions: List[str]
    risk_factors: List[str]
```

### Specialized AI Agents
- Marketing questions → Marketing expert agent with MarketingResponse model
- Technical questions → Technical expert agent with TechnicalResponse model
- Project management → PM advisor agent with ProjectManagementResponse model
- Financial questions → Financial advisor agent with FinancialResponse model

## 8. Security Requirements

### Data Protection
- All API endpoints require authentication
- Phone numbers are encrypted in database
- File access is restricted to file owners and admins
- Session tokens have configurable expiration times

### Admin Access Control
- Admins can view all conversations
- Admins can manage all users
- Admin creation requires existing admin approval
- Audit logging for all admin actions

## 9. Performance Requirements

### Response Times
- API responses: < 200ms for data retrieval
- WhatsApp message processing: < 5 seconds
- AI response generation: < 10 seconds
- File uploads: Support up to 25MB files

### Scalability
- Support for 1000+ concurrent users
- Message history retention: unlimited
- File storage: scalable via Supabase Storage

## 10. Technical Configuration

### Environment Variables Required
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_KEY` - Supabase service role key
- `WHATSAPP_ACCESS_TOKEN` - WhatsApp Business API token
- `WHATSAPP_PHONE_NUMBER_ID` - WhatsApp Business phone number ID
- `WHATSAPP_VERIFY_TOKEN` - WhatsApp webhook verification token
- `JWT_SECRET_KEY` - Secret key for JWT tokens
- `OPENAI_API_KEY` - OpenAI API key for PydanticAI integration
- `PYDANTIC_AI_MODEL` - OpenAI model name (default: gpt-4)
- `PYDANTIC_AI_MAX_TOKENS` - Maximum tokens per response (default: 2000)
- `PYDANTIC_AI_TEMPERATURE` - Model temperature (default: 0.7)

### Deployment Architecture
- **Backend**: Docker container deployed on cloud platform
- **Frontend**: Static files served via CDN
- **Database**: Supabase managed PostgreSQL
- **Storage**: Supabase Storage with CDN
- **WhatsApp**: Meta Business API integration
- **AI Service**: PydanticAI with OpenAI API integration

### Core Dependencies
- **FastAPI**: Web framework
- **PydanticAI**: Type-safe AI framework for OpenAI integration
- **Supabase**: Database and storage
- **OpenAI**: LLM provider through PydanticAI
- **Python 3.11+**: Runtime environment