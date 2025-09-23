import Passwordless, { PasswordlessComponentsOverrideProvider } from "supertokens-auth-react/recipe/passwordless";
import { PasswordlessPreBuiltUI } from "supertokens-auth-react/recipe/passwordless/prebuiltui";
import MultiFactorAuth from "supertokens-auth-react/recipe/multifactorauth";
import { MultiFactorAuthPreBuiltUI } from "supertokens-auth-react/recipe/multifactorauth/prebuiltui";
import EmailVerification from "supertokens-auth-react/recipe/emailverification";
import { EmailVerificationPreBuiltUI } from "supertokens-auth-react/recipe/emailverification/prebuiltui";
import Session from "supertokens-auth-react/recipe/session";

export function getApiDomain() {
    return "http://localhost:8000";
}

export function getWebsiteDomain() {
    return "http://localhost:3001";
}

export const styleOverride = `
[data-supertokens~=container] {
    --palette-background: #1e293b;
    --palette-inputBackground: #374151;
    --palette-inputBorder: #4b5563;
    --palette-textTitle: #ffffff;
    --palette-textLabel: #d1d5db;
    --palette-textPrimary: #ffffff;
    --palette-error: #ef4444;
    --palette-textInput: #ffffff;
    --palette-textLink: #8b5cf6;
    --palette-buttonText: #ffffff;
    --palette-primary: #8b5cf6;
    --palette-success: #10b981;

    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    width: 420px;
    margin: 0 auto;
    text-align: center;
    border-radius: 16px;
    border: 1px solid #374151;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

[data-supertokens~=headerTitle] {
    color: #ffffff;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
}

[data-supertokens~=headerSubtitle] {
    color: #9ca3af;
    font-size: 14px;
    margin-bottom: 24px;
}

[data-supertokens~=input] {
    background-color: #374151;
    border: 1px solid #4b5563;
    color: #ffffff;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 16px;
}

[data-supertokens~=input]:focus {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    outline: none;
}

[data-supertokens~=button] {
    background-color: #8b5cf6;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    cursor: pointer;
    transition: background-color 0.2s;
}

[data-supertokens~=button]:hover {
    background-color: #7c3aed;
}

[data-supertokens~=button]:disabled {
    background-color: #4b5563;
    cursor: not-allowed;
}

[data-supertokens~=tenants-link] {
    margin-top: 8px;
}

[data-supertokens~=divider] {
    border-color: #4b5563;
}

[data-supertokens~=link] {
    color: #8b5cf6;
    text-decoration: none;
}

[data-supertokens~=link]:hover {
    color: #7c3aed;
    text-decoration: underline;
}
`;

export const SuperTokensConfig = {
    appInfo: {
        appName: "Ignacio Bot",
        apiDomain: getApiDomain(),
        websiteDomain: getWebsiteDomain(),
        apiBasePath: "/auth",
        websiteBasePath: "/auth",
    },
    style: styleOverride,

    recipeList: [
        Passwordless.init({
            contactMethod: "EMAIL_OR_PHONE",
            override: {
                components: {
                    PasswordlessUserInputCodeFormHeader_Override: ({ DefaultComponent, ...props }) => {
                        return (
                            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                                <h2 style={{
                                    color: '#ffffff',
                                    fontSize: '24px',
                                    fontWeight: '700',
                                    marginBottom: '8px',
                                    margin: 0
                                }}>
                                    Welcome to Ignacio
                                </h2>
                                <p style={{
                                    color: '#9ca3af',
                                    fontSize: '14px',
                                    margin: '8px 0 0 0'
                                }}>
                                    Enter the verification code sent to your device
                                </p>
                            </div>
                        );
                    },
                    PasswordlessLinkSentScreen_Override: ({ DefaultComponent, ...props }) => {
                        return (
                            <div style={{ textAlign: 'center' }}>
                                <h2 style={{
                                    color: '#ffffff',
                                    fontSize: '24px',
                                    fontWeight: '700',
                                    marginBottom: '16px'
                                }}>
                                    Check Your Device
                                </h2>
                                <DefaultComponent {...props} />
                            </div>
                        );
                    }
                }
            }
        }),
        MultiFactorAuth.init({
            firstFactors: ["passwordless"],
            override: {
                functions: (originalImplementation) => ({
                    ...originalImplementation,
                    getMFARequirementsForAuth: () => [
                        {
                            oneOf: [
                                MultiFactorAuth.FactorIds.OTP_EMAIL,
                                MultiFactorAuth.FactorIds.OTP_PHONE
                            ],
                        },
                    ],
                    getRequiredSecondaryFactorsForUser: async () => {
                        return [MultiFactorAuth.FactorIds.OTP_EMAIL, MultiFactorAuth.FactorIds.OTP_PHONE];
                    },
                }),
            }
        }),
        EmailVerification.init({
            mode: "OPTIONAL"
        }),
        Session.init({
            override: {
                functions: (original) => {
                    return {
                        ...original,
                        getGlobalClaimValidators: (input) => {
                            const emailVerificationClaimValidator = input.claimValidatorsAddedByOtherRecipes.find(
                                v => v.id === EmailVerification.EmailVerificationClaim.id
                            );
                            if (emailVerificationClaimValidator) {
                                const filteredValidators = input.claimValidatorsAddedByOtherRecipes.filter(
                                    v => v.id !== EmailVerification.EmailVerificationClaim.id
                                );
                                return [...filteredValidators, emailVerificationClaimValidator];
                            }
                            return input.claimValidatorsAddedByOtherRecipes;
                        }
                    };
                }
            }
        })
    ],
    getRedirectionURL: async (context: {action: string; newSessionCreated: boolean}) => {
        if (context.action === "SUCCESS" && context.newSessionCreated) {
            // Redirect to projects page after successful login
            return "/projects";
        }
    },
};

export const recipeDetails = {
    docsLink: "https://supertokens.com/docs/quickstart/introduction",
};

export const PreBuiltUIList = [PasswordlessPreBuiltUI, MultiFactorAuthPreBuiltUI, EmailVerificationPreBuiltUI];

export const ComponentWrapper = (props: { children: JSX.Element }): JSX.Element => {
    return (
        <PasswordlessComponentsOverrideProvider
            components={{
                PasswordlessUserInputCodeFormFooter_Override: ({ DefaultComponent, ...props }) => {
                    const loginAttemptInfo = props.loginAttemptInfo;
                    let showQuotaMessage = false;

                    if (loginAttemptInfo.contactMethod === "PHONE") {
                        showQuotaMessage = true;
                    }

                    return (
                        <div style={{ width: "100%" }}>
                            <DefaultComponent {...props} />
                            {showQuotaMessage && (
                                <div style={{
                                    width: "100%",
                                    padding: '12px',
                                    borderRadius: '8px',
                                    backgroundColor: "#fef3c7",
                                    margin: '12px 0 0 0',
                                    fontSize: '12px',
                                    textAlign: 'center',
                                    fontWeight: "500",
                                    color: '#92400e',
                                    lineHeight: "18px",
                                }}>
                                    There is a daily quota for the free SMS service. If you do not receive the SMS,
                                    please try again tomorrow or use email instead.
                                </div>
                            )}
                        </div>
                    );
                },
            }}
        >
            {props.children}
        </PasswordlessComponentsOverrideProvider>
    );
};