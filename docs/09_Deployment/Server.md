# Server Architecture & Network Configuration

## Network Access & Binding

As documented in `server.js`, the Node.js backend listens on `0.0.0.0:PORT`:

```javascript
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Network: http://0.0.0.0:${PORT}`);
});
```

Binding to `0.0.0.0` allows device testing across local Wi-Fi networks (e.g. testing customer UI on mobile phones connected to the same network).

---

## CORS Configuration

CORS is configured to support HTTP methods and WebSocket connections:

```javascript
app.use(cors());
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});
```
