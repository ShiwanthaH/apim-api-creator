import { faker } from "@faker-js/faker";

export const generateCreationPayloads = (count) => {
  const payloads = [];

  const apiCategories = [
    {
      type: "ecommerce",
      endpoints: ["products", "orders", "customers", "payments"],
    },
    { type: "social", endpoints: ["users", "posts", "comments", "likes"] },
    {
      type: "finance",
      endpoints: ["accounts", "transactions", "transfers", "balances"],
    },
    { type: "travel", endpoints: ["bookings", "flights", "hotels", "reviews"] },
    {
      type: "health",
      endpoints: ["patients", "appointments", "records", "prescriptions"],
    },
    {
      type: "education",
      endpoints: ["courses", "students", "assignments", "grades"],
    },
    {
      type: "logistics",
      endpoints: ["shipments", "tracking", "inventory", "delivery"],
    },
    { type: "media", endpoints: ["videos", "photos", "playlists", "streams"] },
  ];

  const generateAlphanumeric = (length) => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const firstChars = "abcdefghijklmnopqrstuvwxyz"; // No numbers for first character

    let result = faker.helpers.arrayElement(firstChars.split(""));
    for (let i = 1; i < length; i++) {
      result += faker.helpers.arrayElement(chars.split(""));
    }
    return result;
  };

  const generateApiName = (companyName, serviceName) => {
    // Remove all non-alphanumeric characters and spaces
    const cleanCompany = companyName.replace(/[^a-zA-Z0-9]/g, "");
    const cleanService = serviceName.replace(/[^a-zA-Z0-9]/g, "");

    // Ensure first character is a letter
    const firstChar = cleanCompany.charAt(0).match(/[a-zA-Z]/)
      ? cleanCompany.charAt(0)
      : "Api";

    let apiName =
      firstChar +
      cleanCompany.slice(1) +
      cleanService.charAt(0).toUpperCase() +
      cleanService.slice(1) +
      "API";

    // Ensure it doesn't start with a number
    if (/^\d/.test(apiName)) {
      apiName = "Api" + apiName;
    }

    return apiName;
  };

  // Helper function to generate context that's alphanumeric and doesn't start with number
  const generateContext = (categoryType) => {
    const cleanType = categoryType.replace(/[^a-zA-Z0-9]/g, "");
    const randomSuffix = generateAlphanumeric(6);
    return `${cleanType}${randomSuffix}`;
  };

  for (let i = 1; i <= count; i++) {
    const category = faker.helpers.arrayElement(apiCategories);
    const companyName = faker.company.name();
    const serviceName = faker.hacker.noun();

    // Generate unique identifiers with proper alphanumeric validation
    const apiName = generateApiName(companyName, serviceName);
    const context = generateContext(category.type);
    const version = `${faker.number.int({ min: 1, max: 5 })}.${faker.number.int(
      { min: 0, max: 9 }
    )}.${faker.number.int({ min: 0, max: 9 })}`;

    const businessOwner = faker.person.fullName();
    const technicalOwner = faker.person.fullName();
    const domain = faker.internet.domainName();

    const baseUrl = `https://${faker.internet.domainName()}/api/${context}/${version}`;
    const sandboxUrl = `https://sandbox-${faker.internet.domainName()}/api/${context}/${version}`;

    const operations = category.endpoints.map((endpoint) => {
      const methods = ["GET", "POST", "PUT", "DELETE"];
      const authTypes = [
        "Application & Application User",
        "Application User",
        "Application",
        "None",
      ];

      return {
        target: `/${endpoint}`,
        verb: faker.helpers.arrayElement(methods),
        authType: faker.helpers.arrayElement(authTypes),
        throttlingPolicy: "Unlimited",
      };
    });

    operations.push({
      target: `/${category.endpoints[0]}/{id}`,
      verb: "GET",
      authType: "Application & Application User",
      throttlingPolicy: "Unlimited",
    });

    const payload = {
      name: apiName,
      description: `${faker.company.catchPhrase()} - A comprehensive ${
        category.type
      } API for ${companyName} providing ${faker.hacker.phrase()}.`,
      context: context,
      version: version,
      provider: process.env.APIM_ADMIN_USERNAME || "admin",
      lifeCycleStatus: "CREATED",
      responseCachingEnabled: faker.datatype.boolean(),
      hasThumbnail: false,
      isDefaultVersion: true,
      enableSchemaValidation: faker.datatype.boolean(),
      type: "HTTP",
      transport: ["http", "https"],
      tags: [
        category.type,
        faker.hacker.abbreviation(),
        faker.company.buzzNoun(),
        faker.hacker.noun(),
      ].slice(0, faker.number.int({ min: 2, max: 4 })),
      policies: ["Unlimited"],
      apiThrottlingPolicy: "Unlimited",
      securityScheme: ["oauth2"],
      maxTps: {
        production: faker.number.int({ min: 100, max: 10000 }),
        sandbox: faker.number.int({ min: 50, max: 1000 }),
      },
      visibility: "PUBLIC",
      visibleRoles: [],
      visibleTenants: [],
      subscriptionAvailability: "CURRENT_TENANT",
      additionalProperties: [],
      accessControl: "NONE",
      businessInformation: {
        businessOwner: businessOwner,
        businessOwnerEmail: faker.internet.email({
          firstName: businessOwner.split(" ")[0],
          lastName: businessOwner.split(" ")[1],
          provider: domain,
        }),
        technicalOwner: technicalOwner,
        technicalOwnerEmail: faker.internet.email({
          firstName: technicalOwner.split(" ")[0],
          lastName: technicalOwner.split(" ")[1],
          provider: domain,
        }),
      },
      endpointConfig: {
        endpoint_type: "http",
        sandbox_endpoints: {
          url: sandboxUrl,
        },
        production_endpoints: {
          url: baseUrl,
        },
      },
      operations: operations,
    };

    payloads.push(payload);
  }

  return payloads;
};

export default generateCreationPayloads;
