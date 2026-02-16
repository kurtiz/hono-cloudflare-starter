#!/usr/bin/env bash

# Hono Cloudflare Starter - Project Scaffolding Script
# Usage: ./create-project.sh <project-name> [--pm <package-manager>]
# 
# Supports: bun, pnpm, yarn, npm (auto-detected if not specified)

set -e

PROJECT_NAME="${1:-}"
PACKAGE_MANAGER="${2:-}"
TEMPLATE_REPO="https://github.com/kurtiz/hono-cloudflare-starter.git"
TARGET_DIR=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

print_cmd() {
    echo -e "${CYAN}$${NC} $1"
}

detect_package_manager() {
    print_info "Detecting package manager..."
    
    # Priority: bun > pnpm > yarn > npm
    if command -v bun &> /dev/null; then
        echo "bun"
    elif command -v pnpm &> /dev/null; then
        echo "pnpm"
    elif command -v yarn &> /dev/null; then
        echo "yarn"
    elif command -v npm &> /dev/null; then
        echo "npm"
    else
        echo ""
    fi
}

get_install_command() {
    local pm="$1"
    case "$pm" in
        "bun")
            echo "bun install"
            ;;
        "pnpm")
            echo "pnpm install"
            ;;
        "yarn")
            echo "yarn install"
            ;;
        "npm")
            echo "npm install"
            ;;
        *)
            echo "npm install"
            ;;
    esac
}

get_run_command() {
    local pm="$1"
    local script="$2"
    case "$pm" in
        "bun")
            echo "bun run $script"
            ;;
        "pnpm")
            echo "pnpm run $script"
            ;;
        "yarn")
            echo "yarn $script"
            ;;
        "npm")
            echo "npm run $script"
            ;;
        *)
            echo "npm run $script"
            ;;
    esac
}

get_global_install_command() {
    local pm="$1"
    local pkg="$2"
    case "$pm" in
        "bun")
            echo "bun install -g $pkg"
            ;;
        "pnpm")
            echo "pnpm add -g $pkg"
            ;;
        "yarn")
            echo "yarn global add $pkg"
            ;;
        "npm")
            echo "npm install -g $pkg"
            ;;
        *)
            echo "npm install -g $pkg"
            ;;
    esac
}

check_dependencies() {
    print_info "Checking dependencies..."
    
    # Check git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    print_success "Git is installed"
    
    # Detect or validate package manager
    if [ -z "$PACKAGE_MANAGER" ]; then
        PACKAGE_MANAGER=$(detect_package_manager)
        if [ -z "$PACKAGE_MANAGER" ]; then
            print_error "No package manager found. Please install one of: bun, pnpm, yarn, or npm"
            echo ""
            echo "Installation options:"
            echo "  Bun:    curl -fsSL https://bun.sh/install | bash"
            echo "  pnpm:   npm install -g pnpm"
            echo "  Yarn:   npm install -g yarn"
            echo "  npm:    (comes with Node.js) https://nodejs.org"
            exit 1
        fi
        print_success "Detected package manager: ${PACKAGE_MANAGER}"
    else
        # Validate specified package manager
        if ! command -v "$PACKAGE_MANAGER" &> /dev/null; then
            print_error "Specified package manager '${PACKAGE_MANAGER}' is not installed."
            exit 1
        fi
        print_success "Using package manager: ${PACKAGE_MANAGER}"
    fi
    
    # Check wrangler
    if ! command -v wrangler &> /dev/null; then
        print_warning "Wrangler is not installed. Installing..."
        eval "$(get_global_install_command "$PACKAGE_MANAGER" wrangler)"
    fi
    print_success "Wrangler is installed"
}

show_usage() {
    echo "Usage: $0 <project-name> [--pm <package-manager>]"
    echo ""
    echo "Arguments:"
    echo "  project-name          Name of the new project directory"
    echo ""
    echo "Options:"
    echo "  --pm <pm>            Package manager to use (bun, pnpm, yarn, npm)"
    echo "                       Auto-detected if not specified"
    echo ""
    echo "Examples:"
    echo "  $0 my-api"
    echo "  $0 my-api --pm pnpm"
    echo "  $0 my-api --pm npm"
    echo ""
}

parse_args() {
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --pm)
                PACKAGE_MANAGER="$2"
                shift 2
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            -*)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
            *)
                if [ -z "$PROJECT_NAME" ]; then
                    PROJECT_NAME="$1"
                fi
                shift
                ;;
        esac
    done
    
    # Validate project name
    if [ -z "$PROJECT_NAME" ]; then
        print_error "Project name is required"
        show_usage
        exit 1
    fi
    
    # Validate project name format
    if [[ ! "$PROJECT_NAME" =~ ^[a-z0-9-]+$ ]]; then
        print_error "Project name must contain only lowercase letters, numbers, and hyphens"
        exit 1
    fi
    
    TARGET_DIR="$(pwd)/${PROJECT_NAME}"
}

create_project() {
    print_info "Creating project: ${PROJECT_NAME}"
    
    if [ -d "$TARGET_DIR" ]; then
        print_error "Directory ${PROJECT_NAME} already exists!"
        exit 1
    fi
    
    # Clone from GitHub
    print_info "Cloning template from GitHub..."
    git clone "$TEMPLATE_REPO" "$TARGET_DIR" --depth 1
    
    # Remove .git directory to start fresh
    rm -rf "$TARGET_DIR/.git"
    
    # Remove template-specific files
    rm -f "$TARGET_DIR/create-project.sh"
    rm -f "$TARGET_DIR/hono-cf"
    
    # Update package.json with new project name
    if [ -f "$TARGET_DIR/package.json" ]; then
        sed -i.bak "s/\"name\": \"hono-cloudflare-starter\"/\"name\": \"${PROJECT_NAME}\"/" "$TARGET_DIR/package.json"
        rm -f "$TARGET_DIR/package.json.bak"
    fi
    
    # Update wrangler.jsonc with new project name
    if [ -f "$TARGET_DIR/wrangler.jsonc" ]; then
        sed -i.bak "s/\"name\": \"hono-cloudflare-starter\"/\"name\": \"${PROJECT_NAME}\"/" "$TARGET_DIR/wrangler.jsonc"
        rm -f "$TARGET_DIR/wrangler.jsonc.bak"
    fi
    
    # Remove the .env file if it exists (keep .env.example)
    rm -f "$TARGET_DIR/.env"
    
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
    print_info "Installing dependencies using ${PACKAGE_MANAGER}..."
    cd "$TARGET_DIR"
    eval "$(get_install_command "$PACKAGE_MANAGER")"
    print_success "Dependencies installed"
}

generate_types() {
    print_info "Generating Cloudflare types..."
    cd "$TARGET_DIR"
    eval "$(get_run_command "$PACKAGE_MANAGER" "cf-typegen")" || true
    print_success "Types generated"
}

print_next_steps() {
    local run_cmd
    run_cmd=$(get_run_command "$PACKAGE_MANAGER" "dev")
    
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
    echo -e "  4. ${CYAN}${run_cmd}              # Generate auth schema${NC}"
    echo -e "  5. ${CYAN}${run_cmd}              # Push schema to database${NC}"
    echo -e "  6. ${CYAN}${run_cmd}                    # Start dev server${NC}"
    echo ""
    echo -e "${BLUE}Available commands:${NC}"
    echo "  $(get_run_command "$PACKAGE_MANAGER" "dev")              # Start dev server"
    echo "  $(get_run_command "$PACKAGE_MANAGER" "deploy")           # Deploy to Cloudflare"
    echo "  $(get_run_command "$PACKAGE_MANAGER" "db:studio")        # Open Drizzle Studio"
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
    parse_args "$@"
    print_header
    check_dependencies
    create_project
    setup_git
    install_dependencies
    generate_types
    print_next_steps
}

main "$@"
