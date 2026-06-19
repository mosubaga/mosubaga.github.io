# MongoDB Query Cheatsheet

A quick reference guide for querying documents in MongoDB.

## Basic Query Operations

### Find Documents

**Find all documents in a collection:**

```jsx
db.collection.find()
```

**Find documents matching a condition:**

```jsx
db.collection.find({ status: "active" })
```

**Find one document:**

```jsx
db.collection.findOne({ _id: ObjectId("...") })
```

### Query Operators

### Comparison Operators

```jsx
// Equal to
db.collection.find({ age: 25 })

// Greater than
db.collection.find({ age: { $gt: 25 } })

// Greater than or equal
db.collection.find({ age: { $gte: 25 } })

// Less than
db.collection.find({ age: { $lt: 25 } })

// Less than or equal
db.collection.find({ age: { $lte: 25 } })

// Not equal
db.collection.find({ status: { $ne: "inactive" } })

// In array
db.collection.find({ status: { $in: ["active", "pending"] } })

// Not in array
db.collection.find({ status: { $nin: ["deleted", "archived"] } })
```

### Logical Operators

```jsx
// AND (implicit)
db.collection.find({ status: "active", age: { $gte: 18 } })

// AND (explicit)
db.collection.find({ $and: [
  { status: "active" },
  { age: { $gte: 18 } }
]})

// OR
db.collection.find({ $or: [
  { status: "active" },
  { priority: "high" }
]})

// NOT
db.collection.find({ age: { $not: { $gte: 18 } } })

// NOR
db.collection.find({ $nor: [
  { status: "deleted" },
  { archived: true }
]})
```

## Field Projection

**Include specific fields:**

```jsx
db.collection.find({ status: "active" }, { name: 1, email: 1 })
```

**Exclude specific fields:**

```jsx
db.collection.find({}, { password: 0, internal_id: 0 })
```

<aside>
💡

You cannot mix inclusion and exclusion (except for `_id` field)

</aside>

## Querying Arrays

**Match exact array:**

```jsx
db.collection.find({ tags: ["mongodb", "database"] })
```

**Match array containing element:**

```jsx
db.collection.find({ tags: "mongodb" })
```

**Match array with $all:**

```jsx
db.collection.find({ tags: { $all: ["mongodb", "nosql"] } })
```

**Match by array size:**

```jsx
db.collection.find({ tags: { $size: 3 } })
```

**Query array elements:**

```jsx
db.collection.find({ "tags.0": "mongodb" })
```

**$elemMatch for complex conditions:**

```jsx
db.collection.find({
  scores: { $elemMatch: { $gte: 80, $lt: 90 } }
})
```

## Querying Nested Documents

**Dot notation:**

```jsx
db.collection.find({ "[address.city](http://address.city)": "New York" })
```

**Match entire nested document:**

```jsx
db.collection.find({ 
  address: { street: "123 Main St", city: "NYC" }
})
```

## Regular Expressions

```jsx
// Case-sensitive match
db.collection.find({ name: /^John/ })

// Case-insensitive match
db.collection.find({ name: { $regex: /john/i } })

// Using $options
db.collection.find({ name: { $regex: "^john", $options: "i" } })
```

## Existence and Type Checks

**Check if field exists:**

```jsx
db.collection.find({ email: { $exists: true } })
```

**Check field type:**

```jsx
db.collection.find({ age: { $type: "number" } })
db.collection.find({ age: { $type: 16 } }) // 16 = 32-bit integer
```

## Sorting, Limiting & Skipping

**Sort ascending:**

```jsx
db.collection.find().sort({ age: 1 })
```

**Sort descending:**

```jsx
db.collection.find().sort({ createdAt: -1 })
```

**Limit results:**

```jsx
db.collection.find().limit(10)
```

**Skip results (pagination):**

```jsx
db.collection.find().skip(20).limit(10)
```

**Combine operations:**

```jsx
db.collection.find({ status: "active" })
  .sort({ createdAt: -1 })
  .skip(10)
  .limit(5)
```

## Counting Documents

**Count all documents:**

```jsx
db.collection.countDocuments()
```

**Count with filter:**

```jsx
db.collection.countDocuments({ status: "active" })
```

**Estimated count (faster, less accurate):**

```jsx
db.collection.estimatedDocumentCount()
```

## Distinct Values

```jsx
db.collection.distinct("category")
db.collection.distinct("city", { status: "active" })
```

## Text Search

**Create text index first:**

```jsx
db.collection.createIndex({ content: "text" })
```

**Perform text search:**

```jsx
db.collection.find({ $text: { $search: "mongodb query" } })
```

**Text search with score:**

```jsx
db.collection.find(
  { $text: { $search: "database" } },
  { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } })
```

## Aggregation Pipeline Basics

```jsx
db.collection.aggregate([
  // Match stage (filter)
  { $match: { status: "active" } },
  
  // Group stage
  { $group: {
    _id: "$category",
    total: { $sum: 1 },
    avgPrice: { $avg: "$price" }
  }},
  
  // Sort stage
  { $sort: { total: -1 } },
  
  // Limit stage
  { $limit: 5 }
])
```

## Common Query Patterns

### Date Queries

```jsx
// Documents from today
db.collection.find({
  createdAt: {
    $gte: new Date(new Date().setHours(0,0,0,0))
  }
})

// Documents from last 7 days
db.collection.find({
  createdAt: {
    $gte: new Date([Date.now](http://Date.now)() - 7*24*60*60*1000)
  }
})

// Date range
db.collection.find({
  createdAt: {
    $gte: ISODate("2025-01-01"),
    $lt: ISODate("2025-12-31")
  }
})
```

### NULL and Missing Values

```jsx
// Field is null
db.collection.find({ field: null })

// Field is null OR doesn't exist
db.collection.find({ field: { $in: [null] } })

// Field exists but is null
db.collection.find({ field: { $type: "null" } })

// Field doesn't exist
db.collection.find({ field: { $exists: false } })
```

---

<aside>
📚

**Additional Resources**

- [MongoDB Official Documentation](https://docs.mongodb.com/manual/tutorial/query-documents/)
• [Query and Projection Operators](https://docs.mongodb.com/manual/reference/operator/query/)
• [Aggregation Pipeline](https://docs.mongodb.com/manual/core/aggregation-pipeline/)
</aside>