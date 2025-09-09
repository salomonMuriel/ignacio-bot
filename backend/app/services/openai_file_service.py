"""
OpenAI File Service for Ignacio Bot
Handles file uploads to OpenAI, vector store management, and file synchronization
"""

import logging
from datetime import datetime
from pathlib import Path
from typing import List, Optional
from uuid import UUID

from openai import OpenAI
from openai.types import FileObject

from app.core.config import settings
from app.models.database import UserFile
from app.services.database import db_service
from app.services.storage import storage_service

logger = logging.getLogger(__name__)


class OpenAIFileService:
    """Service for managing OpenAI file uploads and vector stores"""

    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)

    async def upload_file_to_openai(self, file_path: str, file_name: str) -> str:
        """Upload a file to OpenAI and return the file ID"""
        try:
            # Download file from Supabase storage first
            file_data = await storage_service.get_file_content(file_path)

            # Upload to OpenAI
            file_response = self.client.files.create(
                file=(file_name, file_data, self._get_mime_type(file_name)),
                purpose="assistants"
            )

            logger.info(f"Successfully uploaded file to OpenAI: {file_response.id}")
            return file_response.id

        except Exception as e:
            logger.error(f"Failed to upload file to OpenAI: {str(e)}")
            raise

    async def create_or_get_vector_store(self, user_id: UUID) -> str:
        """Create or get existing vector store for a user"""
        try:
            # Check if user already has a vector store
            user_files = await db_service.get_user_files(user_id)
            existing_store_id = None

            for file in user_files:
                if file.openai_vector_store_id:
                    existing_store_id = file.openai_vector_store_id
                    break

            if existing_store_id:
                # Verify the vector store still exists
                try:
                    vector_store = self.client.beta.vector_stores.retrieve(existing_store_id)
                    logger.info(f"Using existing vector store: {vector_store.id}")
                    return vector_store.id
                except Exception:
                    logger.warning(f"Vector store {existing_store_id} not found, creating new one")

            # Create new vector store
            vector_store = self.client.beta.vector_stores.create(
                name=f"user_{user_id}_documents",
                expires_after={
                    "anchor": "last_active_at",
                    "days": 365  # Keep vector store for 1 year
                }
            )

            logger.info(f"Created new vector store: {vector_store.id}")
            return vector_store.id

        except Exception as e:
            logger.error(f"Failed to create/get vector store: {str(e)}")
            raise

    async def add_file_to_vector_store(self, file_id: str, vector_store_id: str) -> bool:
        """Add a file to a vector store"""
        try:
            result = self.client.beta.vector_stores.files.create(
                vector_store_id=vector_store_id,
                file_id=file_id
            )

            logger.info(f"Added file {file_id} to vector store {vector_store_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to add file to vector store: {str(e)}")
            return False

    async def check_file_status(self, file_id: str) -> bool:
        """Check if a file still exists and is accessible in OpenAI"""
        try:
            file_obj = self.client.files.retrieve(file_id)
            return file_obj.status == "processed"

        except Exception as e:
            logger.warning(f"File {file_id} check failed: {str(e)}")
            return False

    async def sync_user_files(self, user_id: UUID) -> dict:
        """Sync user files to OpenAI - upload new files and re-upload expired ones"""
        result = {
            "uploaded": 0,
            "re_uploaded": 0,
            "failed": 0,
            "skipped": 0
        }

        try:
            user_files = await db_service.get_user_files(user_id)

            # Get or create vector store
            vector_store_id = await self.create_or_get_vector_store(user_id)

            for file in user_files:
                try:
                    # Skip non-document files
                    if not self._is_document_file(file.file_type):
                        result["skipped"] += 1
                        continue

                    should_upload = False
                    is_re_upload = False

                    if file.openai_file_id is None:
                        # File not uploaded yet
                        should_upload = True
                    elif file.openai_sync_status in ["failed", "expired"]:
                        # File needs re-upload
                        should_upload = True
                        is_re_upload = True
                    elif file.openai_sync_status == "synced":
                        # Check if file still exists
                        file_exists = await self.check_file_status(file.openai_file_id)
                        if not file_exists:
                            should_upload = True
                            is_re_upload = True

                    if should_upload:
                        # Upload file to OpenAI
                        openai_file_id = await self.upload_file_to_openai(
                            file.file_path,
                            file.file_name
                        )

                        # Add to vector store
                        success = await self.add_file_to_vector_store(
                            openai_file_id,
                            vector_store_id
                        )

                        if success:
                            # Update database
                            await db_service.update_file_openai_info(
                                file.id,
                                openai_file_id=openai_file_id,
                                vector_store_id=vector_store_id,
                                sync_status="synced",
                                uploaded_at=datetime.utcnow()
                            )

                            if is_re_upload:
                                result["re_uploaded"] += 1
                            else:
                                result["uploaded"] += 1

                        else:
                            # Mark as failed
                            await db_service.update_file_openai_info(
                                file.id,
                                sync_status="failed"
                            )
                            result["failed"] += 1
                    else:
                        result["skipped"] += 1

                except Exception as e:
                    logger.error(f"Failed to sync file {file.id}: {str(e)}")
                    # Mark as failed
                    await db_service.update_file_openai_info(
                        file.id,
                        sync_status="failed"
                    )
                    result["failed"] += 1

            logger.info(f"Sync completed for user {user_id}: {result}")
            return result

        except Exception as e:
            logger.error(f"Failed to sync user files: {str(e)}")
            raise

    async def get_user_vector_store_id(self, user_id: UUID) -> Optional[str]:
        """Get user's vector store ID"""
        try:
            user_files = await db_service.get_user_files(user_id)

            for file in user_files:
                if file.openai_vector_store_id and file.openai_sync_status == "synced":
                    return file.openai_vector_store_id

            return None

        except Exception as e:
            logger.error(f"Failed to get user vector store ID: {str(e)}")
            return None

    def _get_mime_type(self, filename: str) -> str:
        """Get MIME type from filename"""
        suffix = Path(filename).suffix.lower()
        mime_types = {
            '.pdf': 'application/pdf',
            '.txt': 'text/plain',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        }
        return mime_types.get(suffix, 'application/octet-stream')

    def _is_document_file(self, file_type: str) -> bool:
        """Check if file type should be uploaded to OpenAI"""
        document_types = [
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp'
        ]
        return file_type in document_types


# Global service instance
openai_file_service = OpenAIFileService()
