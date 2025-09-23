import Passwordless from "supertokens-auth-react/recipe/passwordless";
import { PasswordlessPreBuiltUI } from "supertokens-auth-react/recipe/passwordless/prebuiltui";
import Session from "supertokens-auth-react/recipe/session";

export function getApiDomain() {
    return "http://localhost:8000";
}

export function getWebsiteDomain() {
    return "http://localhost:3000";
}


export const SuperTokensConfig = {
    appInfo: {
        appName: "Ignacio Bot",
        apiDomain: getApiDomain(),
        websiteDomain: getWebsiteDomain(),
        apiBasePath: "/auth",
        websiteBasePath: "/auth",
    },
    recipeList: [
        Passwordless.init({
            contactMethod: "EMAIL_OR_PHONE",
        }),
        Session.init()
    ],
    getRedirectionURL: async (context: {action: string; newSessionCreated: boolean}) => {
        if (context.action === "SUCCESS" && context.newSessionCreated) {
            return "/chat/";
        }
    },
};

export const recipeDetails = {
    docsLink: "https://supertokens.com/docs/quickstart/introduction",
};

export const PreBuiltUIList = [PasswordlessPreBuiltUI];