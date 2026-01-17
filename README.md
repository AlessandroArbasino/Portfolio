# Portfolio - Alessandro Arbasino

Portfolio personale interattivo costruito con **Angular 21** e **Node.js/Express**, con integrazione AI per personalizzazione dinamica del tema.

## 🚀 Features

- ✨ **AI-Powered Theming**: Chat AI con Google Gemini per personalizzare colori e background
- 🎨 **Dynamic Color Extraction**: Estrazione automatica palette colori da immagini/video
- 🌍 **Multilingual**: Supporto multilingua dinamico (IT/EN)
- 📱 **Responsive Design**: Design mobile-first con TailwindCSS
- 🔍 **SEO Optimized**: Meta tags, Open Graph, Twitter Cards, Structured Data
- 🎭 **Smooth Animations**: Animazioni fluide con Angular Animations API

## 🛠️ Tech Stack

### Frontend
- **Angular 21** (Standalone Components)
- **TypeScript 5.9**
- **TailwindCSS 3.4**
- **RxJS** per gestione stato reattivo
- **Angular Material 18**

### Backend
- **Node.js** + **Express 5**
- **MongoDB** con Mongoose
- **Google Gemini AI** per chat intelligente
- **Cloudinary** per gestione media

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/yourusername/portfolio.git
cd portfolio

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your API keys

# Run development server
npm run dev
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# API Keys
PEXELS_API_KEY=your_pexels_api_key
GEMINI_API_KEY=your_google_gemini_api_key
TRANSLATE_CONTENT_API_KEY=your_translate_api_key

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Settings
AI_CHAT_RETENTION_DAYS=30
PORT=3000
NODE_ENV=development
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables in Vercel
Add all variables from `.env.example` in:
`Project Settings → Environment Variables`

## 📁 Project Structure

```
portfolio/
├── src/
│   ├── app/
│   │   ├── components/      # Angular components
│   │   ├── services/        # Services (API, Theme, Language, SEO)
│   │   ├── interceptors/    # HTTP interceptors
│   │   └── models/          # TypeScript interfaces
│   └── index.html           # Main HTML with SEO meta tags
├── server/
│   ├── controllers/         # API controllers
│   ├── models/             # MongoDB models
│   ├── routes/             # Express routes
│   ├── services/           # Business logic
│   └── server.js           # Express server
├── public/
│   ├── robots.txt          # SEO: Robots file
│   ├── sitemap.xml         # SEO: Sitemap
│   └── google*.html        # Google Search Console verification
└── vercel.json             # Vercel configuration
```

## 🎨 Key Features Explained

### AI Chat Personalization
- Users can chat with AI to change portfolio theme
- Color extraction from background images/videos
- Theme persistence in MongoDB (linked to chat session)

### SEO Optimization
- Meta description, keywords, author
- Open Graph tags (Facebook, LinkedIn)
- Twitter Card tags
- Structured Data (JSON-LD) for Person and WebSite schema
- Semantic HTML (`<main>`, `<footer>`, `role` attributes)

### Multilingual Support
- Dynamic language switching (IT/EN)
- Texts stored in MongoDB
- No page reload required

## 📝 Scripts

```bash
# Development
npm run dev              # Run client + server concurrently
npm run dev:client       # Run only Angular dev server
npm run server           # Run only Node.js server

# Production
npm run build            # Build Angular app
npm start                # Run Angular dev server

# Testing
npm test                 # Run unit tests
```

## 🔒 Security Notes

⚠️ **NEVER commit `.env` file to Git!**

The `.gitignore` already excludes:
- `.env` and `.env.*`
- `node_modules/`
- `dist/`

Before pushing to public repository:
1. ✅ Verify `.env` is in `.gitignore`
2. ✅ Check no API keys are hardcoded
3. ✅ Create `.env.example` with placeholder values

## 📊 SEO Checklist

After deployment:
- [ ] Verify `robots.txt` accessible: `https://yoursite.com/robots.txt`
- [ ] Verify `sitemap.xml` accessible: `https://yoursite.com/sitemap.xml`
- [ ] Submit sitemap to Google Search Console
- [ ] Test with Lighthouse (DevTools → Lighthouse → SEO)
- [ ] Test Open Graph with [Facebook Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Test Twitter Cards with [Twitter Validator](https://cards-dev.twitter.com/validator)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Alessandro Arbasino**
- Portfolio: [alessandroarbasino.vercel.app](https://alessandroarbasino.vercel.app)
- GitHub: [@alessandroarbasino](https://github.com/alessandroarbasino)
- LinkedIn: [Alessandro Arbasino](https://linkedin.com/in/alessandroarbasino)

---

Made with ❤️ using Angular 21 and Node.js