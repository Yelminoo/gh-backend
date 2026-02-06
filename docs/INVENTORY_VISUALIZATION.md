# 💎 Stone Inventory System - Visual Guide

## 📊 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     GEMHAVEN MARKETPLACE                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
        ┌───────▼────────┐            ┌────────▼────────┐
        │   E-COMMERCE   │            │   INVENTORY     │
        │   (Frontend)   │            │   (Backend)     │
        └───────┬────────┘            └────────┬────────┘
                │                               │
    ┌───────────┴──────────┐        ┌──────────┴─────────┐
    │                      │        │                    │
┌───▼────┐          ┌─────▼─────┐  │  ┌──────────────┐  │
│Product │          │  Variant  │  │  │    Parcel    │  │
│        │◄─────────┤           │◄─┼──┤   (Batch)    │  │
│Listing │  1:Many  │   (SKU)   │  │  │              │  │
└────────┘          └───────────┘  │  └──────────────┘  │
                                   │                    │
                                   │  ┌──────────────┐  │
                                   └──┤ Transaction  │  │
                                      │   (Audit)    │  │
                                      └──────────────┘  │
```

---

## 🎯 Three Inventory Models

### Model 1: INDIVIDUAL (Simple E-commerce)

```
┌──────────────────────────────────────────────────────┐
│  PRODUCT: 18K Gold Diamond Ring                      │
│  Type: INDIVIDUAL                                    │
└──────────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
   ┌────▼─────┐           ┌────▼─────┐
   │ Variant  │           │ Variant  │
   │ Size 6   │           │ Size 7   │
   │ Stock: 3 │           │ Stock: 5 │
   └──────────┘           └──────────┘
        │                       │
        └───────────┬───────────┘
                    │
            ┌───────▼────────┐
            │   Order Item   │
            │  Qty: 1 ring   │
            └────────────────┘
                    │
         ┌──────────▼──────────┐
         │   Stock -= 1        │
         │   Simple!           │
         └─────────────────────┘
```

**Flow:**
```
Customer buys 1 ring (Size 7)
    ↓
OrderItem created
    ↓
variant.stock = 5 - 1 = 4
    ↓
✓ Done
```

---

### Model 2: PARCEL (Bulk/Wholesale)

```
┌──────────────────────────────────────────────────────┐
│  PRODUCT: Natural Ruby - AAA Grade (Loose Stones)    │
│  Type: PARCEL                                        │
└──────────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
   ┌────▼─────────────┐    ┌───▼────────────┐
   │    Variant       │    │  Track Stock   │
   │  5mm Round Cut   │    │  From Parcels  │
   │  trackByParcel   │    │                │
   │     = true       │    │  Stock = SUM   │
   └────┬─────────────┘    │  (parcels)     │
        │                  └────────────────┘
        │
   ┌────┴────────────────────────────────────┐
   │                                         │
┌──▼──────────────┐  ┌────────────────┐  ┌──▼──────────────┐
│ Parcel #1       │  │ Parcel #2      │  │ Parcel #3       │
│ Code: RUBY-001  │  │ Code: RUBY-002 │  │ Code: RUBY-003  │
│ Origin: Myanmar │  │ Origin: Thai   │  │ Origin: Sri L.  │
│ Grade: AAA      │  │ Grade: AAA     │  │ Grade: AAA      │
│                 │  │                │  │                 │
│ Total: 500ct    │  │ Total: 300ct   │  │ Total: 400ct    │
│ Available: 450ct│  │ Available: 250ct│ │ Available: 400ct│
│ Reserved: 50ct  │  │ Reserved: 50ct │  │ Reserved: 0ct   │
│ Unit: CARAT     │  │ Unit: CARAT    │  │ Unit: CARAT     │
└─────────────────┘  └────────────────┘  └─────────────────┘
       │                    │                     │
       └────────────────────┼─────────────────────┘
                           │
                  TOTAL AVAILABLE = 1,100 carats
```

**Flow:**
```
Customer buys 150 carats
    ↓
System finds available parcels (FIFO/LIFO)
    ↓
Allocation Strategy:
├─ Take 100ct from Parcel #1 (oldest)
└─ Take  50ct from Parcel #2
    ↓
Create OrderItemAllocations:
├─ Allocation #1: Parcel #1, 100ct
└─ Allocation #2: Parcel #2,  50ct
    ↓
Update Parcels:
├─ Parcel #1: available = 450 - 100 = 350ct
└─ Parcel #2: available = 250 -  50 = 200ct
    ↓
Create Transactions (Audit):
├─ Transaction: Parcel #1, SALE, -100ct
└─ Transaction: Parcel #2, SALE,  -50ct
    ↓
✓ Order fulfilled from 2 parcels
```

---

### Model 3: HYBRID (Flexible)

```
┌──────────────────────────────────────────────────────┐
│  PRODUCT: GIA Certified Diamond 1ct D VVS1           │
│  Type: HYBRID (Both modes supported)                 │
└──────────────────────────────────────────────────────┘
                    │
        ┌───────────┴────────────┐
        │                        │
   ┌────▼────────────┐    ┌──────▼──────────┐
   │  RETAIL MODE    │    │  WHOLESALE MODE │
   │  Single Pieces  │    │  Bulk Orders    │
   └────┬────────────┘    └──────┬──────────┘
        │                        │
   ┌────▼──────────┐      ┌──────▼──────────────┐
   │ Variant       │      │ Parcel              │
   │ Individual    │      │ Lot: DIA-LOT-001    │
   │ Stock: 1      │      │ Quantity: 10 pieces │
   │ Price: $15,000│      │ Price: $12,000 each │
   │               │      │ Min Order: 5 pieces │
   └───────────────┘      └─────────────────────┘

Customer Choice:
┌────────────────────┬─────────────────────┐
│   Buy 1 Diamond    │  Buy 5+ Diamonds    │
│   $15,000 retail   │  $12,000 wholesale  │
│   Immediate ship   │  Bulk discount      │
└────────────────────┴─────────────────────┘
```

---

## 🔄 Order Fulfillment Flow

### Simple Product (No Parcels)

```
┌──────────────┐
│   Customer   │
│  Places      │
│  Order       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  OrderItem   │
│  Variant: A  │
│  Qty: 2      │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  Update Stock    │
│  variant.stock   │
│  -= 2            │
└──────┬───────────┘
       │
       ▼
┌──────────────┐
│   Complete   │
│   ✓          │
└──────────────┘
```

### Parcel-Based Product (Multi-Source)

```
┌──────────────┐
│   Customer   │
│  Orders      │
│  500 carats  │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────┐
│  System Finds Parcels       │
│  with Available Stock       │
│  (Ordered by receivedAt)    │
└──────┬──────────────────────┘
       │
       ├──────────────────────┐
       │                      │
       ▼                      ▼
┌──────────────┐      ┌──────────────┐
│  Parcel #1   │      │  Parcel #2   │
│  Available:  │      │  Available:  │
│  300 carats  │      │  400 carats  │
└──────┬───────┘      └──────┬───────┘
       │                     │
       ▼                     ▼
┌──────────────┐      ┌──────────────┐
│ Allocate     │      │ Allocate     │
│ 300 carats   │      │ 200 carats   │
└──────┬───────┘      └──────┬───────┘
       │                     │
       └──────────┬──────────┘
                  │
                  ▼
         ┌────────────────┐
         │ Create         │
         │ Allocations:   │
         │ ├─ Parcel #1   │
         │ └─ Parcel #2   │
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │ Update Parcels │
         │ Availability   │
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │ Create Audit   │
         │ Transactions   │
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │  Complete ✓    │
         │  From 2 Parcels│
         └────────────────┘
```

---

## 🎯 Reservation System

```
Timeline: Add to Cart → Checkout → Payment

┌─────────────────────────────────────────────────────┐
│                    Parcel State                      │
├─────────────┬─────────────┬──────────────┬──────────┤
│   T=0       │   T=1 min   │   T=14 min   │ T=15 min │
│  Initial    │ Add to Cart │  In Cart     │  Timeout │
├─────────────┼─────────────┼──────────────┼──────────┤
│ Available:  │ Available:  │ Available:   │Available:│
│   500ct     │   450ct     │   450ct      │  500ct   │
│             │             │              │          │
│ Reserved:   │ Reserved:   │ Reserved:    │Reserved: │
│     0ct     │    50ct     │    50ct      │    0ct   │
│             │             │              │          │
│             │             │              │(Released)│
└─────────────┴─────────────┴──────────────┴──────────┘
           │            │             │           │
           ▼            ▼             ▼           ▼
      No Action    Reserve 50ct   Still     Release
                                Reserved    Back
```

**States:**
```
1. Add to Cart
   ├─> available -= quantity
   └─> reserved += quantity

2. Complete Order
   ├─> reserved -= quantity
   └─> (available already reduced)

3. Cancel/Timeout
   ├─> reserved -= quantity
   └─> available += quantity
```

---

## 📊 Database Relationships

```
┌────────────┐
│   Shop     │
└──────┬─────┘
       │
       │ 1:Many
       │
┌──────▼─────────┐
│    Product     │
│                │
│  inventoryType │◄───────┐
│  - INDIVIDUAL  │        │ Determines
│  - PARCEL      │        │ Behavior
│  - HYBRID      │        │
└──────┬─────────┘        │
       │                  │
       │ 1:Many           │
       │                  │
┌──────▼──────────┐       │
│ ProductVariant  │       │
│                 │       │
│ trackByParcel ◄─┼───────┘
│   = true/false  │
└──────┬──────────┘
       │
       ├─────────────────┬────────────┐
       │                 │            │
       │ If trackByParcel│            │
       │    = true       │            │
       │                 │            │
┌──────▼──────┐   ┌──────▼─────┐     │
│   Parcel    │   │ OrderItem  │     │
│             │   │            │     │
│ totalQty    │   │            │     │
│ available   │   └──────┬─────┘     │
│ reserved    │          │           │
│             │          │           │
│ unit (enum) │   ┌──────▼──────────┐│
└──────┬──────┘   │OrderItem        ││
       │          │Allocation       ││
       │          │                 ││
       │          │ Links order to  ││
       └──────────┤ specific parcel ││
                  └─────────────────┘│
                                     │
┌──────────────────────────────────┐ │
│   ParcelTransaction              │ │
│   (Audit Trail)                  │ │
│                                  │ │
│   - RECEIVED                     │ │
│   - SALE                         │ │
│   - RESERVED                     │ │
│   - RELEASED                     │ │
│   - ADJUSTMENT                   │ │
│   - DAMAGED                      │ │
└──────────────────────────────────┘ │
                                     │
                  Stock Calculation ─┘
                  variant.stock = SUM(parcels.available)
```

---

## 🎨 Admin UI Flow

### Dashboard View

```
┌────────────────────────────────────────────────────────────┐
│  GEMHAVEN ADMIN - INVENTORY DASHBOARD                      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  📦 Products Overview                                      │
│  ┌──────────────┬──────────────┬──────────────┐          │
│  │  INDIVIDUAL  │   PARCEL     │    HYBRID    │          │
│  │    125       │      48      │      12      │          │
│  │  products    │  products    │  products    │          │
│  └──────────────┴──────────────┴──────────────┘          │
│                                                            │
│  💎 Parcel Summary                                         │
│  ┌────────────────────────────────────────────┐          │
│  │  Total Parcels: 156                        │          │
│  │  In Stock: 142                             │          │
│  │  Reserved: 8                               │          │
│  │  Low Stock Alert: 6                        │          │
│  └────────────────────────────────────────────┘          │
│                                                            │
│  📊 Recent Transactions                                    │
│  ┌──────────┬─────────┬──────────┬───────────┐          │
│  │ Parcel   │ Type    │ Quantity │ Date      │          │
│  ├──────────┼─────────┼──────────┼───────────┤          │
│  │ RUBY-001 │ SALE    │ -50ct    │ 2h ago    │          │
│  │ DIA-055  │ RECEIVED│ +100ct   │ 5h ago    │          │
│  │ EME-023  │ RESERVED│  30ct    │ 1d ago    │          │
│  └──────────┴─────────┴──────────┴───────────┘          │
└────────────────────────────────────────────────────────────┘
```

### Product Edit - INDIVIDUAL Mode

```
┌────────────────────────────────────────────────────────────┐
│  EDIT PRODUCT: 18K Gold Diamond Ring                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Inventory Type: ● INDIVIDUAL  ○ PARCEL  ○ HYBRID         │
│                                                            │
│  Variants:                                                 │
│  ┌──────────────────────────────────────────────┐        │
│  │ Size 6  │ SKU: RING-001-6  │ Stock: [  3  ] │        │
│  │ Size 7  │ SKU: RING-001-7  │ Stock: [  5  ] │        │
│  │ Size 8  │ SKU: RING-001-8  │ Stock: [  2  ] │        │
│  └──────────────────────────────────────────────┘        │
│                                                            │
│  [+ Add Variant]  [Save Changes]                          │
└────────────────────────────────────────────────────────────┘
```

### Product Edit - PARCEL Mode

```
┌────────────────────────────────────────────────────────────┐
│  EDIT PRODUCT: Natural Ruby - AAA Grade                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Inventory Type: ○ INDIVIDUAL  ● PARCEL  ○ HYBRID         │
│                                                            │
│  Variant: 5mm Round Cut                                    │
│  Track by Parcel: ✓ Enabled                               │
│  Calculated Stock: 1,100 carats                           │
│                                                            │
│  Parcels for this variant:                                 │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Code      │ Origin  │ Grade│ Total│ Avail│ Resv  │  │
│  ├───────────┼─────────┼──────┼──────┼──────┼───────┤  │
│  │ RUBY-001  │ Myanmar │ AAA  │ 500ct│ 350ct│  50ct │  │
│  │ RUBY-002  │ Thailand│ AAA  │ 300ct│ 200ct│  50ct │  │
│  │ RUBY-003  │ Sri Lank│ AAA  │ 400ct│ 400ct│   0ct │  │
│  └───────────┴─────────┴──────┴──────┴──────┴───────┘  │
│                                                            │
│  [+ Add Parcel]  [View Transactions]  [Save]              │
└────────────────────────────────────────────────────────────┘
```

### Add Parcel Modal

```
┌────────────────────────────────────────────────────────────┐
│  ADD NEW PARCEL                                     [X]    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Parcel Code: [RUBY-004________________]  (Auto-gen)      │
│                                                            │
│  Supplier Ref: [SUPP-2024-0156_________]                  │
│                                                            │
│  Origin: [Mogok, Myanmar_______________]                  │
│                                                            │
│  Quality Grade: [▼ AAA                ]                   │
│                                                            │
│  Certification: [GIA-123456789_________]  (Optional)      │
│                                                            │
│  Unit: [▼ CARAT                        ]                  │
│                                                            │
│  Total Quantity: [_500.00______________]  carats          │
│                                                            │
│  Cost Price: $_[____10.00______________]  per carat       │
│                                                            │
│  Wholesale Price: $_[____100.00_________]  per carat      │
│                                                            │
│  Retail Price: $_[____150.00___________]  per carat       │
│                                                            │
│  Min Order Qty: [___10.00______________]  carats          │
│                                                            │
│  Notes: [______________________________________]          │
│         [______________________________________]          │
│                                                            │
│  Upload Images: [Choose Files] (0 selected)               │
│                                                            │
│         [Cancel]              [Add Parcel]                │
└────────────────────────────────────────────────────────────┘
```

---

## 📈 Reporting & Analytics

### Stock Value Report

```
┌────────────────────────────────────────────────────────────┐
│  INVENTORY VALUE REPORT                                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  By Product Type:                                          │
│  ┌────────────────────────────────────────────┐          │
│  │ Finished Jewelry (INDIVIDUAL)              │          │
│  │ ├─ 125 products                            │          │
│  │ ├─ Total Value: $458,900                   │          │
│  │ └─ Avg Value/Product: $3,671               │          │
│  │                                             │          │
│  │ Loose Stones (PARCEL)                      │          │
│  │ ├─ 48 products                             │          │
│  │ ├─ 156 parcels                             │          │
│  │ ├─ Total Value: $1,245,000                 │          │
│  │ └─ Avg Value/Parcel: $7,981                │          │
│  │                                             │          │
│  │ Certified Stones (HYBRID)                  │          │
│  │ ├─ 12 products                             │          │
│  │ ├─ Total Value: $567,800                   │          │
│  │ └─ Avg Value/Product: $47,317              │          │
│  └─────────────────────────────────────────────┘          │
│                                                            │
│  TOTAL INVENTORY VALUE: $2,271,700                        │
└────────────────────────────────────────────────────────────┘
```

### Parcel Movement Chart

```
Monthly Parcel Transactions
                                
  Inbound (Received) │ █████████████████ 45 parcels
  Outbound (Sales)   │ ███████████ 28 parcels
  Adjustments        │ ██ 3 parcels
  Damaged/Lost       │ █ 1 parcel
                     │
                     └───────────────────────────
                       Jan 2026
```

---

## ✅ Decision Tree: Which Model to Use?

```
START: Adding New Product
        │
        ▼
   ┌────────────────────┐
   │  Is this a         │
   │  finished piece?   │───No──┐
   │  (ring, necklace)  │       │
   └────────┬───────────┘       │
            │ Yes               │
            ▼                   ▼
   ┌────────────────┐  ┌───────────────────┐
   │   INDIVIDUAL   │  │  Do you sell in   │
   │                │  │  bulk/wholesale?  │
   │ Simple stock   │  └────────┬──────────┘
   │ counting       │           │
   └────────────────┘           │
            │            ┌──────┴──────┐
            │            │Yes          │No
            │            │             │
            ▼            ▼             ▼
       ┌────────┐  ┌─────────┐  ┌──────────┐
       │ Use It │  │ HYBRID  │  │ PARCEL   │
       └────────┘  │         │  │          │
                   │ Both    │  │ Bulk     │
                   │ retail  │  │ tracking │
                   │ & bulk  │  │ only     │
                   └─────────┘  └──────────┘
```

---

## 🎯 Key Takeaways

1. **Start Simple**: Use INDIVIDUAL for most products
2. **Add Complexity**: Switch to PARCEL only for bulk items
3. **Flexible**: Can mix both in same shop
4. **Traceable**: Always know where stock came from
5. **Scalable**: Handles growth from 10 to 10,000+ products

---

This visual guide should help you understand how the inventory system works! 🚀
