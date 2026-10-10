# Start here

Lorekeeper is deployed and its core project documentation is maintained. Use
these links to open the live app, check the API, or continue development:

- **Live app:** [https://shokomori.github.io/Lorekeeper/](https://shokomori.github.io/Lorekeeper/)
- **API health:** [https://lorekeeper-api-cad9.onrender.com/healthz](https://lorekeeper-api-cad9.onrender.com/healthz)
- **GitHub repository:** [shokomori/Lorekeeper](https://github.com/shokomori/Lorekeeper)
- **Project overview and local setup:** [README.md](README.md)
- **Documentation index:** [docs/README.md](docs/README.md)

## Run locally

Install dependencies and start the API:

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Then, in a second terminal, start the client:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

The client runs at `http://localhost:5173`; the API runs at
`http://localhost:3000`. See [README.md](README.md) for database setup,
environment variables, and API details.
