# APIM API Creator

A Node.js application for automatically creating APIs in WSO2 API Manager (APIM) using Dynamic Client Registration (DCR) and OAuth2 authentication.

## Features

- **Dynamic Client Registration (DCR)**: Automatically registers an OAuth2 client with APIM
- **OAuth2 Authentication**: Generates access tokens for API management operations
- **Bulk API Creation**: Creates multiple APIs automatically with faker-generated data
- **Command Line Interface**: Supports various command-line options for automation
- **Environment Configuration**: Configurable through environment variables

## Prerequisites

- Node.js (v14 or higher)
- WSO2 API Manager instance running
- Admin credentials for APIM

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd apim-api-creator
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```env
# APIM Configuration
APIM_HOST=localhost
APIM_PORT=9443
APIM_ADMIN_USERNAME=<username>
APIM_ADMIN_PASSWORD=<password>

# Server Configuration
HOST=localhost
PORT=3000
```

## Usage

### Basic Server Start

Start the server without auto-creating APIs:

```bash
npm start
```

### Manual API Creation

Once the server is running, you can create APIs by sending a POST request:

```bash
curl -X POST http://localhost:3000/api/create \
  -H "Content-Type: application/json" \
  -d '{"count": 10}'
```

### Automatic API Creation

#### Using Command Line Arguments

Create 5 APIs automatically (default count):

```bash
npm run create-apis
```

Create a specific number of APIs:

```bash
node index.js --auto-create --count 100
```

#### Using NPM Scripts

```bash
# Create APIs with default count (5)
npm run create-apis

# Create APIs with custom count
npm run create-apis:count 25
```

### Development Mode

Run the server in development mode with auto-restart:

```bash
npm run dev
```

## API Endpoints

### GET /api/

- **Description**: Health check endpoint
- **Response**: "API is working!"

### POST /api/create

- **Description**: Create multiple APIs in APIM
- **Body Parameters**:
  - `count` (number): Number of APIs to create (default: 5)
- **Response**:
  ```json
  {
    "message": "API creation completed",
    "successful": 8,
    "failed": 2,
    "details": [...]
  }
  ```

## Project Structure

```
apim-api-creator/
├── controllers/
│   └── index.js          # API controllers (DCR, token generation, API creation)
├── routes/
│   └── index.js          # Express routes
├── constants/
│   └── endpoints.js      # APIM endpoint constants
├── data/
│   └── payloads.js       # Request payload templates
├── .env                  # Environment variables
├── package.json          # Project dependencies and scripts
├── index.js              # Main server file
└── README.md             # This documentation
```

## Environment Variables

| Variable                | Description                   | Default   |
| ----------------------- | ----------------------------- | --------- |
| `APIM_HOST`             | APIM server hostname          | localhost |
| `APIM_PORT`             | APIM server port              | 9443      |
| `APIM_ADMIN_USERNAME`   | APIM admin username           | admin     |
| `APIM_ADMIN_PASSWORD`   | APIM admin password           | admin     |
| `HOST`                  | Server hostname               | localhost |
| `PORT`                  | Server port                   | 3000      |
| `AUTO_CREATE_APIS`      | Auto-create APIs on startup   | false     |
| `AUTO_CREATE_API_COUNT` | Number of APIs to auto-create | 5         |

## Command Line Options

| Option             | Description                      | Example                                  |
| ------------------ | -------------------------------- | ---------------------------------------- |
| `--auto-create`    | Enable automatic API creation    | `node index.js --auto-create`            |
| `--count <number>` | Specify number of APIs to create | `node index.js --auto-create --count 50` |

## Authentication Flow

1. **DCR Registration**: The application registers itself as an OAuth2 client with APIM
2. **Token Generation**: Uses client credentials to generate an access token
3. **API Operations**: Uses the access token to perform API management operations

## Error Handling

- The application includes comprehensive error handling for DCR registration and token generation
- Failed API creations are logged and reported in the response
- Server initialization will fail if DCR or token generation fails

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License

## Support

For issues and questions, please create an issue in the repository or contact the developer.
