export const DCR_AUTH_PAYLOAD = {
  callbackUrl: "www.google.lk",
  clientName: "rest_api_publisher",
  owner: "admin",
  grantType: "client_credentials password refresh_token",
  saasApp: true,
};

export const TOKEN_PAYLOAD = {
  grant_type: "password",
  username: "admin",
  password: "admin",
  scope: "apim:api_create apim:api_publish apim:api_view",
};

export const API_PAYLOAD = {
  name: "PizzaShackAPI2",
  description:
    "This is a simple API for Pizza Shack online pizza delivery store.",
  context: "pizza2",
  version: "1.0.0",
  provider: "admin",
  lifeCycleStatus: "CREATED",
  responseCachingEnabled: false,
  hasThumbnail: false,
  isDefaultVersion: false,
  enableSchemaValidation: false,
  type: "HTTP",
  transport: ["http", "https"],
  tags: ["substract", "add"],
  policies: ["Unlimited"],
  apiThrottlingPolicy: "Unlimited",
  securityScheme: ["oauth2"],
  maxTps: {
    production: 1000,
    sandbox: 1000,
  },
  visibility: "PUBLIC",
  visibleRoles: [],
  visibleTenants: [],
  subscriptionAvailability: "CURRENT_TENANT",
  additionalProperties: [
    {
      name: "AdditionalProperty",
      value: "PropertyValue",
      display: true,
    },
  ],
  accessControl: "NONE",
  businessInformation: {
    businessOwner: "John Doe",
    businessOwnerEmail: "johndoe@wso2.com",
    technicalOwner: "Jane Roe",
    technicalOwnerEmail: "janeroe@wso2.com",
  },
  endpointConfig: {
    endpoint_type: "http",
    sandbox_endpoints: {
      url: "https://localhost:9443/am/sample/pizzashack/v1/api/",
    },
    production_endpoints: {
      url: "https://localhost:9443/am/sample/pizzashack/v1/api/",
    },
  },
  operations: [
    {
      target: "/order/{orderId}",
      verb: "POST",
      authType: "Application & Application User",
      throttlingPolicy: "Unlimited",
    },
    {
      target: "/menu",
      verb: "GET",
      authType: "Application & Application User",
      throttlingPolicy: "Unlimited",
    },
  ],
};
