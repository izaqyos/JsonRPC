#!/bin/bash

# Base URL for the JSON-RPC server
SERVER="http://localhost:5001/jsonrpc"

# Clear all existing data first
echo "Clearing all existing data..."
http POST $SERVER \
  jsonrpc=2.0 \
  id=0 \
  method=delete_all_items \
  params:='{}'
echo -e "\n"

# Create Items
echo "Creating Apple..."
http POST $SERVER \
  jsonrpc=2.0 \
  id=1 \
  method=create_item \
  params:='{"name": "Apple", "description": "A crisp red fruit"}'
echo -e "\n"

echo "Creating Banana..."
http POST $SERVER \
  jsonrpc=2.0 \
  id=2 \
  method=create_item \
  params:='{"name": "Banana", "description": "A yellow curved fruit"}'
echo -e "\n"

# Read Operations
echo "Listing all items..."
http POST $SERVER \
  jsonrpc=2.0 \
  id=3 \
  method=list_items \
  params:='{}'
echo -e "\n"

echo "Reading Apple (id: 1)..."
http POST $SERVER \
  jsonrpc=2.0 \
  id=4 \
  method=read_item \
  params:='{"item_id": "1"}'
echo -e "\n"

# Update Operation
echo "Updating Apple description..."
http POST $SERVER \
  jsonrpc=2.0 \
  id=5 \
  method=update_item \
  params:='{"item_id": "1", "description": "A delicious Honeycrisp apple"}'
echo -e "\n"

# Verify Update
echo "Reading updated Apple..."
http POST $SERVER \
  jsonrpc=2.0 \
  id=6 \
  method=read_item \
  params:='{"item_id": "1"}'
echo -e "\n"

# Delete Operation
echo "Deleting Banana (id: 2)..."
http POST $SERVER \
  jsonrpc=2.0 \
  id=7 \
  method=delete_item \
  params:='{"item_id": "2"}'
echo -e "\n"

# Verify Delete
echo "Listing remaining items..."
http POST $SERVER \
  jsonrpc=2.0 \
  id=8 \
  method=list_items \
  params:='{}'
echo -e "\n"

# Try to read deleted item
echo "Trying to read deleted Banana..."
http POST $SERVER \
  jsonrpc=2.0 \
  id=9 \
  method=read_item \
  params:='{"item_id": "2"}'
echo -e "\n" 