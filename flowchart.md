# 🔄 System Flowchart

This document outlines the high-level flow of the **3D Roofing Design and Inventory Management System**, including the user experience, admin management, backend data flow, and the 3D asset pipeline.

## System Architecture Flow

The following Mermaid diagram visualizes the overall architecture and interactions between different modules of the system:

```mermaid
graph TD
    %% User Flow
    subgraph UserInterface [User Interface / Frontend - React]
        UReg[User Registration]
        ULog[User Login]
        U1[Home / Browse Products]
        U2[3D Roof Designer]
        U3[Customize: Type, Dimensions, Materials]
        U4[Live Cost Computation]
        U5[Add to Cart]
        U6[Place Order / Checkout]
        
        UReg --> ULog
        ULog --> U1
        U1 --> U2
        U2 --> U3
        U3 --> U4
        U4 --> U5
        U5 --> U6
    end

    %% Admin Flow
    subgraph AdminPanel [Admin Dashboard - React]
        A1[Admin Login]
        A2[Dashboard Overview]
        A3[Manage Products & Inventory]
        A4[Track Orders & Monitor Sales]
        
        A1 --> A2
        A2 --> A3
        A2 --> A4
    end

    %% Backend & Database Flow
    subgraph BackendSystem [Backend System]
        B1[Express.js API]
        DB[(PostgreSQL Database)]
    end

    %% 3D Pipeline Flow
    subgraph ThreeDPipeline [3D Model Pipeline]
        M1[Design Models in Blender]
        M2[Export as .glb / .gltf]
        M3[Load via Three.js]
        
        M1 --> M2
        M2 --> M3
    end

    %% Flow Connections
    %% 3D Integration
    M3 -.->|Renders in| U2

    %% API Requests
    UReg -->|Register User Data| B1
    ULog -->|Authenticate User| B1
    U6 -->|Submit Order Data| B1
    U1 -->|Fetch Product List| B1
    
    A3 -->|Add/Edit/Delete Data| B1
    A4 -->|Fetch Sales & Orders| B1
    
    %% Database Interaction
    B1 <-->|Read / Write via Prisma ORM| DB
    
    %% API Responses
    B1 -.->|JSON Response| UserInterface
    B1 -.->|JSON Response| AdminPanel
```

### Flow Highlights:

1. **3D Integration Flow:** 3D Models are created in Blender, exported in `.glb`/`.gltf` format, and loaded dynamically into the interactive designer via Three.js.
2. **User Flow:** A user registers and logs into the application, browses products, enters the 3D designer to customize their roof (live cost computed), and proceeds to place an order.
3. **Data Flow:** All client interactions (both from users and admins) communicate with the Node.js/Express backend API, which queries the PostgreSQL database via Prisma ORM.
4. **Admin Flow:** Admins have a separate interface to monitor sales, update the inventory, and track placed orders.
