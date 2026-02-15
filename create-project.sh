#!/usr/bin/env bash

# Hono Cloudflare Starter - Project Scaffolding Script
# Usage: ./create-project.sh <project-name>

set -e

PROJECT_NAME="${1:-my-project}"
TEMPLATE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$(pwd)/${PROJECT_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║       Hono Cloudflare Starter - Project Generator        ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

check_dependencies() {
    print_info "Checking dependencies..."
    
    if ! command -v bun &> /dev/null; then
        print_error "Bun is not installed. Please install it first:"
        echo "  curl -fsSL https://bun.sh/install | bash"
        exit 1
    fi
    print_success "Bun is installed"
    
    if ! command -v wrangler &> /dev/null; then
        print_warning "Wrangler is not installed. Installing..."
        bun install -g wrangler
    fi
    print_success "Wrangler is installed"
}

create_project() {
    print_info "Creating project: ${PROJECT_NAME}"
    
    if [ -d "$TARGET_DIR" ]; then
        print_error "Directory ${PROJECT_NAME} already exists!"
        exit 1
    fi
    
    mkdir -p "$TARGET_DIR"
    
    # Copy template files
    cp -r "$TEMPLATE_DIR/src" "$TARGET_DIR/"
    cp -r "$TEMPLATE_DIR/public" "$TARGET_DIR/"
    cp "$TEMPLATE_DIR/package.json" "$TARGET_DIR/"
    cp "$TEMPLATE_DIR/tsconfig.json" "$TARGET_DIR/"
    cp "$TEMPLATE_DIR/drizzle.config.ts" "$TARGET_DIR/"
    cp "$TEMPLATE_DIR/wrangler.jsonc" "$TARGET_DIR/"
    cp "$TEMPLATE_DIR/.env.example" "$TARGET_DIR/"
    cp "$TEMPLATE_DIR/.gitignore" "$TARGET_DIR/"
    
    # Update package.json with new project name
    sed -i '' "s/\"name\": \"hono-cloudflare-starter\"/\"name\": \"${PROJECT_NAME}\"/" "$TARGET_DIR/package.json"
    
    # Update wrangler.jsonc with new project name
    sed -i '' "s/\"name\": \"hono-cloudflare-starter\"/\"name\": \"${PROJECT_NAME}\"/" "$TARGET_DIR/wrangler.jsonc"
    
    print_success "Project files created"
}

setup_git() {
    print_info "Initializing Git repository..."
    cd "$TARGET_DIR"
    git init
    git add .
    git commit -m "Initial commit from Hono Cloudflare Starter"
    print_success "Git repository initialized"
}

install_dependencies() {
    print_info "Installing dependencies..."
    cd "$TARGET_DIR"
    bun install
    print_success "Dependencies installed"
}

generate_types() {
    print_info "Generating Cloudflare types..."
    cd "$TARGET_DIR"
    bun run cf-typegen || true
    print_success "Types generated"
}

print_next_steps() {
    echo ""
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                   Project Created!                       ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo ""
    echo "  1. cd ${PROJECT_NAME}"
    echo "  2. cp .env.example .env"
    echo "  3. Edit .env and add your configuration:"
    echo "     - BETTER_AUTH_SECRET (generate with: openssl rand -base64 32)"
    echo "     - DATABASE_URL (from Neon or other Postgres provider)"
    echo "     - OAuth credentials (optional)"
    echo ""
    echo "  4. bun run auth:generate    # Generate auth schema"
    echo "  5. bun run db:push          # Push schema to database"
    echo "  6. bun run dev              # Start development server"
    echo ""
    echo -e "${BLUE}Documentation:${NC}"
    echo "  - Better Auth: https://better-auth.com"
    echo "  - Hono: https://hono.dev"
    echo "  - Cloudflare Workers: https://workers.cloudflare.com"
    echo ""
    echo -e "${YELLOW}Happy coding! 🚀${NC}"
    echo ""
}

# Main execution
main() {
    print_header
    check_dependencies
    create_project
    setup_git
    install_dependencies
    generate_types
    print_next_steps
}

main "$@"
