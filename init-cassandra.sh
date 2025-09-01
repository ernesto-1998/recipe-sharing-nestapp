#!/bin/bash

echo "Waiting for Cassandra to be ready..."
until cqlsh -e "DESCRIBE KEYSPACES;" > /dev/null 2>&1; do
  echo "Waiting for Cassandra Engine..."
  sleep 5
done

echo "Cassandra ready. Waiting extra 10 seconds to ensure full initialization..."
sleep 10

echo "Creating keyspace and tables if not exist..."
cqlsh <<EOF
CREATE KEYSPACE IF NOT EXISTS recipe_logs
  WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

USE recipe_logs;

CREATE TABLE IF NOT EXISTS api_logs (
  id UUID PRIMARY KEY,
  level TEXT,
  message TEXT,
  context TEXT,
  created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_errors (
  id UUID PRIMARY KEY,
  message TEXT,
  trace TEXT,
  context TEXT,
  created_at TIMESTAMP
);
EOF

echo "Keyspace and tables ensured."
