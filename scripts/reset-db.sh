#!/bin/bash

# Database Reset Script
# This script creates a backup of the current database and resets it to a clean state

set -e  # Exit on any error

echo "🗄️  Database Reset Script"
echo "========================="

# Check if database exists
if [ ! -f "prisma/dev.db" ]; then
    echo "❌ Database file 'prisma/dev.db' not found!"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p backups

# Generate timestamp for backup filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backups/dev_backup_${TIMESTAMP}.db"

echo "📦 Creating backup..."
cp prisma/dev.db "$BACKUP_FILE"
echo "✅ Backup created: $BACKUP_FILE"

echo "🗑️  Resetting database..."

# Delete all data from all tables
sqlite3 prisma/dev.db <<EOF
DELETE FROM Task;
DELETE FROM RecurringTask;
DELETE FROM Subcategory;
DELETE FROM Category;
VACUUM;
EOF

echo "✅ Database reset complete!"

# Show database status
echo ""
echo "📊 Database Status:"
echo "=================="
TASK_COUNT=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM Task;" 2>/dev/null || echo "0")
CATEGORY_COUNT=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM Category;" 2>/dev/null || echo "0")
RECURRING_COUNT=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM RecurringTask;" 2>/dev/null || echo "0")
SUBCATEGORY_COUNT=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM Subcategory;" 2>/dev/null || echo "0")

echo "Tasks: $TASK_COUNT"
echo "Categories: $CATEGORY_COUNT"
echo "Recurring Tasks: $RECURRING_COUNT"
echo "Subcategories: $SUBCATEGORY_COUNT"

echo ""
echo "🎉 Database reset completed successfully!"
echo "💾 Backup saved as: $BACKUP_FILE"
