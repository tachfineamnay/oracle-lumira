// MongoDB initialization script
db = db.getSiblingDB('oracle-lumira');

// Create collections
db.createCollection('users');
db.createCollection('orders');
db.createCollection('files');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.orders.createIndex({ "userId": 1 });
db.orders.createIndex({ "status": 1 });
db.orders.createIndex({ "createdAt": -1 });

// Insert sample data for testing
db.users.insertOne({
  _id: ObjectId(),
  email: "sarah@example.com",
  firstName: "Sarah",
  dateNaissance: "1990-05-15",
  createdAt: new Date(),
  updatedAt: new Date()
});

console.log('Oracle Lumira database initialized successfully!');
