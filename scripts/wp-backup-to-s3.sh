#!/bin/bash

# This script will backup all WordPress installations in a given directory to S3.
# It will create a timestamped directory for each backup and upload it to S3.
# It will also create a timestamped directory for each backup in /tmp and then
# zip the WordPress files and database backup into a single file before uploading
# it to S3. This is useful for large WordPress installations where the database
# backup file is too large to upload to S3.
# 
# Usage: wp-backup-to-s3.sh [options]
# Example: wp-backup-to-s3.sh -p your_aws_profile -r your_aws_region -b your_s3_bucket -w /path/to/wordpress/installations

# Set default values
AWS_PROFILE="your_aws_profile"
AWS_REGION="your_aws_region"
S3_BUCKET="your_s3_bucket"
WORDPRESS_PATH="/path/to/wordpress/installations"

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -p|--profile)
            AWS_PROFILE="$2"
            shift
            shift
            ;;
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
        *)
            echo "Unknown option: $1"
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

# Loop through each WordPress installation
for WP_DIR in $WORDPRESS_PATH/*; do
    if [[ -d "$WP_DIR" ]]; then
        # Get the WordPress installation name
        WP_NAME=$(basename "$WP_DIR")

        # Create a timestamp for the backup
        TIMESTAMP=$(date +"%Y%m%d%H%M%S")

        # Create a directory for the backup
        BACKUP_DIR="/tmp/$WP_NAME-$TIMESTAMP"
        mkdir -p "$BACKUP_DIR"

        # Dump the WordPress database
        echo "Dumping the WordPress database for $WP_NAME..."
        wp --path="$WP_DIR" db export "$BACKUP_DIR/database.sql"

        # Zip the database backup and WordPress files
        echo "Zipping the database backup and WordPress files for $WP_NAME..."
        tar -czvf "$BACKUP_DIR/$WP_NAME-$TIMESTAMP.tar.gz" -C "$WP_DIR" .

        # Upload the backup to S3
        echo "Uploading the backup to S3 for $WP_NAME..."
        aws s3 cp "$BACKUP_DIR/$WP_NAME-$TIMESTAMP.tar.gz" "s3://$S3_BUCKET/"

        # Clean up the temporary backup directory
        echo "Cleaning up the temporary backup directory for $WP_NAME..."
        rm -rf "$BACKUP_DIR"

        echo "Backup completed for $WP_NAME."
    fi
done