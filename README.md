This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 2. Generate SSL Certificates

This project requires HTTPS for local development. Use `mkcert` to generate trusted local SSL certificates:

#### Install mkcert

**macOS:**

```bash
brew install mkcert
brew install nss # if you use Firefox
```

**Linux:**

```bash
# Arch Linux
sudo pacman -S mkcert

# Ubuntu/Debian
sudo apt install mkcert

# Or install manually
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
```

**Windows:**

```bash
choco install mkcert
```

#### Create Local Certificate Authority

```bash
mkcert -install
```

#### Generate Certificates

```bash
# Generate .pem certificates (for server)
mkcert localhost 127.0.0.1 ::1 <HOST_IP>

# This creates:
# - localhost+3.pem (certificate)
# - localhost+3-key.pem (private key)
```

### 3. Generate .p12 Certificate for Android

Android devices require PKCS#12 (.p12) format certificates for trusted HTTPS connections:

```bash
# Convert .pem to .p12 format
openssl pkcs12 -export -out client_full.p12 \
  -inkey localhost+3-key.pem \
  -in localhost+3.pem \
  -name "<NAME_CERTIFICATE>"
  -password pass:'<PASSWORD>'

```

#### Install .p12 Certificate on Android

1. Transfer `client_full.p12` to your Android device (via email, cloud storage, or USB)
2. Open **Settings** → **Security** → **Encryption & credentials**
3. Tap **Install a certificate** → **CA certificate**
4. Browse and select `client_full.p12`
5. If prompted for a password, insert password and press OK
6. Name the certificate (e.g., "Localhost Development")

#### Install Certificate in Firefox for Android

Firefox for Android requires additional steps to trust the certificate:

1. Open **Firefox** on your Android device
2. Navigate to `about:config` in the address bar
3. Search for `security.enterprise_roots.enabled`
4. Toggle it to `true` (this allows Firefox to use system certificates)
5. Alternatively, import the certificate directly into Firefox:
   - Type `about:certificate` in the address bar
   - Tap **Import** or **Add Certificate**
   - Select `client_full.p12` from your device
   - Enter the password when prompted
   - Firefox will now trust the certificate for HTTPS connections

**Note:** If `about:certificate` doesn't work, you can also:

- Visit your HTTPS site (e.g., `https://YOUR_LOCAL_IP`)
- Click on the warning/lock icon
- Select "Add Exception" or "Continue to site"
- Firefox will add the certificate to its trusted list

### 4. Run the Development Servers

#### Start Next.js Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

The Next.js app will run on [http://localhost:3000](http://localhost:3000)

### 5. Run Caddy Reverse Proxy

Caddy provides a reverse proxy with automatic HTTPS for local development, making it easier to access the app from mobile devices on the same network.

#### Install Caddy

**macOS:**

```bash
brew install caddy
```

**Linux:**

```bash
# Debian/Ubuntu
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

**Windows:**

```bash
choco install caddy
```

#### Start Caddy

```bash
caddy run --config Caddyfile
```

**Caddyfile Configuration:**

- Runs on port **3001** (HTTPS)
- Proxies requests to Next.js (port 3000) and OCR server (port 3002)
- Automatically handles SSL/TLS with the generated certificates
- Enables access from other devices on the local network

**What Caddy Does:**

- Acts as a reverse proxy to route traffic to the correct services
- Provides HTTPS encryption using the mkcert certificates
- Enables mobile device testing on the same network
- Routes `/api/ocr-upload` to the OCR server (port 3002)
- Routes all other requests to the Next.js app (port 3000)

#### Access Points

With Caddy running:

- **HTTPS**: `https://<HOST_IP>:3001`
- **From Mobile**: `https://<HOST_IP>:3001` (find your local IP with `ipconfig` or `ifconfig`)

Without Caddy:

- **Next.js**: `http://localhost:3000`
- **OCR Server**: `https://localhost:3002`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
