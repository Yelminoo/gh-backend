# Stone Tracking System - Single vs Bulk Tracking

## Overview

The GEM Market system now supports two distinct tracking modes for inventory management:
- **BULK Tracking**: Quantity-based inventory for commodity stones (traditional inventory)
- **SINGLE Tracking**: Individual stone tracking with unique identity and certificates

## Core Concepts

### 1. Tracking Modes

```typescript
enum TrackingMode {
  SINGLE    // Each stone has unique identity, certificate, lifecycle
  BULK      // Stones tracked as aggregate quantity only
}
```

#### BULK Mode
- **Use Case**: Commodity gemstones, wholesale lots, small stones
- **Tracking**: Aggregate quantities (e.g., "500 carats of commercial rubies")
- **Sales**: Customers buy by quantity (e.g., "buy 5 carats")
- **Inventory**: `totalQuantity`, `available`, `reserved` fields at parcel level
- **Certificates**: Parcel-level reports (not individual stones)

#### SINGLE Mode
- **Use Case**: High-value stones, certified diamonds, unique pieces
- **Tracking**: Each stone has unique ID, weight, dimensions, certificate
- **Sales**: Customers buy specific stones (e.g., "buy stone #RUBY-001-S042")
- **Inventory**: Sum of individual stone statuses
- **Certificates**: Individual GIA/IGI/AGS certificates per stone

### 2. Stone Types

```typescript
enum StoneType {
  DIAMOND, RUBY, SAPPHIRE, EMERALD, AMETHYST, TOPAZ, 
  GARNET, PEARL, OPAL, JADE, TOURMALINE, PERIDOT,
  AQUAMARINE, TANZANITE, CITRINE, ONYX, TURQUOISE,
  LAPIS_LAZULI, MOONSTONE, ALEXANDRITE, SPINEL, ZIRCON, OTHER
}
```

### 3. Data Models

#### Parcel (Enhanced)
```typescript
model Parcel {
  // Core tracking
  trackingMode: TrackingMode  // SINGLE or BULK
  stoneType: StoneType?       // Type of stone
  stoneProfileId: String?     // Shared characteristics
  
  // Bulk inventory (populated for BULK mode, computed for SINGLE mode)
  totalQuantity: Decimal
  available: Decimal
  reserved: Decimal
  
  // Relations
  stones: Stone[]             // Individual stones (SINGLE mode only)
  stoneProfile: StoneProfile  // Shared characteristics
}
```

#### StoneProfile (New)
Shared characteristics for stones in a parcel:
```typescript
model StoneProfile {
  stoneType: StoneType    // Diamond, Ruby, etc.
  shape: String?          // Round, Oval, Cushion, etc.
  finishType: FinishType  // ROUGH or POLISHED
  
  // Quality (4Cs)
  color: String?          // D-Z for diamonds, color for others
  clarity: String?        // FL, IF, VVS1, VVS2, VS1, VS2, SI1, SI2, I1, I2, I3
  cut: String?            // Excellent, Very Good, Good, Fair, Poor
  
  // Additional
  polish: String?
  symmetry: String?
  fluorescence: String?
  treatment: String?
  origin: String?
}
```

#### Stone (New - SINGLE mode only)
Individual stone with unique identity:
```typescript
model Stone {
  // Unique identity
  stoneCode: String       // Unique ID (e.g., "RUBY-2024-001-S042")
  internalRef: String?
  supplierStoneRef: String?
  
  // Physical measurements
  carat: Decimal          // Exact weight
  length, width, depth: Decimal?
  
  // Certificates
  certificateNumber: String?
  certificateIssuer: String?  // GIA, IGI, AGS, etc.
  certificateDate: DateTime?
  certificateUrl: String?
  laserInscription: String?
  
  // Individual pricing (can override parcel pricing)
  costPrice, wholesalePrice, retailPrice: Decimal?
  
  // Status
  status: StoneStatus     // AVAILABLE, RESERVED, ASSIGNED, SOLD, DAMAGED, RETURNED
  binLocation: String?    // Physical location in warehouse
  
  // Relations
  parcel: Parcel
  stoneProfile: StoneProfile
  lifecycle: StoneLifecycle[]
  allocations: StoneAllocation[]
}
```

#### StoneLifecycle (New)
Complete audit trail for individually tracked stones:
```typescript
model StoneLifecycle {
  stoneId: String
  event: StoneLifecycleEvent
  fromStatus, toStatus: StoneStatus?
  orderId, userId, warehouseId: String?
  notes: String?
  metadata: Json?
}

enum StoneLifecycleEvent {
  RECEIVED, GRADED, CERTIFIED, LISTED, RESERVED, RELEASED,
  SOLD, SHIPPED, RETURNED, DAMAGED, REPAIRED, RECUT,
  TRANSFERRED, SPLIT, COMBINED, ADJUSTED
}
```

## Usage Patterns

### Creating a BULK Parcel
```typescript
// 500 carats of commercial rubies
const parcel = await prisma.parcel.create({
  data: {
    parcelCode: 'RUBY-BULK-2024-001',
    trackingMode: 'BULK',
    stoneType: 'RUBY',
    unit: 'CARAT',
    totalQuantity: 500,
    available: 500,
    reserved: 0,
    costPrice: 10,      // $10 per carat
    retailPrice: 25,    // $25 per carat
    warehouseId: '...',
    // No individual stones created
  }
});
```

### Creating a SINGLE Parcel with Individual Stones
```typescript
// 10 certified diamonds
const parcel = await prisma.parcel.create({
  data: {
    parcelCode: 'DIAMOND-CERT-2024-001',
    trackingMode: 'SINGLE',
    stoneType: 'DIAMOND',
    unit: 'PIECE',
    totalQuantity: 10,  // Computed from count of stones
    warehouseId: '...',
    stones: {
      create: [
        {
          stoneCode: 'DIA-2024-001-S001',
          carat: 1.50,
          certificateNumber: 'GIA-2234567890',
          certificateIssuer: 'GIA',
          retailPrice: 15000,
          status: 'AVAILABLE',
          stoneProfileId: '...',
        },
        {
          stoneCode: 'DIA-2024-001-S002',
          carat: 1.75,
          certificateNumber: 'GIA-2234567891',
          certificateIssuer: 'GIA',
          retailPrice: 18000,
          status: 'AVAILABLE',
          stoneProfileId: '...',
        },
        // ... 8 more stones
      ]
    }
  }
});
```

### Selling from BULK Parcel
```typescript
// Customer buys 5 carats
await prisma.parcel.update({
  where: { id: parcelId },
  data: {
    available: { decrement: 5 },  // 500 -> 495 carats
    transactions: {
      create: {
        type: 'SALE',
        quantity: -5,
        reference: orderId,
      }
    }
  }
});
```

### Selling Individual Stone (SINGLE)
```typescript
// Customer buys specific stone
const stone = await prisma.stone.update({
  where: { stoneCode: 'DIA-2024-001-S001' },
  data: {
    status: 'SOLD',
    lifecycle: {
      create: {
        event: 'SOLD',
        fromStatus: 'AVAILABLE',
        toStatus: 'SOLD',
        orderId: '...',
        userId: '...',
      }
    },
    allocations: {
      create: {
        orderItemId: '...',
        allocatedPrice: 15000,
      }
    }
  }
});

// Update parcel aggregate
await recalculateParcelInventory(stone.parcelId);
```

### Querying Available Stones

#### BULK Mode - Get available quantity
```typescript
const bulkParcels = await prisma.parcel.findMany({
  where: {
    trackingMode: 'BULK',
    stoneType: 'RUBY',
    available: { gt: 0 },
  },
  select: {
    parcelCode: true,
    available: true,
    unit: true,
    retailPrice: true,
  }
});
```

#### SINGLE Mode - Get available individual stones
```typescript
const availableStones = await prisma.stone.findMany({
  where: {
    status: 'AVAILABLE',
    parcel: {
      stoneType: 'DIAMOND'
    }
  },
  include: {
    stoneProfile: true,
    parcel: {
      select: {
        parcelCode: true,
        warehouse: true,
      }
    }
  }
});
```

## Benefits

### BULK Mode Benefits
- ✅ Simple quantity tracking
- ✅ Fast inventory updates
- ✅ Suitable for commodity stones
- ✅ Less data storage
- ✅ Easier to manage large volumes

### SINGLE Mode Benefits
- ✅ Complete traceability
- ✅ Individual certificates
- ✅ Unique pricing per stone
- ✅ Full lifecycle history
- ✅ Customer can see specific stone
- ✅ Better for high-value inventory
- ✅ Provenance tracking
- ✅ Compliance with regulations

## Migration Guide

### Existing Parcels
All existing parcels default to `BULK` mode with the migration.

### Converting BULK to SINGLE
1. Create StoneProfile for shared characteristics
2. Set parcel.trackingMode = 'SINGLE'
3. Create individual Stone records
4. Link stones to profile
5. Ensure totalQuantity = count of stones

### Converting SINGLE to BULK
1. Aggregate all stone quantities
2. Delete individual Stone records
3. Set parcel.trackingMode = 'BULK'
4. Update available/reserved quantities

## API Endpoints

### Parcel Endpoints
- `POST /parcels` - Create parcel (specify trackingMode)
- `GET /parcels` - List all parcels (filter by trackingMode)
- `GET /parcels/:id` - Get parcel details (includes stones if SINGLE mode)
- `PATCH /parcels/:id` - Update parcel
- `POST /parcels/:id/stones` - Add stones to SINGLE mode parcel

### Stone Endpoints (New)
- `POST /stones` - Create individual stone
- `GET /stones` - List available stones
- `GET /stones/:id` - Get stone details with lifecycle
- `PATCH /stones/:id` - Update stone
- `GET /stones/:id/lifecycle` - Get complete lifecycle history
- `POST /stones/:id/certificate` - Attach certificate

## Database Indexes

```sql
-- Parcel indexes
CREATE INDEX "Parcel_trackingMode_status_idx" ON "Parcel"("trackingMode", "status");
CREATE INDEX "Parcel_stoneType_idx" ON "Parcel"("stoneType");

-- Stone indexes
CREATE INDEX "Stone_status_idx" ON "Stone"("status");
CREATE INDEX "Stone_certificateNumber_idx" ON "Stone"("certificateNumber");
CREATE INDEX "Stone_parcelId_idx" ON "Stone"("parcelId");
CREATE INDEX "Stone_stoneProfileId_idx" ON "Stone"("stoneProfileId");

-- Lifecycle indexes
CREATE INDEX "StoneLifecycle_stoneId_createdAt_idx" ON "StoneLifecycle"("stoneId", "createdAt");
CREATE INDEX "StoneLifecycle_event_idx" ON "StoneLifecycle"("event");
```

## Best Practices

1. **Choose BULK for**:
   - Commercial grade stones
   - Small stones in bulk
   - Stones without certificates
   - High-volume, low-value inventory

2. **Choose SINGLE for**:
   - Certified stones (GIA, IGI, etc.)
   - High-value diamonds/gems
   - Unique/rare stones
   - Stones with laser inscriptions
   - Customer requires provenance

3. **Lifecycle Tracking**:
   - Always log lifecycle events for SINGLE mode
   - Include userId for audit trail
   - Use metadata field for additional context

4. **Certificate Management**:
   - Store certificate URLs
   - Index certificate numbers
   - Track certificate issuer and date
   - Link laser inscriptions

5. **Inventory Sync**:
   - For SINGLE mode, always recalculate parcel.available from stone statuses
   - Run periodic reconciliation
   - Alert on discrepancies

## Performance Considerations

- BULK mode: O(1) inventory updates
- SINGLE mode: O(n) for n stones
- Use database transactions for SINGLE mode sales
- Consider caching stone counts for SINGLE parcels
- Implement pagination for large stone lists

## Security

- Individual stones require higher security
- Certificate verification
- Restrict stone deletion
- Audit all status changes
- Require approval for high-value stone movements
