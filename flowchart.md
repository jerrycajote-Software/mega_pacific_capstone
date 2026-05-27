# 🔄 System Flowchart

This document outlines the high-level flow of the **3D Roofing Design and Inventory Management System**, including the user experience, admin management, backend data flow, and the 3D asset pipeline.

## System Architecture Flow

The following Mermaid diagram visualizes the overall architecture and interactions between different modules of the system, highlighting the dedicated authentication flow, real-time inventory management logic, and automated order confirmation flows:

```mermaid
graph TD
    %% Styling / Themes
    classDef auth fill:#ffe6cc,stroke:#d79b00,stroke-dasharray: 3 3,stroke-width:2px;
    classDef user fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px;
    classDef admin fill:#d5e8d4,stroke:#82b366,stroke-width:2px;
    classDef backend fill:#f5f5f5,stroke:#666666,stroke-width:2px;
    classDef db fill:#e1d5e7,stroke:#9673a6,stroke-width:2px;
    classDef pipeline fill:#fff2cc,stroke:#d6b656,stroke-width:2px;

    %% -------------------------------------------------------------------------
    %% SUBGRAPH: Authentication & Authorization Flow (Separate Logic)
    %% -------------------------------------------------------------------------
    subgraph AuthFlow ["Authentication & Authorization Flow"]
        UReg["User Registration Screen"]
        ULog["User Login Screen"]
        ValCreds["Validate Credentials & Data"]
        GenToken["Generate Session JWT"]
        AuthGate{"Auth Gate: Logged In?"}

        UReg -->|Submit Info| ValCreds
        ULog -->|Submit Credentials| ValCreds
        ValCreds -->|Valid / Success| GenToken
        ValCreds -->|Invalid / Error| ULog
    end

    %% -------------------------------------------------------------------------
    %% SUBGRAPH: User Frontend Flow
    %% -------------------------------------------------------------------------
    subgraph UserInterface ["User Interface / Frontend - React"]
        U1["Home / Browse Products"]
        U2["3D Roof Designer"]
        U3["Customize: Type, Dimensions, Materials"]
        U4["Live Cost Computation"]
        U5["Add to Cart"]
        U6["Place Order / Checkout"]
        U7["Order Confirmation & Receipt"]

        U1 --> AuthGate
        AuthGate -->|Yes| U2
        AuthGate -->|No| ULog
        GenToken -.->|Redirect back to| U2

        U2 --> U3
        U3 --> U4
        U4 --> U5
        U5 --> U6
        U6 --> U7
    end

    %% -------------------------------------------------------------------------
    %% SUBGRAPH: Admin Dashboard
    %% -------------------------------------------------------------------------
    subgraph AdminPanel ["Admin Dashboard - React"]
        A1["Admin Login Gate"]
        A2["Dashboard Overview"]
        A3["Manage Products & Inventory"]
        A4["Track Orders & Monitor Sales"]
        
        A1 --> A2
        A2 --> A3
        A2 --> A4
    end

    %% -------------------------------------------------------------------------
    %% SUBGRAPH: Backend API & Business Logic
    %% -------------------------------------------------------------------------
    subgraph BackendSystem ["Backend System - Node.js / Express"]
        B1["Express.js API Router"]
        BAuth["Auth Controller"]
        BOrder["Order Controller"]
        BInv["Inventory Controller"]
        
        %% Inventory & Order Internal Logic
        InvCheck{"Stock Available?"}
        InvDeduct["Deduct Material Stock"]
        ProcOrder["Process Payment & Create Order"]
        EmailService["Email Dispatcher"]
        
        B1 --> BAuth
        B1 --> BOrder
        B1 --> BInv
        
        %% Order Flow inside Backend
        BOrder --> InvCheck
        InvCheck -->|No - Out of Stock| B1
        InvCheck -->|Yes| ProcOrder
        ProcOrder --> InvDeduct
        ProcOrder --> EmailService
    end

    %% -------------------------------------------------------------------------
    %% SUBGRAPH: Database
    %% -------------------------------------------------------------------------
    subgraph DBSystem ["Database & Storage"]
        DB[("PostgreSQL Database")]
        Prisma["Prisma ORM"]
        
        Prisma <--> DB
    end

    %% -------------------------------------------------------------------------
    %% SUBGRAPH: 3D Pipeline
    %% -------------------------------------------------------------------------
    subgraph ThreeDPipeline ["3D Model Pipeline"]
        M1["Design Models in Blender"]
        M2["Export as .glb / .gltf"]
        M3["Load via Three.js"]
        
        M1 --> M2
        M2 --> M3
    end

    %% -------------------------------------------------------------------------
    %% CONNECTIONS & INTERACTIONS
    %% -------------------------------------------------------------------------
    %% Three.js connection
    M3 -.->|Renders in| U2

    %% Auth Connections
    ValCreds -->|Verify / Store in DB| BAuth
    BAuth <-->|Query / Write User| Prisma

    %% User Interaction Connections to Backend
    U1 -->|Fetch Products| B1
    U4 -->|Compute Material Costs| BInv
    U6 -->|Submit Checkout Data| BOrder
    BOrder -->|Return Status & Receipt| U7

    %% Admin Interaction Connections
    A3 -->|Manage Stock & Material Costs| BInv
    A4 -->|Fetch Order Analytics & Status| BOrder

    %% Backend DB Interactions
    BAuth <--> Prisma
    BOrder <--> Prisma
    BInv <--> Prisma
    
    %% Notifications / Warnings
    EmailService -.->|Send Order Receipt| U7
    InvDeduct -.->|If Stock < Min Threshold| AlertAdmin["Trigger Admin Low Stock Alert"]
    AlertAdmin -.-> A2

    %% Assigning Classes for styles
    class UReg,ULog,ValCreds,GenToken,AuthGate auth;
    class U1,U2,U3,U4,U5,U6,U7 user;
    class A1,A2,A3,A4 admin;
    class B1,BAuth,BOrder,BInv,InvCheck,InvDeduct,ProcOrder,EmailService,AlertAdmin backend;
    class DB,Prisma db;
    class M1,M2,M3 pipeline;
```

### Flow Highlights:

1. **Authentication & Authorization Gate (Updated):** Registration and Login forms are moved into their own dedicated, decoupled flow. When users attempt to design or place an order, they encounter the `Auth Gate`. Non-authenticated requests are intercepted and redirected to the login panel. Upon validation via the JWT-based backend Auth Controller, they are returned back to their original flow.
2. **3D Integration Flow:** 3D Models are created and optimized in Blender, exported in `.glb`/`.gltf` format, and loaded dynamically into the interactive designer via Three.js.
3. **Inventory Management & Logic (New):** Features real-time stock control. When customizing materials or placing an order (`Checkout`), the Backend API queries PostgreSQL via Prisma to check availability. Stock is automatically deducted (`InvDeduct`) upon successful checkout. If material stock levels fall below a critical threshold, it triggers a warning alert directly visible on the Admin Dashboard.
4. **Order Confirmation & Checkout Flow (New):** Placing an order initiates a backend chain: stock verification -> payment/order database entry creation -> automatic stock deduction -> trigger to an automated `Email Dispatcher` -> returning a visual `Order Confirmation & Receipt` to the user's interface in real-time.
5. **Data & Admin Flow:** All client interactions (both from users and admins) communicate with the Node.js/Express backend API, which queries the PostgreSQL database via Prisma ORM. Admins use their dashboard to review sales performance, respond to low-stock notifications, and update physical inventories and pricing parameters.
