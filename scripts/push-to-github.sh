#!/bin/bash

# GitHub Push Script for HomeTruth
# This script adds, commits, and pushes all changes to GitHub

# Text colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Display banner
echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  HOMETRUTH GITHUB PUSH SCRIPT      ${NC}"
echo -e "${BLUE}=====================================${NC}"

# Function to check command success
check_success() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ $1${NC}"
  else
    echo -e "${RED}✗ $1${NC}"
    echo -e "${RED}Script aborted.${NC}"
    exit 1
  fi
}

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}Current branch: ${CURRENT_BRANCH}${NC}"

# Show status before changes
echo -e "\n${BLUE}Current git status:${NC}"
git status

# Generate contextual commit message based on changes
generate_commit_message() {
  # Stage all files to ensure we detect all changes
  git add -A > /dev/null 2>&1
  
  # Get list of all changed files
  CHANGED_FILES=$(git diff --cached --name-only)
  
  # Get a summary of changes (files added, modified, deleted)
  FILES_ADDED=$(git diff --cached --name-only --diff-filter=A | wc -l | tr -d '[:space:]')
  FILES_MODIFIED=$(git diff --cached --name-only --diff-filter=M | wc -l | tr -d '[:space:]')
  FILES_DELETED=$(git diff --cached --name-only --diff-filter=D | wc -l | tr -d '[:space:]')
  
  # Get directories that were modified
  CHANGED_DIRS=$(for file in $CHANGED_FILES; do dirname "$file" | sort; done | uniq)
  
  # Initialize message
  MESSAGE=""
  
  # Check if this is an initial commit
  if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
    # List top-level directories for initial commit
    TOP_DIRS=$(echo "$CHANGED_DIRS" | grep -v "/" | sort | uniq | tr '\n' ', ' | sed 's/,$//')
    if [ -n "$TOP_DIRS" ]; then
      MESSAGE="Initial project structure: $TOP_DIRS"
    else
      MESSAGE="Initial commit of $(echo "$CHANGED_FILES" | head -n3 | tr '\n' ', ' | sed 's/,$//')"
    fi
  else
    # Identify specific components that changed
    COMPONENTS=""
    
    # Check for specific directories/files
    if echo "$CHANGED_FILES" | grep -q "api.js"; then
      COMPONENTS="${COMPONENTS}API, "
    fi
    
    if echo "$CHANGED_FILES" | grep -q "error\|Sentry"; then
      COMPONENTS="${COMPONENTS}error monitoring, "
    fi
    
    if echo "$CHANGED_FILES" | grep -q "mcpService\|McpService"; then
      COMPONENTS="${COMPONENTS}MCP service, "
    fi
    
    if echo "$CHANGED_FILES" | grep -q "config"; then
      COMPONENTS="${COMPONENTS}config, "
    fi
    
    if echo "$CHANGED_FILES" | grep -q ".md\|docs/"; then
      COMPONENTS="${COMPONENTS}documentation, "
    fi
    
    # Check for specific file extensions
    if echo "$CHANGED_FILES" | grep -q ".js$"; then
      COMPONENTS="${COMPONENTS}JavaScript files, "
    fi
    
    if echo "$CHANGED_FILES" | grep -q ".css$\|.scss$"; then
      COMPONENTS="${COMPONENTS}styles, "
    fi
    
    if echo "$CHANGED_FILES" | grep -q ".html$"; then
      COMPONENTS="${COMPONENTS}HTML, "
    fi
    
    # Remove trailing comma and space
    COMPONENTS=$(echo "$COMPONENTS" | sed 's/, $//')
    
    # Build the commit message
    if [ -n "$COMPONENTS" ]; then
      ACTION="Update"
      if [ "$FILES_ADDED" -gt 0 ] && [ "$FILES_MODIFIED" -eq 0 ]; then
        ACTION="Add"
      elif [ "$FILES_DELETED" -gt 0 ] && [ "$FILES_ADDED" -eq 0 ] && [ "$FILES_MODIFIED" -eq 0 ]; then
        ACTION="Remove"
      fi
      
      MESSAGE="${ACTION}: ${COMPONENTS}"
    else
      # If no specific components detected, list some of the changed files
      SAMPLE_FILES=$(echo "$CHANGED_FILES" | head -n3 | tr '\n' ', ' | sed 's/,$//')
      MESSAGE="Update files: $SAMPLE_FILES"
    fi
  fi
  
  echo "$MESSAGE"
}

# Auto-generate commit message without prompting
COMMIT_MSG=$(generate_commit_message)
echo -e "${YELLOW}Using generated commit message: ${COMMIT_MSG}${NC}"

# Git operations
echo -e "\n${BLUE}Adding all changes...${NC}"
git add .
check_success "Added all changes"

echo -e "\n${BLUE}Committing changes...${NC}"
git commit -m "$COMMIT_MSG"
check_success "Committed changes"

echo -e "\n${BLUE}Pushing to GitHub...${NC}"
git push origin $CURRENT_BRANCH
check_success "Pushed to GitHub"

# Show final status
echo -e "\n${BLUE}Final git status:${NC}"
git status

echo -e "\n${GREEN}=== Push completed successfully ===${NC}"
echo -e "${YELLOW}Branch: ${CURRENT_BRANCH}${NC}"
echo -e "${YELLOW}Commit: ${COMMIT_MSG}${NC}" 