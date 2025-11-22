# FinNest - Smart Wealth Management

A beautiful, futuristic financial management app built with React Native, Expo, and glassmorphism design principles.

## Features

- 🎨 **Stunning Glassmorphism UI** - Modern, futuristic design with glass effects
- 📊 **Financial Dashboard** - Track your total balance, investments, and transactions
- 💰 **Investment Portfolio** - Manage stocks, crypto, ETFs, and bonds
- 📈 **Analytics & Charts** - Visualize your financial data with interactive charts
- 👤 **Profile Management** - Customize your account settings and preferences
- 🌙 **Dark Mode** - Eye-friendly dark theme
- ⚡ **Smooth Animations** - Powered by React Native Reanimated
- ✅ **ISA Delete Functionality** - Safely remove ISA accounts with confirmation

## Color Scheme

- **Deep Navy Blue**: `#0A2540`
- **Gold**: `#FFD700`
- Additional accent colors for data visualization

## Tech Stack

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **Expo Router** - File-based routing
- **React Native Reanimated** - Animations
- **Expo Linear Gradient** - Gradient effects
- **Expo Blur** - Glassmorphism effects
- **React Native Chart Kit** - Data visualization

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Worldhealthai/FinNest-Real.git
cd FinNest-Real
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your device:
- Scan the QR code with Expo Go app (iOS/Android)
- Press `w` for web
- Press `a` for Android emulator
- Press `i` for iOS simulator

## Project Structure

```
FinNest-Real/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Tab navigation
│   │   ├── index.tsx        # Home screen
│   │   ├── analytics.tsx    # Analytics screen
│   │   ├── hub.tsx          # ISA Hub screen
│   │   └── profile.tsx      # Profile screen
│   └── _layout.tsx          # Root layout
├── components/
│   ├── ISAAccountsModal.tsx # ISA management with delete
│   ├── AddISAContributionModal.tsx
│   ├── AnimatedBackground.tsx
│   ├── GlassButton.tsx
│   ├── GlassCard.tsx
│   └── SplashScreen.tsx
├── constants/
│   ├── theme.ts             # Theme configuration
│   ├── isaData.ts           # ISA types and calculations
│   └── isaProviders.ts      # ISA provider database
├── app.json                 # Expo configuration
├── package.json             # Dependencies
└── tsconfig.json           # TypeScript config
```

## Deployment

### Vercel (Web Deployment)

The app is fully configured for Vercel deployment. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick Deploy Options:**

1. **Via Vercel Dashboard** (Recommended)
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import `Worldhealthai/FinNest-Real` repository
   - Deploy with one click!

2. **Via CLI**
   ```bash
   npm install -g vercel
   npm run deploy
   ```

3. **GitHub Integration**
   - Connect your repo to Vercel for automatic deployments
   - Every push automatically deploys

**Available Scripts:**
```bash
npm run build          # Build for production
npm run deploy         # Deploy to production
npm run deploy:preview # Deploy preview version
```

### Expo Build (Native Apps)

For iOS and Android native builds:

```bash
npx expo build:android
npx expo build:ios
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please contact us at support@finnest.app
