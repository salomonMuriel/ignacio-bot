"""
Supabase Storage service for Ignacio Bot
Handles file uploads, downloads, and management via Supabase Storage
"""

import mimetypes
import uuid
from uuid import UUID

from app.core.database import supabase
from app.models.database import UserFile, UserFileCreate
from app.services.database import db_service


class StorageService:
    """Service class for file storage operations using Supabase Storage"""

    # File size limit: 10MB in bytes
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

    # Allowed file types
    ALLOWED_EXTENSIONS = {
        # Audio files
        '.mp3', '.wav', '.m4a', '.ogg', '.flac',
        # Documents
        '.pdf', '.txt', '.doc', '.docx',
        # Images
        '.jpg', '.jpeg', '.png', '.gif', '.webp'
    }

    ALLOWED_MIME_TYPES = {
        # Audio
        'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/flac',
        # Documents
        'application/pdf', 'text/plain', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        # Images
        'image/jpeg', 'image/png', 'image/gif', 'image/webp'
    }

    def __init__(self):
        self.client = supabase
        self.bucket_name = "user-files"

    def validate_file(self, file_content: bytes, file_name: str, content_type: str | None = None) -> tuple[bool, str]:
        """Validate file size and type"""

        # Check file size
        if len(file_content) > self.MAX_FILE_SIZE:
            return False, f"File size ({len(file_content)} bytes) exceeds maximum allowed size of {self.MAX_FILE_SIZE} bytes (10MB)"

        # Check file extension
        file_extension = f".{file_name.split('.')[-1].lower()}" if "." in file_name else ""
        if file_extension not in self.ALLOWED_EXTENSIONS:
            allowed_exts = ", ".join(sorted(self.ALLOWED_EXTENSIONS))
            return False, f"File type '{file_extension}' not allowed. Allowed types: {allowed_exts}"

        # Check MIME type if provided
        if content_type:
            if content_type not in self.ALLOWED_MIME_TYPES:
                allowed_types = ", ".join(sorted(self.ALLOWED_MIME_TYPES))
                return False, f"MIME type '{content_type}' not allowed. Allowed types: {allowed_types}"

        return True, "File validation passed"

    def ensure_bucket_exists(self) -> bool:
        """Ensure the storage bucket exists"""
        try:
            # Try to get bucket info
            self.client.storage.get_bucket(self.bucket_name)
            return True
        except Exception:
            try:
                # Create bucket if it doesn't exist
                self.client.storage.create_bucket(self.bucket_name)
                return True
            except Exception as e:
                print(f"Failed to create bucket: {e}")
                return False

    async def upload_file(
        self,
        user_id: UUID,
        file_content: bytes,
        file_name: str,
        content_type: str | None = None,
        conversation_id: UUID | None = None,
    ) -> UserFile | None:
        """Upload a file to Supabase Storage and create a database record"""

        # Ensure bucket exists
        if not self.ensure_bucket_exists():
            raise Exception("Storage bucket not available")

        # Determine content type if not provided
        if not content_type:
            content_type, _ = mimetypes.guess_type(file_name)

        # Validate file
        is_valid, validation_message = self.validate_file(file_content, file_name, content_type)
        if not is_valid:
            raise Exception(validation_message)

        # Generate unique file path
        file_extension = file_name.split(".")[-1] if "." in file_name else ""
        unique_filename = (
            f"{uuid.uuid4()}.{file_extension}" if file_extension else str(uuid.uuid4())
        )
        
        # Use conversation-based path structure if conversation_id is provided
        if conversation_id:
            file_path = f"users/{user_id}/conversations/{conversation_id}/{unique_filename}"
        else:
            # Fallback to user-based path for backwards compatibility
            file_path = f"users/{user_id}/files/{unique_filename}"

        # Use fallback content type if still None
        if not content_type:
            content_type = "application/octet-stream"

        try:
            # Upload file to Supabase Storage
            response = self.client.storage.from_(self.bucket_name).upload(
                path=file_path,
                file=file_content,
                file_options={"content-type": content_type, "cache-control": "3600"},
            )

            # Check if upload was successful
            # Supabase storage upload() returns different response formats depending on success/failure
            # If there's an error, it will be raised as an exception by the client library
            # If we reach here, the upload was successful

            # Create database record
            file_record = UserFileCreate(
                user_id=user_id,
                file_name=file_name,
                file_path=file_path,
                file_type=content_type,
                file_size=len(file_content),
                conversation_id=conversation_id,
            )

            return await db_service.create_user_file(file_record)

        except Exception as e:
            raise Exception(f"File upload failed: {e}")

    async def download_file(self, file_id: UUID, user_id: UUID) -> bytes | None:
        """Download a file from Supabase Storage"""

        # Get file record from database
        file_record = await db_service.get_file_by_id(file_id)
        if not file_record or file_record.user_id != user_id:
            return None

        try:
            # Download file from Supabase Storage
            response = self.client.storage.from_(self.bucket_name).download(
                file_record.file_path
            )
            return response

        except Exception as e:
            print(f"File download failed: {e}")
            return None

    async def get_file_url(
        self, file_id: UUID, user_id: UUID, expires_in: int = 3600
    ) -> str | None:
        """Get a signed URL for file access"""

        # Get file record from database
        file_record = await db_service.get_file_by_id(file_id)
        if not file_record or file_record.user_id != user_id:
            return None

        try:
            # Create signed URL
            response = self.client.storage.from_(self.bucket_name).create_signed_url(
                path=file_record.file_path, expires_in=expires_in
            )

            return response.get("signedURL") if response else None

        except Exception as e:
            print(f"Failed to create signed URL: {e}")
            return None

    async def delete_file(self, file_id: UUID, user_id: UUID) -> bool:
        """Delete a file from both storage and database"""

        # Get file record from database
        file_record = await db_service.get_file_by_id(file_id)
        if not file_record or file_record.user_id != user_id:
            return False

        try:
            # Delete from Supabase Storage
            response = self.client.storage.from_(self.bucket_name).remove(
                [file_record.file_path]
            )

            if response:
                # Delete from database
                # Note: We'd need to add a delete method to db_service for user_files
                # For now, we'll just return True if storage deletion succeeded
                return True

            return False

        except Exception as e:
            print(f"File deletion failed: {e}")
            return False

    async def get_file_content(self, file_path: str) -> bytes:
        """Get file content as bytes for OpenAI upload"""
        try:
            response = self.client.storage.from_(self.bucket_name).download(file_path)
            return response
        except Exception as e:
            print(f"Failed to get file content: {e}")
            raise

    async def get_user_files(self, user_id: UUID) -> list[UserFile]:
        """Get all files for a user"""
        return await db_service.get_user_files(user_id)

    def create_storage_policy_sql(self) -> str:
        """Generate SQL for creating Row Level Security policies for storage"""
        return """
        -- Enable RLS on the storage.objects table
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

        -- Policy for users to see only their own files
        CREATE POLICY "Users can view own files" ON storage.objects
            FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[2]);

        -- Policy for users to upload files to their own folder
        CREATE POLICY "Users can upload own files" ON storage.objects
            FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[2]);

        -- Policy for users to update their own files
        CREATE POLICY "Users can update own files" ON storage.objects
            FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[2]);

        -- Policy for users to delete their own files
        CREATE POLICY "Users can delete own files" ON storage.objects
            FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[2]);
        """


# Global storage service instance
storage_service = StorageService()
