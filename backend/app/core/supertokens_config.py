from typing import Any, Dict, List, Optional, Union

from supertokens_python import InputAppInfo, SupertokensConfig, init
from supertokens_python.recipe import (
    accountlinking,
    dashboard,
    emailverification,
    multifactorauth,
    passwordless,
    session,
    userroles,
)
from supertokens_python.recipe.accountlinking.types import (
    AccountInfoWithRecipeIdAndUserId,
    ShouldAutomaticallyLink,
    ShouldNotAutomaticallyLink,
)
from supertokens_python.recipe.multifactorauth.interfaces import (
    RecipeInterface as MFARecipeInterface,
)
from supertokens_python.recipe.multifactorauth.types import FactorIds, MFARequirementList
from supertokens_python.recipe.passwordless import ContactEmailOrPhoneConfig
from supertokens_python.recipe.session.interfaces import SessionContainer
from supertokens_python.types import User

from app.core.config import settings


def override_multifactor_functions(
    original_implementation: MFARecipeInterface,
) -> MFARecipeInterface:
    async def get_mfa_requirements_for_auth(
        tenant_id: str,
        access_token_payload: dict,
        completed_factors: dict,
        user: User,
        factors_set_up_for_user: List[str],
        required_secondary_factors_for_user: List[str],
        required_secondary_factors_for_tenant: List[str],
        user_context: dict,
    ) -> MFARequirementList:
        return [
            {
                "oneOf": [FactorIds.OTP_EMAIL, FactorIds.OTP_PHONE],
            }
        ]

    async def get_required_secondary_factors_for_user(
        tenant_id: str,
        user_id: str,
        user_context: dict,
    ) -> List[str]:
        return [FactorIds.OTP_EMAIL, FactorIds.OTP_PHONE]

    original_implementation.get_mfa_requirements_for_auth = get_mfa_requirements_for_auth
    original_implementation.get_required_secondary_factors_for_user = (
        get_required_secondary_factors_for_user
    )
    return original_implementation


async def should_do_automatic_account_linking(
    new_account_info: AccountInfoWithRecipeIdAndUserId,
    user: Optional[User],
    session: Optional[SessionContainer],
    tenant_id: str,
    user_context: Dict[str, Any],
) -> Union[ShouldNotAutomaticallyLink, ShouldAutomaticallyLink]:
    return ShouldAutomaticallyLink(should_require_verification=False)


def get_supertokens_config() -> SupertokensConfig:
    return SupertokensConfig(connection_uri=settings.supertokens_connection_uri)


def get_app_info() -> InputAppInfo:
    return InputAppInfo(
        app_name="Ignacio Bot",
        api_domain=settings.backend_url,
        website_domain=settings.frontend_url,
        api_base_path="/auth",
        website_base_path="/auth",
    )


def get_recipe_list() -> List[Any]:
    return [
        session.init(),
        dashboard.init(),
        userroles.init(),
        passwordless.init(
            flow_type="USER_INPUT_CODE", contact_config=ContactEmailOrPhoneConfig()
        ),
        multifactorauth.init(
            first_factors=["otp-email", "otp-phone"],
            override=multifactorauth.OverrideConfig(
                functions=lambda original_implementation: override_multifactor_functions(
                    original_implementation
                )
            ),
        ),
        emailverification.init(mode="REQUIRED"),
        accountlinking.init(
            should_do_automatic_account_linking=should_do_automatic_account_linking
        ),
    ]


def init_supertokens() -> None:
    init(
        supertokens_config=get_supertokens_config(),
        app_info=get_app_info(),
        framework="fastapi",
        recipe_list=get_recipe_list(),
        mode="asgi",
        telemetry=False,
    )