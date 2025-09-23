from typing import Any, Dict

from fastapi import APIRouter, Depends
from supertokens_python.recipe.session import SessionContainer
from supertokens_python.recipe.session.framework.fastapi import verify_session

router = APIRouter()


@router.get("/sessioninfo")
async def get_session_info(session: SessionContainer = Depends(verify_session())):
    """Get information about the current session - matches SuperTokens example."""
    return {
        "sessionHandle": session.get_handle(),
        "userId": session.get_user_id(),
        "accessTokenPayload": session.get_access_token_payload(),
    }