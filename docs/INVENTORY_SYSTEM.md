# 💎 Stone & Gemstone Inventory System

## Overview
This system supports **three inventory models** for maximum flexibility in your jewelry marketplace:

1. **INDIVIDUAL** - Standard e-commerce (finished jewelry pieces)
2. **PARCEL** - Bulk/batch inventory (loose stones, rough material)
3. **HYBRID** - Both modes (certified stones that can be sold individually or in bulk)

---

## 🎯 Use Cases

### Scenario 1: Finished Jewelry (INDIVIDUAL)
**Example**: Selling a completed gold ring with diamond

```typescript
Product {
  name: "18K Gold Diamond Ring",
  inventoryType: INDIVIDUAL
}

ProductVariant {
  sku: "RING-001-SIZE-7",
  stock: 5,  // 5 rings in stock
  trackByParcel: false  // Simple stock count
}
```

**Stock Management**: Direct count. When sold, stock decrements by 1.

---

### Scenario 2: Loose Stones - Wholesale (PARCEL)
**Example**: Bulk loose rubies sold by carat

```typescript
Product {
  name: "Natural Ruby - AAA Grade",
  inventoryType: PARCEL
}

ProductVariant {
  sku: "RUBY-AAA-5MM",
  trackByParcel: true,  // Stock calculated from parcels
  stock: 0  // Calculated dynamically
}

// You received 500 carats from supplier
Parcel {
  parcelCode: "RUBY-2024-001",
  variantId: "variant-id",
  unit: CARAT,
  totalQuantity: 500,
  available: 500,
  reserved: 0,
  origin: "Mogok, Myanmar",
  qualityGrade: "AAA",
  wholesalePrice: 100.00,  // $100 per carat
  minOrderQty: 10  // Must buy at least 10 carats
}

// Customer orders 50 carats
OrderItem {
  variantId: "variant-id",
  quantity: 50,
  price: 100.00
}

// System creates allocation
OrderItemAllocation {
  orderItemId: "order-item-id",
  parcelId: "parcel-id",
  quantity: 50  // Takes 50 carats from this parcel
}

// Parcel auto-updates
Parcel {
  available: 450,  // 500 - 50
  reserved: 0
}
```

---

### Scenario 3: Certified Stones - Hybrid (HYBRID)
**Example**: GIA certified diamond - can sell individually or in lots

```typescript
Product {
  name: "GIA Certified Diamond - 1ct D VVS1",
  inventoryType: HYBRID
}

// Option A: Sell as single piece
ProductVariant {
  sku: "DIA-GIA-123456",
  trackByParcel: false,
  stock: 1,
  price: 15000.00
}

// Option B: Part of a wholesale lot
Parcel {
  parcelCode: "DIA-LOT-2024-05",
  unit: PIECE,
  totalQuantity: 10,  // 10 diamonds
  available: 10,
  wholesalePrice: 12000.00,  // Bulk discount
  minOrderQty: 5  // Minimum 5 pieces
}
```

---

## 📊 Data Flow Examples

### Example 1: Simple Product Sale (No Parcels)
```
Customer buys 1 ring
↓
OrderItem created (quantity: 1)
↓
ProductVariant.stock -= 1
✓ Done
```

### Example 2: Parcel-Based Sale
```
Customer buys 100 carats of ruby
↓
OrderItem created (quantity: 100)
↓
System finds parcels with available stock
↓
Creates OrderItemAllocation(s):
  - 50 carats from Parcel A
  - 50 carats from Parcel B
↓
Updates parcel availability:
  - Parcel A: available -= 50
  - Parcel B: available -= 50
↓
Creates ParcelTransaction records (audit trail)
✓ Done
```

### Example 3: Multi-Parcel Fulfillment
```
Customer orders 1000 carats, but you have:
  - Parcel 1: 400 carats available
  - Parcel 2: 300 carats available
  - Parcel 3: 500 carats available
  
System creates 3 allocations:
  - Allocation 1: 400 from Parcel 1
  - Allocation 2: 300 from Parcel 2
  - Allocation 3: 300 from Parcel 3
  
Total: 1000 carats fulfilled ✓
```

---

## 🔧 Key Features

### 1. **Flexible Units**
```typescript
enum StoneUnit {
  PIECE,      // Individual items
  CARAT,      // Gemstone weight
  GRAM,       // Metal/stone weight
  KILOGRAM,   // Bulk
  SQFT,       // Slabs
  SLAB,       // Stone slabs
  TON,        // Large bulk
  LOT         // Pre-packaged
}
```

### 2. **Automatic Stock Calculation**
```typescript
// For trackByParcel = true variants
variant.stock = sum(parcels.available)

// Example:
Parcel 1: 200 carats available
Parcel 2: 150 carats available
Parcel 3: 100 carats available
------------------------
Variant stock: 450 carats
```

### 3. **Reservation System**
```typescript
// When customer adds to cart
Parcel {
  available: 400,
  reserved: 50,  // Held for 15 minutes
}

// After checkout timeout or cancel
Parcel {
  available: 450,
  reserved: 0,  // Released back
}
```

### 4. **Complete Audit Trail**
```typescript
ParcelTransaction {
  type: SALE,
  quantity: -50,  // Negative = outgoing
  reference: "ORDER-12345",
  performedBy: "user-id",
  createdAt: "2024-01-31T10:00:00Z"
}
```

---

## 💡 Business Logic Examples

### Calculate Available Stock for Variant
```typescript
async function getAvailableStock(variantId: string) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { parcels: true }
  });
  
  if (!variant.trackByParcel) {
    return variant.stock; // Simple count
  }
  
  // Sum all parcel availability
  const totalAvailable = variant.parcels.reduce(
    (sum, parcel) => sum + parcel.available, 
    0
  );
  
  return totalAvailable;
}
```

### Reserve Stock (Add to Cart)
```typescript
async function reserveStock(variantId: string, quantity: number) {
  const parcels = await prisma.parcel.findMany({
    where: { 
      variantId,
      status: 'IN_STOCK',
      available: { gte: 0 }
    },
    orderBy: { receivedAt: 'asc' } // FIFO
  });
  
  let remaining = quantity;
  const allocations = [];
  
  for (const parcel of parcels) {
    if (remaining <= 0) break;
    
    const take = Math.min(remaining, parcel.available);
    
    await prisma.parcel.update({
      where: { id: parcel.id },
      data: {
        available: { decrement: take },
        reserved: { increment: take }
      }
    });
    
    allocations.push({ parcelId: parcel.id, quantity: take });
    remaining -= take;
  }
  
  if (remaining > 0) {
    throw new Error('Insufficient stock');
  }
  
  return allocations;
}
```

### Complete Order (Convert Reserved to Sold)
```typescript
async function fulfillOrder(orderId: string) {
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId },
    include: { allocations: true }
  });
  
  for (const item of orderItems) {
    for (const allocation of item.allocations) {
      // Update parcel
      await prisma.parcel.update({
        where: { id: allocation.parcelId },
        data: {
          reserved: { decrement: allocation.quantity }
          // Available already decreased during reservation
        }
      });
      
      // Create audit trail
      await prisma.parcelTransaction.create({
        data: {
          parcelId: allocation.parcelId,
          type: 'SALE',
          quantity: -allocation.quantity,
          reference: orderId,
          performedBy: 'system'
        }
      });
    }
  }
}
```

---

## 🎨 UI Considerations

### Product Listing Page
```typescript
// Show based on inventoryType
if (product.inventoryType === 'INDIVIDUAL') {
  // Show: "5 in stock"
  // Button: "Add to Cart"
}

if (product.inventoryType === 'PARCEL') {
  // Show: "450 carats available"
  // Input: Quantity (min: 10 carats)
  // Show: "Min order: 10 carats"
  // Button: "Add to Cart"
}

if (product.inventoryType === 'HYBRID') {
  // Toggle: "Buy Single" / "Buy Bulk"
  // Different pricing displayed
}
```

### Admin Inventory Page
```typescript
// For INDIVIDUAL products
- Simple stock field
- Add/Remove stock buttons

// For PARCEL products
- List all parcels
- Show: Parcel Code, Origin, Grade, Available/Reserved
- Add Parcel button
- View transactions per parcel
- Stock auto-calculated
```

---

## ✅ Benefits of This System

1. **Flexibility**: Handle both retail and wholesale
2. **Traceability**: Know exactly which parcel fulfilled which order
3. **Audit Trail**: Complete history of all stock movements
4. **Multi-Source**: One order can pull from multiple parcels
5. **Reservation**: Prevent overselling during checkout
6. **Cost Tracking**: Track profit per parcel/batch
7. **Quality Control**: Track origin, grade, certificates per batch
8. **Backward Compatible**: Works with simple stock counting too

---

## 🚀 Migration Path

### Phase 1: Start Simple
- Use INDIVIDUAL for all products
- Simple stock field works as before
- No changes needed for existing products

### Phase 2: Add Parcel System
- Mark specific products as PARCEL type
- Create parcels for bulk inventory
- System auto-calculates stock

### Phase 3: Advanced Features
- Add reservation system
- Implement FIFO/LIFO fulfillment
- Add cost tracking and profit reports
- Multi-location support

---

## 📝 Database Indexes Added
```prisma
@@index([shopId, status])  // Fast parcel queries per shop
@@index([variantId])        // Fast parcel lookup per variant
@@index([parcelCode])       // Fast parcel code lookup
@@index([parcelId, createdAt]) // Fast transaction history
@@index([orderItemId])      // Fast allocation queries
```

---

## 🎯 Next Steps

1. Run migration: `npx prisma migrate dev --name add_stone_inventory_system`
2. Update services to handle both inventory types
3. Create admin UI for parcel management
4. Implement reservation timeout logic
5. Add inventory reports and analytics
