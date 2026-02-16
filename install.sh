#!/usr/bin/env bash

# Hono Cloudflare CLI Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/kurtiz/hono-cloudflare-starter/main/install.sh | bash

set -e

# Configuration
SCRIPT_URL="https://raw.githubusercontent.com/kurtiz/hono-cloudflare-starter/main/hono-cf"
INSTALL_NAME="hono-cf"

# Auto-detect if we're being piped (non-interactive)
AUTO_CONFIRM=false
if [ ! -t 0 ] || [ "$1" = "--yes" ] || [ "$1" = "-y" ]; then
    AUTO_CONFIRM=true
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║         Hono Cloudflare CLI - Installation Script        ║"
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

detect_shell() {
    local shell_name
    shell_name=$(basename "$SHELL")
    echo "$shell_name"
}

get_shell_config() {
    local shell_name="$1"
    
    case "$shell_name" in
        "bash")
            echo "$HOME/.bashrc"
            ;;
        "zsh")
            echo "$HOME/.zshrc"
            ;;
        "fish")
            echo "$HOME/.config/fish/config.fish"
            ;;
        *)
            echo ""
            ;;
    esac
}

detect_install_dir() {
    # Priority: /usr/local/bin > ~/.local/bin > ~/bin
    
    # Check if we can write to /usr/local/bin
    if [ -w "/usr/local/bin" ] || [ "$EUID" -eq 0 ]; then
        echo "/usr/local/bin"
        return 0
    fi
    
    # Check if /usr/local/bin exists and try with sudo
    if [ -d "/usr/local/bin" ]; then
        echo "/usr/local/bin"
        return 1  # Need sudo
    fi
    
    # Check if ~/.local/bin exists and is writable
    if [ -d "$HOME/.local/bin" ] && [ -w "$HOME/.local/bin" ]; then
        echo "$HOME/.local/bin"
        return 0
    fi
    
    # Check if ~/.local/bin exists (need to create)
    if [ -d "$HOME/.local" ]; then
        echo "$HOME/.local/bin"
        return 2  # Need to create
    fi
    
    # Fallback to ~/bin
    if [ -d "$HOME/bin" ]; then
        echo "$HOME/bin"
        return 0
    fi
    
    # Final fallback: create ~/.local/bin
    echo "$HOME/.local/bin"
    return 2  # Need to create
}

path_contains() {
    local dir="$1"
    case ":$PATH:" in
        *":$dir:"*)
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

add_to_path() {
    local dir="$1"
    local shell_name="$2"
    local shell_config
    
    shell_config=$(get_shell_config "$shell_name")
    
    if [ -z "$shell_config" ]; then
        print_warning "Unknown shell: $shell_name"
        print_info "Please manually add $dir to your PATH"
        return 1
    fi
    
    # Create shell config if it doesn't exist
    if [ ! -f "$shell_config" ]; then
        print_info "Creating $shell_config"
        mkdir -p "$(dirname "$shell_config")"
        touch "$shell_config"
    fi
    
    # Check if already in PATH
    if grep -q "export PATH.*$dir" "$shell_config" 2>/dev/null; then
        print_info "PATH already configured in $shell_config"
        return 0
    fi
    
    # Add to PATH
    echo "" >> "$shell_config"
    echo "# Added by Hono Cloudflare CLI installer" >> "$shell_config"
    echo "export PATH=\"$dir:\$PATH\"" >> "$shell_config"
    
    print_success "Added $dir to PATH in $shell_config"
    print_info "Run 'source $shell_config' or restart your terminal to apply changes"
    
    return 0
}

check_curl() {
    if ! command -v curl &> /dev/null; then
        print_error "curl is required but not installed"
        print_info "Please install curl and try again"
        exit 1
    fi
}

download_and_install() {
    local install_dir="$1"
    local needs_sudo="$2"
    local needs_mkdir="$3"
    local target_path="${install_dir}/${INSTALL_NAME}"
    local temp_file
    temp_file="/tmp/hono-cf-install-$$"
    
    print_info "Downloading hono-cf..."
    
    # Download
    if ! curl -fsSL --max-time 30 "$SCRIPT_URL" -o "$temp_file"; then
        print_error "Failed to download hono-cf"
        print_info "Please check your internet connection and try again"
        exit 1
    fi
    
    # Verify download
    if [ ! -s "$temp_file" ]; then
        print_error "Downloaded file is empty"
        exit 1
    fi
    
    if ! head -1 "$temp_file" | grep -q "#!/usr/bin/env bash"; then
        print_error "Downloaded file doesn't appear to be a valid script"
        rm -f "$temp_file"
        exit 1
    fi
    
    print_success "Download successful"
    
    # Create directory if needed
    if [ "$needs_mkdir" = true ]; then
        print_info "Creating directory: $install_dir"
        mkdir -p "$install_dir"
    fi
    
    # Install
    print_info "Installing to $target_path..."
    
    if [ "$needs_sudo" = true ]; then
        if ! sudo mv "$temp_file" "$target_path"; then
            print_error "Failed to install (sudo required)"
            print_info "You can try installing manually:"
            echo "  sudo mv $temp_file $target_path"
            echo "  sudo chmod +x $target_path"
            exit 1
        fi
        sudo chmod +x "$target_path"
    else
        if ! mv "$temp_file" "$target_path"; then
            print_error "Failed to install"
            rm -f "$temp_file"
            exit 1
        fi
        chmod +x "$target_path"
    fi
    
    print_success "Installed successfully"
    
    # Return target path
    echo "$target_path"
}

verify_installation() {
    local install_path="$1"
    
    print_info "Verifying installation..."
    
    if [ ! -f "$install_path" ]; then
        print_error "Installation file not found at $install_path"
        return 1
    fi
    
    if [ ! -x "$install_path" ]; then
        print_error "Installation file is not executable"
        return 1
    fi
    
    # Test running it
    local version
    version=$("$install_path" --version 2>/dev/null) || true
    
    if [ -n "$version" ]; then
        print_success "Verification successful: $version"
        return 0
    else
        print_warning "Could not verify version, but installation appears successful"
        return 0
    fi
}

main() {
    print_header
    
    # Check for curl
    check_curl
    
    # Detect shell
    local shell_name
    shell_name=$(detect_shell)
    print_info "Detected shell: $shell_name"
    
    # Determine install directory
    local install_dir
    local needs_sudo=false
    local needs_mkdir=false
    local install_status
    
    install_dir=$(detect_install_dir)
    install_status=$?
    
    case $install_status in
        1)
            needs_sudo=true
            print_info "Installation directory: $install_dir (requires sudo)"
            ;;
        2)
            needs_mkdir=true
            print_info "Installation directory: $install_dir (will be created)"
            ;;
        *)
            print_info "Installation directory: $install_dir"
            ;;
    esac
    
    # Confirm installation
    echo ""
    if [ "$AUTO_CONFIRM" = true ]; then
        print_info "Auto-confirming installation (piped mode or --yes flag)"
        REPLY="y"
    else
        read -p "Install hono-cf to $install_dir? (Y/n): " -n 1 -r
        echo ""
    fi
    
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_info "Installation cancelled"
        exit 0
    fi
    
    # Download and install
    local install_path
    install_path=$(download_and_install "$install_dir" "$needs_sudo" "$needs_mkdir")
    
    # Verify
    verify_installation "$install_path"
    
    # Check PATH
    if ! path_contains "$install_dir"; then
        echo ""
        print_warning "$install_dir is not in your PATH"
        
        if [ "$AUTO_CONFIRM" = true ]; then
            print_info "Auto-adding to PATH (piped mode)"
            add_to_path "$install_dir" "$shell_name"
        else
            print_info "Would you like to add it to your shell configuration?"
            read -p "Add to PATH? (Y/n): " -n 1 -r
            echo ""
            
            if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                add_to_path "$install_dir" "$shell_name"
            else
                print_info "You can manually add this to your PATH:"
                echo "  export PATH=\"$install_dir:\$PATH\""
            fi
        fi
    fi
    
    # Print success message
    echo ""
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║             Installation Complete! 🎉                    ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${CYAN}hono-cf${NC} has been installed to: ${BLUE}$install_path${NC}"
    echo ""
    echo -e "${BLUE}Quick start:${NC}"
    echo ""
    echo "  # Create a new project"
    echo "  hono-cf create my-api"
    echo ""
    echo "  # Generate code"
    echo "  hono-cf generate route posts"
    echo "  hono-cf g schema projects"
    echo ""
    echo -e "${BLUE}Help:${NC}"
    echo "  hono-cf --help"
    echo ""
    
    # Remind to restart terminal if PATH was updated
    if ! path_contains "$install_dir"; then
        echo -e "${YELLOW}Note:${NC} You may need to restart your terminal or run 'source $(get_shell_config "$shell_name")' to use hono-cf"
        echo ""
    fi
    
    # Extra note for auto-confirm mode
    if [ "$AUTO_CONFIRM" = true ]; then
        echo -e "${CYAN}Tip:${NC} To use hono-cf right away, run:"
        echo "  source $(get_shell_config "$shell_name")"
        echo ""
    fi
}

main "$@"
