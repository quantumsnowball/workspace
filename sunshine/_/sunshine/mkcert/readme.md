# Trusted SSL Certificate for Sunshine Web Admin via `mkcert`

A concise guide to eliminating browser security warnings and enabling Progressive Web App (PWA) installation for the Sunshine Web UI on Linux.

---

## Prerequisites

Install `mkcert` and Network Security Services (`nss`) via your package manager:

```bash
sudo pacman -S mkcert nss
```

---

## Step 1: Initialize the Local CA

Register `mkcert`'s local Certificate Authority (CA) into system and browser trust stores:

```bash
mkcert -install
```

---

## Step 2: Generate RSA-2048 Certificate Pair

Create a certs directory and generate **RSA-2048** keys to ensure compatibility with all Moonlight clients:

```bash
cd ~/.config/workspace/sunshine/_/sunshine/
mkdir mkcert && cd mkcert
mkcert localhost 127.0.0.1 ::1
```

*Outputs two files:*
- `localhost+2.pem` (Certificate)
- `localhost+2-key.pem` (Private Key)

---

## Step 3: Configure Sunshine

Update `~/.config/sunshine/sunshine.conf` with the generated paths (*Note: Shell variables like `$HOME` are not supported*):

```ini
cert = mkcert/localhost+2.pem
pkey = mkcert/localhost+2-key.pem
```

Or you can also login the sunshine web admin page and change the cert and private key path there. The path is relative to the parent directory of sunshine.conf.

> **Alternative (Direct Override):**
> You can also replace default credentials without changing `sunshine.conf`:
> ```bash
> cp localhost+2.pem ~/.config/sunshine/credentials/cacert.pem
> cp localhost+2-key.pem ~/.config/sunshine/credentials/cakey.pem
> ```

---

## Step 4: Restart Services

Restart Sunshine and fully close Google Chrome to reload the certificate database:

```bash
systemctl --user restart sunshine
killall chrome
```

---

## Verification

1. Open Chrome and navigate to `https://localhost:47990`.
2. Verify the URL bar displays a valid **Lock Icon**.
3. Install the page as a **Progressive Web App (PWA)** via Chrome menu -> *Save and share* -> *Install page as app*.

