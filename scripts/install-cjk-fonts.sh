#!/bin/bash

# Install CJK fonts for development environment
# This script supports Ubuntu/Debian, macOS, and provides instructions for Windows

set -e

echo "🔤 Installing CJK fonts for password generator development..."

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Ubuntu/Debian
    echo "📦 Detected Linux (Ubuntu/Debian)"
    echo "Installing Noto CJK fonts..."
    
    sudo apt-get update
    sudo apt-get install -y \
      fonts-noto-cjk \
      fonts-noto-cjk-extra \
      fonts-wqy-zenhei \
      fonts-wqy-microhei \
      fonts-arphic-ukai \
      fonts-arphic-uming \
      fonts-arphic-bkai00mp \
      fonts-arphic-bsmi00lp \
      fontconfig
    
    # Refresh font cache
    sudo fc-cache -fv
    
    # Set locale environment variables
    echo "🌐 Setting locale environment variables..."
    echo "export LANG=zh_TW.UTF-8" >> ~/.bashrc
    echo "export LC_ALL=zh_TW.UTF-8" >> ~/.bashrc
    
    echo "✅ CJK fonts installed successfully on Linux!"
    echo "Please restart your terminal or run: source ~/.bashrc"

elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "📦 Detected macOS"
    
    if command -v brew &> /dev/null; then
        echo "Installing Noto CJK fonts via Homebrew..."
        brew tap homebrew/cask-fonts
        brew install --cask font-noto-sans-cjk
        brew install --cask font-noto-serif-cjk
        brew install --cask font-source-han-sans
        brew install --cask font-source-han-serif
    else
        echo "⚠️  Homebrew not found. Please install fonts manually:"
        echo "1. Download fonts from https://fonts.google.com/noto"
        echo "2. Install via Font Book application"
    fi
    
    echo "✅ CJK fonts installed successfully on macOS!"

elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    # Windows
    echo "📦 Detected Windows"
    echo "⚠️  Please install CJK fonts manually on Windows:"
    echo "1. Open Settings → Fonts"
    echo "2. Download and install Noto Sans CJK fonts from:"
    echo "   https://fonts.google.com/noto/specimen/Noto+Sans"
    echo "3. Or download from GitHub:"
    echo "   https://github.com/notofonts/noto-cjk"

else
    echo "❌ Unsupported OS: $OSTYPE"
    echo "Please install CJK fonts manually for your system"
    exit 1
fi

echo ""
echo "🎯 Font installation complete!"
echo "The following fonts should now be available:"
echo "  - Noto Sans CJK (Simplified & Traditional Chinese)"
echo "  - Noto Sans CJK Extra (all weights)"
echo "  - AR PL UKai TW (Traditional Chinese Kaiti)"
echo "  - AR PL UMing TW (Traditional Chinese Ming)"
echo "  - AR PL KaitiM Big5 (Traditional Chinese Kaiti)"
echo "  - WenQuanYi Zen Hei (Chinese sans-serif)"
echo "  - WenQuanYi Micro Hei (Chinese micro sans-serif)"
echo ""
echo "🧪 Test the installation by running the development server:"
echo "  npm run dev"
echo ""
echo "📚 For more information, see the README.md file."