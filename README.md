# 🌰 Nutriwala - Premium Dry Fruits & Nuts E-Commerce

<div align="center">

![Nutriwala Logo](public/logo.svg)

**A modern, full-featured e-commerce platform for premium dry fruits, nuts, and healthy snacks**

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://nutriwala.vercel.app)
[![Deployment](https://img.shields.io/badge/deployment-vercel-black)](https://vercel.com)
[![License](https://img.shields.io/badge/license-proprietary-blue)](LICENSE)

[Live Demo](https://nutriwala.vercel.app) • [Report Bug](https://github.com/sohakousar/nutriwala/issues) • [Request Feature](https://github.com/sohakousar/nutriwala/issues)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Admin Panel](#admin-panel)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 About

Nutriwala is a premium e-commerce platform designed specifically for selling high-quality dry fruits, nuts, seeds, and healthy snacks. Built with modern web technologies, it offers a seamless shopping experience with features like real-time inventory management, secure payments, and an intuitive admin dashboard.

### Why Nutriwala?

- 🏆 **Premium Quality** - Curated selection of the finest dry fruits and nuts
- 🚀 **Modern Tech Stack** - Built with React, TypeScript, and Supabase
- 💳 **Secure Payments** - Integrated with Razorpay for safe transactions
- 📱 **Responsive Design** - Optimized for all devices
- 🎨 **Beautiful UI** - Clean, modern interface with smooth animations

---

## ✨ Features

### Customer Features
- 🛒 **Shopping Cart** - Add, remove, and manage items with real-time updates
- 👤 **User Authentication** - Sign up with email or Google OAuth
- 🔍 **Product Search & Filter** - Find products by category, price, and features
- 💳 **Multiple Payment Options** - Razorpay online payments & Cash on Delivery
- 📦 **Order Tracking** - View order history and status in your account
- 📧 **Email Notifications** - Branded confirmation and password reset emails
- 🎨 **Premium UI/UX** - Modern design with glassmorphism and smooth animations

### Admin Features
- 📊 **Analytics Dashboard** - Real-time sales, revenue, and customer insights
- 📦 **Product Management** - Add, edit, and delete products with image upload
- 🏷️ **Category Management** - Organize products into categories
- 📋 **Order Management** - View and update order statuses (COD & Online)
- 👥 **Customer Management** - View registered users and their order history
- 🔐 **Role-Based Access** - Secure admin panel with proper authentication
- 📝 **Audit Logs** - Track all admin actions for security

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** React Context API + TanStack Query
- **Animations:** Framer Motion
- **Form Handling:** React Hook Form + Zod validation
- **Routing:** React Router DOM v6

### Backend
- **BaaS:** Supabase (PostgreSQL database)
- **Authentication:** Supabase Auth (Email + OAuth)
- **Storage:** Supabase Storage for product images
- **Functions:** Supabase Edge Functions (Deno)

### Payments
- **Payment Gateway:** Razorpay
- **Payment Methods:** Online (UPI, Cards, Wallets) + Cash on Delivery

### Deployment
- **Hosting:** Vercel
- **CI/CD:** Automatic deployments via GitHub integration
- **Email:** Custom SMTP (Gmail/SendGrid)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun
- Supabase account
- Razorpay account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sohakousar/nutriwala.git
   cd nutriwala
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   VITE_SUPABASE_PROJECT_ID=your_project_id
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:8080`

### Database Setup

1. Go to your Supabase project dashboard
2. Run the SQL migration scripts from `supabase/migrations/`
3. Set up Row Level Security (RLS) policies
4. Create admin user role in `user_roles` table

---

## 🔐 Environment Variables

Create a `.env` file with these variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous key | ✅ Yes |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | ✅ Yes |
| `VITE_RAZORPAY_KEY_ID` | Razorpay API key ID | ✅ Yes |

For Supabase Edge Functions, also set:
- `RAZORPAY_KEY_SECRET` - Razorpay secret key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

---

## 📦 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login and deploy**
   ```bash
   vercel login
   vercel
   ```

3. **Add environment variables** in Vercel dashboard

4. **Deploy Supabase Functions**
   ```bash
   npx supabase functions deploy create-razorpay-order
   npx supabase functions deploy verify-razorpay-payment
   npx supabase functions deploy handle-cod-order
   ```

### Update Production URLs

After deployment:
1. Update **Site URL** in Supabase → Authentication settings
2. Add production URL to **Redirect URLs**
3. Update **Authorized redirect URIs** in Google Cloud Console (for OAuth)

---

## 📁 Project Structure

```
nutriwala/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── admin/       # Admin panel components
│   │   ├── cart/        # Shopping cart components
│   │   ├── landing/     # Landing page sections
│   │   ├── layout/      # Layout components
│   │   ├── shop/        # Shop/product components
│   │   └── ui/          # shadcn/ui components
│   ├── contexts/        # React contexts
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   ├── hooks/           # Custom React hooks
│   │   ├── useAdmin.ts
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   └── useProducts.ts
│   ├── integrations/    # External integrations
│   │   └── supabase/
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components
│   │   ├── admin/       # Admin pages
│   │   ├── auth/        # Auth pages
│   │   └── ...          # Other pages
│   ├── App.tsx          # Root component
│   └── main.tsx         # Entry point
├── supabase/
│   ├── functions/       # Edge Functions
│   │   ├── create-razorpay-order/
│   │   ├── verify-razorpay-payment/
│   │   └── handle-cod-order/
│   └── migrations/      # Database migrations
├── .env                 # Environment variables (not in git)
├── package.json
└── vite.config.ts
```

---

## 👨‍💼 Admin Panel

Access the admin panel at `/admin` after logging in with an admin account.

### Admin Setup

1. Create a user account
2. In Supabase, insert into `user_roles` table:
   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES ('your-user-id', 'super_admin');
   ```

### Admin Features

- **Dashboard:** Overview of sales, orders, and customers
- **Products:** CRUD operations for products
- **Categories:** Manage product categories
- **Orders:** View and manage all orders
- **Customers:** View registered users and their orders
- **Audit Logs:** Track admin actions

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for type safety
- Follow the existing code style
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

---

## 📜 License

© 2026 Nutriwala. All rights reserved.

This is proprietary software. Unauthorized copying, modification, distribution, or use of this software is strictly prohibited.

---

## 📞 Support

For support, email support@nutriwala.com or create an issue in the repository.

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [Vercel](https://vercel.com) - Hosting and deployment
- [Razorpay](https://razorpay.com) - Payment gateway
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Tailwind CSS](https://tailwindcss.com) - Styling

---

<div align="center">

**Made with ❤️ for healthy living**

[⬆ Back to Top](#-nutriwala---premium-dry-fruits--nuts-e-commerce)

</div>
