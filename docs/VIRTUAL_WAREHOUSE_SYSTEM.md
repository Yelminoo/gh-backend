# Virtual Warehouse System Documentation

## Overview

The Virtual Warehouse system extends the physical warehouse concept by introducing **logical warehouses** that represent non-physical inventory locations and enable intelligent inventory routing decisions.

## Warehouse Types

### 1. PHYSICAL Warehouses
- **Real locations** with physical addresses
- Traditional warehouses, stores, fulfillment centers
- Require: address, city, country
- Example: "Main Warehouse - Los Angeles", "Downtown Store", "Fulfillment Center #3"

### 2. VIRTUAL Warehouses
- **Logical locations** for inventory states
- No physical address required
- System-managed or custom created
- Examples:
  - "Pending Receipt" - Items ordered but not yet received
  - "In Transit" - Items being moved between locations
  - "Customer Returns" - Items returned by customers
  - "Quality Inspection" - Items being inspected
  - "Consignment" - Items held on consignment
  - "Damaged/Defective" - Items that can't be sold

## Database Schema

### Warehouse Model
```prisma
model Warehouse {
  id          String        @id @default(uuid())
  shopId      String
  name        String
  code        String
  type        WarehouseType @default(PHYSICAL)
  
  // Optional for virtual warehouses
  address     String?
  city        String?
  country     String?
  
  isActive    Boolean  @default(true)
  isPrimary   Boolean  @default(false)
  isSystem    Boolean  @default(false) // System-managed, non-deletable
  
  // Relations
  parcels     Parcel[]
  fulfillments Fulfillment[]
  ...
}
```

### VirtualWarehouse Model
```prisma
model VirtualWarehouse {
  id        String   @id @default(uuid())
  shopId    String
  name      String
  type      VirtualWarehouseType
  priority  Int      @default(0)  // Higher = preferred for fulfillment
  isActive  Boolean  @default(true)
  
  routes    VirtualWarehouseRoute[]  // Maps to physical warehouses
  fulfillments Fulfillment[]
}
```

### Virtual Warehouse Types
```prisma
enum VirtualWarehouseType {
  DEFAULT          // Default fulfillment logic
  PRIORITY         // Priority-based routing
  PROXIMITY        // Ship from nearest warehouse
  COST_OPTIMIZED   // Lowest shipping cost
  INVENTORY_LEVEL  // Balance inventory across locations
  CUSTOM           // Custom routing logic
}
```

### VirtualWarehouseRoute
```prisma
model VirtualWarehouseRoute {
  id                  String @id
  virtualWarehouseId  String
  warehouseId         String  // Physical warehouse
  priority            Int     @default(0)
  isActive            Boolean @default(true)
  
  virtualWarehouse    VirtualWarehouse @relation(...)
  warehouse           Warehouse        @relation(...)
}
```

## Use Cases

### 1. Simple Multi-Location Fulfillment
```typescript
// Create a virtual warehouse that routes to nearest physical location
const virtualWarehouse = {
  name: "Auto-Select Warehouse",
  type: "PROXIMITY",
  routes: [
    { warehouseId: "LA-warehouse", priority: 1 },
    { warehouseId: "NY-warehouse", priority: 1 },
    { warehouseId: "TX-warehouse", priority: 1 }
  ]
};
```

### 2. Priority-Based Fulfillment
```typescript
// Primary warehouse first, backup warehouses if stock unavailable
const virtualWarehouse = {
  name: "Primary First",
  type: "PRIORITY",
  routes: [
    { warehouseId: "main-warehouse", priority: 10 },
    { warehouseId: "backup-warehouse-1", priority: 5 },
    { warehouseId: "backup-warehouse-2", priority: 1 }
  ]
};
```

### 3. Inventory State Tracking
```typescript
// Track items in non-sellable states
const virtualWarehouses = [
  {
    name: "Pending Receipt",
    type: "CUSTOM",
    isSystem: true,
    routes: [] // No physical location yet
  },
  {
    name: "Quality Inspection",
    type: "CUSTOM",
    isSystem: true,
    routes: [{ warehouseId: "qa-facility", priority: 1 }]
  }
];
```

## API Endpoints

### Get Warehouses with Type Filter
```http
GET /warehouses?type=PHYSICAL
GET /warehouses?type=VIRTUAL
GET /warehouses?shopId=xxx&isActive=true&type=PHYSICAL
```

### Create Physical Warehouse
```http
POST /warehouses
Content-Type: application/json

{
  "shopId": "uuid",
  "name": "Los Angeles Warehouse",
  "code": "LA-01",
  "type": "PHYSICAL",
  "address": "123 Main St",
  "city": "Los Angeles",
  "country": "USA",
  "isPrimary": true
}
```

### Create Virtual Warehouse
```http
POST /warehouses
Content-Type: application/json

{
  "shopId": "uuid",
  "name": "In Transit",
  "code": "TRANSIT",
  "type": "VIRTUAL",
  "isSystem": true,
  "notes": "Items being shipped between locations"
}
```

## Fulfillment Flow

### Order Fulfillment Process
```
1. Order Created
   ↓
2. Virtual Warehouse Selected (based on rules)
   ↓
3. Routes Evaluated (priority, stock availability, proximity)
   ↓
4. Physical Warehouse Chosen
   ↓
5. Fulfillment Created
   ↓
6. Stock Allocated from Physical Warehouse
   ↓
7. Shipment Processed
```

### Example Fulfillment
```typescript
const fulfillment = {
  orderId: "order-123",
  virtualWarehouseId: "vw-proximity",  // Virtual warehouse logic
  warehouseId: "LA-warehouse",         // Chosen physical warehouse
  status: "PLANNED",
  items: [
    { orderItemId: "item-1", quantity: 2 },
    { orderItemId: "item-2", quantity: 1 }
  ]
};
```

## Benefits

### 1. Intelligent Routing
- Automatically select best warehouse for each order
- Consider proximity, inventory levels, shipping costs
- Easy to update routing logic without code changes

### 2. Inventory Visibility
- Track items in transit, pending receipt, quality control
- Separate sellable from non-sellable inventory
- Better reporting and forecasting

### 3. Multi-Location Management
- Single interface for managing all locations
- Flexible fulfillment strategies per product/customer
- Easy to add new warehouses

### 4. Scalability
- Add warehouses without changing application code
- Configure routing rules per shop
- Support complex fulfillment scenarios (dropshipping, 3PL)

## Implementation Status

✅ **Completed:**
- Database schema with WarehouseType enum
- Virtual warehouse models and relations
- Warehouse API with type filtering
- Physical warehouse CRUD operations
- Migration applied successfully

🚧 **Pending:**
- Virtual warehouse CRUD endpoints
- Fulfillment logic implementation
- Routing algorithm implementation
- Frontend UI for virtual warehouses
- Parcel assignment to virtual warehouses
- Fulfillment dashboard

## Next Steps

1. **Create Virtual Warehouse Service**
   - CRUD operations for virtual warehouses
   - Route management (add/remove physical warehouses)
   - Routing logic implementation

2. **Fulfillment Service**
   - Order fulfillment workflow
   - Warehouse selection algorithm
   - Stock allocation logic

3. **Frontend Components**
   - Virtual warehouse management page
   - Route configuration interface
   - Fulfillment dashboard
   - Parcel location tracking

4. **Advanced Features**
   - Real-time inventory sync across locations
   - Automated rebalancing suggestions
   - Cost optimization algorithms
   - Customer proximity calculation

## Example Scenarios

### Scenario 1: Jewelry Store with Multiple Locations
```typescript
// Physical warehouses
const warehouses = [
  { name: "Beverly Hills Store", type: "PHYSICAL", code: "BH-01" },
  { name: "Downtown LA Store", type: "PHYSICAL", code: "DT-01" },
  { name: "Online Warehouse", type: "PHYSICAL", code: "OL-01" }
];

// Virtual warehouse for online orders
const virtualWarehouse = {
  name: "Online Orders Auto-Route",
  type: "PROXIMITY",
  routes: warehouses.map((w, i) => ({ 
    warehouseId: w.id, 
    priority: i + 1 
  }))
};
```

### Scenario 2: Gemstone Wholesaler
```typescript
// Track gemstone parcels through states
const virtualWarehouses = [
  { name: "Customs Clearance", type: "CUSTOM", isSystem: true },
  { name: "GIA Certification", type: "CUSTOM", isSystem: true },
  { name: "Available for Sale", type: "DEFAULT", routes: [mainWarehouse] },
  { name: "Reserved for Orders", type: "CUSTOM" },
  { name: "In Transit to Customer", type: "CUSTOM" }
];
```

---

**For questions or implementation guidance, see:**
- `docs/INVENTORY_SYSTEM.md` - Core inventory concepts
- `docs/INVENTORY_VISUALIZATION.md` - Visual diagrams
- `prisma/schema.prisma` - Complete database schema
