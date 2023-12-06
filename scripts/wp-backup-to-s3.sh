#!/bin/bash

# This script will backup the main WordPress folder to S3.
# It will create a timestamped directory for each backup and upload it to S3.
# It will also create a timestamped directory in /tmp and then
# zip the WordPress files before uploading it to S3.
# 
# Usage: wp-backup-to-s3.sh [options]
# Example: wp-backup-to-s3.sh -r us-east-1 -b my-bucket -w /var/www/html -n my-wordpress

# Set default values
AWS_REGION="your_aws_region"
S3_BUCKET="your_s3_bucket"
WORDPRESS_PATH="/path/to/wordpress"
WP_NAME=""

# ANSI escape sequences for color formatting
RED='\033[0;31m'
NC='\033[0m' # No Color

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -r|--region)
            AWS_REGION="$2"
            shift
            shift
            ;;
        -b|--bucket)
            S3_BUCKET="$2"
            shift
            shift
            ;;
        -w|--wordpress)
            WORDPRESS_PATH="$2"
            shift
            shift
            ;;
        -n|--name)
            WP_NAME="$2"
            shift
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Set the script version
SCRIPT_VERSION="1.0.0"

# Check if the version parameter is present
if [[ $1 == "-v" || $1 == "--version" ]]; then
    echo "Script version: $SCRIPT_VERSION"
    exit 0
fi

# Check S3 connectivity and permissions
echo "Checking S3 connectivity and permissions..."
aws s3 ls "s3://$S3_BUCKET" >/dev/null 2>&1 || { echo -e "${RED}Error:${NC} Unable to access S3 bucket. Please check your connectivity and permissions."; exit 1; }
echo "S3 connectivity and permissions check passed."

# If WP_NAME is not provided, use the basename of WORDPRESS_PATH
if [[ -z "$WP_NAME" ]]; then
    WP_NAME=$(basename "$WORDPRESS_PATH")
fi

# Create a timestamp for the backup
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

# Create a directory for the backup
BACKUP_DIR="/tmp/$WP_NAME-$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

# Zip the WordPress files
echo "Zipping the WordPress files for $WP_NAME..."
tar -czf "$BACKUP_DIR/$WP_NAME-$TIMESTAMP.tar.gz" -C "$(dirname "$WORDPRESS_PATH")" "$(basename "$WORDPRESS_PATH")"

# Upload the backup to S3
echo "Uploading the backup to S3 for $WP_NAME..."
aws s3 cp "$BACKUP_DIR/$WP_NAME-$TIMESTAMP.tar.gz" "s3://$S3_BUCKET/" || { echo -e "${RED}Error:${NC} Failed to upload the backup to S3."; exit 1; }

# Clean up the temporary backup directory
echo "Cleaning up the temporary backup directory for $WP_NAME..."
rm -rf "$BACKUP_DIR"

echo "Backup completed for $WP_NAME."