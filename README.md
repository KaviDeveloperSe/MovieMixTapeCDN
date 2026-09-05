# MovieMixTapeCDN

Advanced Fly.io Streaming & Download Gateway designed for high-performance proxying of media streams with range request support, secure token authentication, and robust error handling.

## Requirements

* Node.js 18+
* Docker (Optional, for containerized execution)
* Flyctl (Optional, for deployment to Fly.io)

## Local Development Setup

1. Install dependencies:

```bash
npm install
```

1. Configure environment variables. The `.env` file should contain at least:

```env
NODE_ENV=development
PORT=8080
LOG_LEVEL=debug
STREAM_SECRET=your_32_character_super_secret_string_here
ALLOWED_ORIGINS=http://localhost:3000,https://myfrontend.com
TOKEN_TTL_SECONDS=3600
UPSTREAM_TIMEOUT_MS=15000
MAX_RANGE_SIZE=104857600
```

1. Start the development server:

```bash
npm run dev
```

## Running Tests

Execute the Vitest test suite:

```bash
npm test
```

## Token Generation CLI

A utility script is provided to securely generate signed streaming/download tokens for testing.

```bash
npm run generate-token -- provider="netmirror" url="https://example.com/video.mp4"
```

You can optionally specify a filename and expiration overrides:

```bash
npm run generate-token -- provider="netmirror" url="https://example.com/video.mp4" filename="movie.mp4" expires=7200
```

## Endpoints

### `GET /stream/:token`

Streams the media content directly to the client (`Content-Disposition: inline`).

* Supports standard HTTP `Range` requests for seeking.
* Returns `206 Partial Content` appropriately.

### `GET /download/:token`

Forces the browser to download the media file (`Content-Disposition: attachment`).

### `HEAD /stream/:token` or `HEAD /download/:token`

Retrieves headers (content length, mime type, etc.) without downloading the body.

## Docker Execution

To build and run the production image locally:

1. Build the image:

```bash
docker build -t moviemixtapecdn .
```

1. Run the container:

```bash
docker run -p 8080:8080 --env-file .env moviemixtapecdn
```

## Fly.io Deployment

Deployment is managed via standard `flyctl` commands.

1. Set the mandatory secrets in the Fly.io dashboard or via CLI:

```bash
fly secrets set STREAM_SECRET="your_32_character_production_secret" ALLOWED_ORIGINS="https://your-production-site.com"
```

1. Deploy the application:

```bash
fly deploy
```
