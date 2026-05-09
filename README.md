# Aethelgard Forge - Commercial Web Template

Welcome to the **Aethelgard Forge** source code! This is a high-end, highly-optimized, glassmorphism UI template designed for premium e-commerce, specifically tailored for luxury physical or digital goods (like custom knives, watches, jewelry, or in-game items).

## 🚀 Quick Start & Deployment

This project uses pure HTML, CSS, and vanilla JavaScript. There is no build step required! 
You can simply open `index.html` in any browser to view the site.

**To deploy to Vercel, Netlify, or GitHub Pages:**
Simply upload or link this entire folder (`Demo-main`) to your hosting provider. The paths have been strictly configured (e.g., `./assets/`) to guarantee that all images and models resolve flawlessly on strict static hosting like Vercel.

---

## 🎨 Customizing the Template

This template was engineered to be completely modular. You can transform this into a store for **any product** by following these steps:

### 1. Changing the Colors & Theme
All master colors are controlled by CSS variables located at the very top of `style.css`.
Open `style.css` and look for the `:root` block:
```css
:root {
    --bg-base: #050505;
    --bg-gradient-1: #1a1a24; /* Change this to alter the global radial glow */
    --surface-light: rgba(15, 15, 18, 0.6); /* Glassmorphism card color */
    --accent-silver: #e0e0e0; /* Used for secondary text and highlights */
}
```
If you want to change the primary button colors (the "Obsidian & Silver" buttons), search `style.css` for `.btn-primary` and change the `background: linear-gradient(...)` property to your brand colors.

### 2. Swapping the Products and Pictures
All images are pulled from the `assets/` folder.
1. Place your own transparent `.png` product images into the `assets/` folder.
2. Open `collection.html` (The Vault) and `index.html`.
3. Locate the `<img src="./assets/your_image.png">` tags and update the file names.
4. Update the text directly inside the `<h3>` (Title) and `<p>` (Description) tags beneath each image.

### 3. Updating the Prices
Prices are hardcoded in the HTML to give you maximum control over formatting.
- Open `collection.html` or `index.html`.
- Search for `<span class="card-price">$55.00</span>` and change the number to whatever you like. 
- You can also change the currency symbol here (e.g., `£`, `€`).

### 4. Customizing the 3D Configurator (Forge)
The `configurator.html` page uses CSS filters to magically recolor a single base image.
- Replace `./assets/base_blade.png` with a transparent, grey-scale image of your product.
- Open `style.css` and search for `/* Base Filters for Materials */`.
- You will see rules like `img[data-material="chrome"] { filter: ... }`. You can tweak these CSS `hue-rotate`, `brightness`, and `saturate` filters to create infinite color variations for your product without needing multiple images!

### 5. Modifying the 3D Background Particles
The swirling ambient embers are controlled by Three.js in `script.js`.
- Open `script.js` and locate `initThreeJS()`.
- Search for `color: 0x00e5ff`. Change this hex code to modify the color of the floating particles to match your brand.
- Below that, find `emberLight = new THREE.PointLight(0x00e5ff...)` and change it to match so the glow reflects accurately.

---

## 🧩 Integrating into Your Existing Website

If you already have a website (e.g., Shopify, WordPress, or a custom build) and just want to add these premium features, here is how you can integrate them:

### 1. Porting the Glassmorphism UI (The Cards)
To bring the luxury frosted-glass product cards into your existing site:
1. Copy the `:root` variables from `style.css` and paste them into your site's main CSS file.
2. Copy the `.glass-card`, `.card-img-container`, and `.card-content` CSS rules.
3. Wrap your products in `<article class="glass-card">` to instantly apply the 3D tilt hover effects and frosted glass.

### 2. Porting the 3D Forge Configurator
If you want the interactive material-swapping configurator on your own product page:
1. Copy the HTML structure from `configurator.html` (specifically the `<main class="configurator-container">` section).
2. Copy the related CSS (`.config-visual`, `.config-panel`, and the `/* Base Filters for Materials */` section) into your stylesheet.
3. Copy the "Configurator Material Swapping Logic" from `script.js` into your site's Javascript file.

### 3. Porting the Ambient Particles Background
If you want the floating embers behind your existing site:
1. Copy the `<div id="webgl-container"></div>` into your site's `<body>`.
2. Ensure you include the Three.js `<script>` tag (`https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`).
3. Copy the `initThreeJS()` function from `script.js` and call it on page load.

## 🔒 The Checkout Page
The `checkout.html` is a beautifully designed, front-end UI shell. To process real payments:
1. Locate the `<form id="secure-checkout-form">` in `checkout.html`.
2. Replace the form action or use JavaScript to attach it to your payment processor (like Stripe, LemonSqueezy, or Shopify Buy Button).

Enjoy building your premium storefront!