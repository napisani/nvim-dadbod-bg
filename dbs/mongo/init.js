use mydb;

db.createCollection("example");

db.example.insertMany([
  { name: 'Alice', age: 28, email: 'alice@example.com' },
  { name: 'Bob', age: 35, email: 'bob@example.com' },
  { name: 'Charlie', age: 42, email: 'charlie@example.com' },
  { name: 'Diana', age: 31, email: 'diana@example.com' },
  { name: 'Ethan', age: 25, email: 'ethan@example.com' },
  { name: 'Fiona', age: 39, email: 'fiona@example.com' },
  { name: 'George', age: 45, email: 'george@example.com' },
  { name: 'Hannah', age: 33, email: 'hannah@example.com' },
  { name: 'Ian', age: 29, email: 'ian@example.com' },
  { name: 'Julia', age: 37, email: 'julia@example.com' }
]);

db.example.createIndex({ name: 1 });

