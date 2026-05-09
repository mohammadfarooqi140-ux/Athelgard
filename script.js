gsap.registerPlugin(ScrollTrigger);

// Handle smooth page fade-in on load
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

/**
 * Web Audio API - Hover "Tick" Sound
 */
let audioCtx;
const playHoverSound = () => {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    // Create a very short, sharp pitch drop for a premium "tick"
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime); // Keep volume very subtle
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.05);
};

/**
 * Advanced 3D Background - Obsidian Shards
 */
const initThreeJS = () => {
    const container = document.getElementById('webgl-container');
    if (!container) return; // Prevent errors if missing

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x010101, 0.035);

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    // Ember Particle System
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 800;
    const posArray = new Float32Array(particlesCount * 3);
    const speedArray = new Float32Array(particlesCount);
    
    for(let i=0; i < particlesCount * 3; i+=3) {
        // Spread particles around center
        posArray[i] = (Math.random() - 0.5) * 30; // x
        posArray[i+1] = (Math.random() - 0.5) * 30; // y
        posArray[i+2] = (Math.random() - 0.5) * 20; // z
        speedArray[i/3] = Math.random() * 0.02 + 0.01;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('aSpeed', new THREE.BufferAttribute(speedArray, 1));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.06,
        color: 0x00e5ff, // Glowing Cyan
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Lighting config for cinematic dark metallic look
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // Key Light
    const mainSpot = new THREE.SpotLight(0xffffff, 5, 100, 0.6, 1, 1);
    mainSpot.position.set(15, 20, 10);
    mainSpot.castShadow = true;
    scene.add(mainSpot);
    
    // Rim Light (Cold)
    const fillLight = new THREE.PointLight(0x00e5ff, 2, 50);
    fillLight.position.set(-15, -5, -10);
    scene.add(fillLight);
    
    // Cyan Core Light
    const emberLight = new THREE.PointLight(0x00e5ff, 1.5, 30);
    emberLight.position.set(0, 0, 5);
    scene.add(emberLight);

    // Glint Light (Used for Cinematic Reveal)
    const glintLight = new THREE.PointLight(0xffffff, 0, 15);
    glintLight.position.set(-5, 0, 3);
    scene.add(glintLight);

    // === Dragon Katana GLB Integration ===
    const loadingManager = new THREE.LoadingManager(
        () => { console.log('[Aethelgard Forge] Dragon Katana: Fully loaded.'); },
        (url, loaded, total) => { console.log(`[Aethelgard Forge] Loading: ${Math.round((loaded / total) * 100)}%`); },
        (url) => { console.error(`[Aethelgard Forge] Error: ${url}`); }
    );

    let katanaModel = null;

    if (typeof THREE.GLTFLoader !== 'undefined') {
        const gltfLoader = new THREE.GLTFLoader(loadingManager);
        gltfLoader.load(
            'assets/models/dragon_katana.glb',
            (gltf) => {
                katanaModel = gltf.scene;

                // Scale and position
                katanaModel.scale.set(2.5, 2.5, 2.5);
                katanaModel.position.set(0, -1.5, 0);
                katanaModel.rotation.y = Math.PI * 0.1;

                katanaModel.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        // Boost metalness slightly
                        if(child.material) {
                            child.material.metalness = 1.0;
                            child.material.roughness = 0.2;
                        }
                    }
                });

                scene.add(katanaModel);

                // --- GSAP SCROLL TRIGGERS FOR 3D ---
                
                // 1. Cinematic Blade Reveal (Rotation & Glint)
                const heroTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: ".hero-section",
                        start: "top top",
                        end: "bottom top",
                        scrub: 1
                    }
                });
                
                heroTl.to(katanaModel.rotation, {
                    y: Math.PI * 2.5, // Full spin + extra
                    ease: "none"
                }, 0);
                
                // Sweep Glint Light across the blade
                heroTl.to(glintLight, { intensity: 10, duration: 0.2, ease: "power2.in" }, 0.4);
                heroTl.to(glintLight.position, { x: 5, y: 2, duration: 0.4, ease: "none" }, 0.4);
                heroTl.to(glintLight, { intensity: 0, duration: 0.2, ease: "power2.out" }, 0.6);

                // 2. Premium Camera Motion (Zoom on Specs)
                gsap.to(camera.position, {
                    z: 6,
                    y: 1, // Look slightly up towards Tsuba/Hamon
                    ease: "power2.inOut",
                    scrollTrigger: {
                        trigger: ".philosophy-section",
                        start: "top bottom",
                        end: "top top",
                        scrub: 1
                    }
                });
                
            },
            undefined,
            (error) => { console.error('[Aethelgard Forge] GLTFLoader error:', error); }
        );
    } else {
        console.warn('[Aethelgard Forge] GLTFLoader not available. Check CDN script tag.');
    }

    camera.position.z = 15;

    // Mouse Parallax Interaction for Embers and UI
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    document.addEventListener('mousemove', (e) => {
        const normX = (e.clientX / window.innerWidth) * 2 - 1;
        const normY = -(e.clientY / window.innerHeight) * 2 + 1;
        mouseX = normX * 0.5;
        mouseY = normY * 0.5;
    });

    const clock = new THREE.Clock();

    // Animation Loop
    const animate = () => {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        
        targetX = mouseX * 0.5;
        targetY = mouseY * 0.5;
        
        // Swirling Embers
        particlesMesh.rotation.y = elapsedTime * 0.05 + targetX;
        particlesMesh.rotation.x = targetY;
        
        // Subtle Ember Floating
        const positions = particlesGeometry.attributes.position.array;
        const speeds = particlesGeometry.attributes.aSpeed.array;
        for(let i = 1; i < particlesCount * 3; i+=3) {
            positions[i] += speeds[Math.floor(i/3)];
            if(positions[i] > 15) {
                positions[i] = -15; // Wrap around
            }
        }
        particlesGeometry.attributes.position.needsUpdate = true;
        
        // Move Ember Light slightly with mouse
        if(typeof emberLight !== 'undefined') {
            emberLight.position.x += (mouseX * 5 - emberLight.position.x) * 0.05;
            emberLight.position.y += (mouseY * 5 - emberLight.position.y) * 0.05;
        }

        renderer.render(scene, camera);
    };
    animate();

    // Resize handling
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

/**
 * Universal & Page-Specific GSAP Animations
 */
const initAnimations = () => {
    // --- Inject Scroll Progress Bar ---
    if(!document.querySelector('.scroll-progress-container')) {
        document.body.insertAdjacentHTML('afterbegin', `<div class="scroll-progress-container"><div class="scroll-progress-bar" id="progress-bar"></div></div>`);
    }

    const nav = document.querySelector('.navbar');
    const progressBar = document.getElementById('progress-bar');

    window.addEventListener('scroll', () => {
        if(window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');

        // Update progress bar
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        if(progressBar) progressBar.style.width = scrollPercent + '%';
    }, { passive: true });

    if (document.querySelector('.hero-content')) {
        gsap.to('.hero-content', { 
            opacity: 1, 
            x: 0, 
            y: 0, 
            duration: 1.8, 
            ease: 'power4.out', 
            delay: 0.5 
        });
    }

    // Background image scroll fade-out (subtle)
    if (document.querySelector('.hero-katana-wrapper')) {
        gsap.to('.hero-katana-wrapper', {
            scrollTrigger: {
                trigger: '.hero-section',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            },
            opacity: 0,
            y: 50,
            ease: 'power1.inOut'
        });
    }

    // Advanced Magnetic Button Hover Effect (Niche 3D interaction)
    const magneticElements = document.querySelectorAll('.btn-primary, .action-btn');
    magneticElements.forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
        });
    });

    // Intense Premium Scroll Reveals for Text
    const richTexts = document.querySelectorAll('.gradient-text, .section-title');
    richTexts.forEach((text) => {
        gsap.from(text, {
            scrollTrigger: { trigger: text, start: 'top 85%' },
            opacity: 0, y: 40, scale: 0.96, duration: 1.4, ease: "power4.out"
        });
    });

    // Glass Card Grid Stagger & 3D Tilt
    const cards = document.querySelectorAll('.glass-card');
    if (cards.length > 0) {
        ScrollTrigger.batch(cards, {
            start: "top 85%",
            onEnter: batch => gsap.fromTo(batch, 
                { opacity: 0, y: 80, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, stagger: 0.15, duration: 1.2, ease: "power3.out" }
            ),
            once: true
        });

        // Card Entrance & Glint Activation
        cards.forEach((card, i) => {
            card.classList.add('glint-card'); // Activate the light sweep

            const img = card.querySelector('img');
            gsap.to(img, {
                scrollTrigger: { trigger: card, scrub: true },
                y: -15, ease: 'none'
            });

            // True 3D Tilt on Hover
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -12; // Invert tilt
                const rotateY = ((x - centerX) / centerX) * 12;
                
                card.style.transition = 'transform 0.1s ease-out';
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transition = 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            });
        });

        // Niche: Magnetic Acquire Buttons
        const acquireBtns = document.querySelectorAll('.btn-acquire');
        acquireBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                gsap.to(btn, { x: x * 0.5, y: y * 0.5, duration: 0.3, ease: 'power2.out' });
            });
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
            });
        });
    }

    // Filter Logic for Collection Page
    const filterBtns = document.querySelectorAll('.filter-btn');
    if(filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.dataset.filter;
                cards.forEach(card => {
                    if(filter === 'all' || card.dataset.category === filter) {
                        card.style.display = 'block';
                        gsap.fromTo(card, {opacity: 0, scale: 0.9}, {opacity: 1, scale: 1, duration: 0.5});
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Bind global hover sound interactions
    const interactables = document.querySelectorAll('a, button, .glass-card, .filter-btn');
    interactables.forEach(el => {
        if (!el.classList.contains('close-cart-btn')) {
            el.addEventListener('mouseenter', playHoverSound);
        }
    });

    initThreeJS();
    initAnimations();

    // --- Inject Mobile Native Bottom Nav ---
    const bottomNavHTML = `
        <nav class="bottom-tab-bar">
            <a href="index.html" class="tab-item">
                <span class="tab-icon">✧</span>
                <span class="tab-label">Origin</span>
            </a>
            <a href="collection.html" class="tab-item">
                <span class="tab-icon">⟡</span>
                <span class="tab-label">Vault</span>
            </a>
            <a href="configurator.html" class="tab-item">
                <span class="tab-icon">◬</span>
                <span class="tab-label">Forge</span>
            </a>
            <a href="#" class="tab-item" id="mobile-cart-btn">
                <span class="tab-icon">⊘</span>
                <span class="tab-label">Cart</span>
            </a>
        </nav>
    `;
    document.body.insertAdjacentHTML('beforeend', bottomNavHTML);

    // --- Interactive Cart Drawer Logic ---
    const cartOverlay = document.getElementById('cart-overlay');
    const cartDrawer = document.getElementById('cart-drawer');
    const openCartBtn = document.getElementById('open-cart-btn');
    const mobileCartBtn = document.getElementById('mobile-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    let cartCount = 0;

    const toggleCart = (state) => {
        if(state) {
            cartOverlay.classList.add('active');
            cartDrawer.classList.add('open');
        } else {
            cartOverlay.classList.remove('active');
            cartDrawer.classList.remove('open');
        }
    };

    if(openCartBtn) openCartBtn.addEventListener('click', () => toggleCart(true));
    if(mobileCartBtn) {
        mobileCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCart(true);
        });
    }
    if(closeCartBtn) closeCartBtn.addEventListener('click', () => toggleCart(false));
    if(cartOverlay) cartOverlay.addEventListener('click', () => toggleCart(false));

    // Handle "Acquire" buttons to add items
    const acquireBtns = document.querySelectorAll('.card-link, .btn-acquire, #btn-forge-acquire');
    acquireBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if(btn.id !== 'btn-forge-acquire' && btn.href && btn.href.includes('#')) {
                e.preventDefault();
            }
            
            const card = btn.closest('.glass-card') || btn.closest('.config-panel');
            const title = card.querySelector('.card-title') || card.querySelector('h2');
            const price = card.querySelector('.card-price');
            // Try to find image container related to this card
            let imgSrc = 'assets/base_blade.png';
            if (btn.id === 'btn-forge-acquire') {
                imgSrc = document.getElementById('config-blade-img').src;
            } else if (card.querySelector('img')) {
                imgSrc = card.querySelector('img').src;
            }
            
            // Remove empty message if exists
            const emptyMsg = cartItemsContainer.querySelector('.empty-cart');
            if(emptyMsg) emptyMsg.remove();
            
            // Add item to UI
            const itemHTML = `
            <div class="cart-item">
                <img src="${imgSrc}" alt="${title.innerText}">
                <div class="cart-item-info">
                    <h4>${title.innerText}</h4>
                    <p>${price.innerText}</p>
                </div>
            </div>`;
            cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
            
            cartCount++;
            if(openCartBtn) openCartBtn.innerText = `Vault [${cartCount}]`;
            
            toggleCart(true); // Open drawer automatically
        });
    });

    // --- Configurator Material Swapping Logic ---
    const configBtns = document.querySelectorAll('.config-btn');
    if(configBtns.length) {
        configBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // If it's a primary button, deselect other primary buttons
                const isCompareBtn = btn.classList.contains('config-comp-btn');
                const groupSelector = isCompareBtn ? '.config-comp-btn' : '.config-btn:not(.config-comp-btn)';
                document.querySelectorAll(groupSelector).forEach(b => b.classList.remove('active'));
                
                btn.classList.add('active');
                
                // Update target image
                const targetImg = document.getElementById(btn.dataset.target);
                if(targetImg) targetImg.setAttribute('data-material', btn.dataset.filter);
            });
        });
    }

    // Compare Mode Toggle
    const toggleCompareBtn = document.getElementById('toggle-compare-btn');
    const configContainer = document.getElementById('configurator-container');
    if(toggleCompareBtn && configContainer) {
        toggleCompareBtn.addEventListener('click', () => {
            configContainer.classList.toggle('compare-mode');
            if(configContainer.classList.contains('compare-mode')) { // Is active
                toggleCompareBtn.innerText = "Close Compare";
                toggleCompareBtn.style.background = "var(--text-primary)";
                toggleCompareBtn.style.color = "#000";
            } else {
                toggleCompareBtn.innerText = "Compare Layout";
                toggleCompareBtn.style.background = "transparent";
                toggleCompareBtn.style.color = "var(--text-primary)";
            }
        });
    }

    // --- Checkout Validations ---
    const checkoutForm = document.getElementById('checkout-form');
    if(checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;
            
            const inputs = checkoutForm.querySelectorAll('.form-input');
            inputs.forEach(input => {
                if(!input.value.trim()) {
                    input.classList.add('error-pulse');
                    isValid = false;
                } else {
                    input.classList.remove('error-pulse');
                }
            });

            const ageCheck = document.getElementById('age-check');
            const checkGroup = ageCheck.closest('.checkbox-group');
            if(!ageCheck.checked) {
                checkGroup.classList.add('error-pulse');
                isValid = false;
            } else {
                checkGroup.classList.remove('error-pulse');
            }

            if(isValid) {
                // Flash success, clear form
                const btn = checkoutForm.querySelector('.btn-primary');
                btn.innerText = "Processing...";
                setTimeout(() => {
                    btn.innerText = "Acquisition Complete ✓";
                    btn.style.backgroundColor = "#fff"; btn.style.color = "#000";
                    setTimeout(() => window.location.href = 'index.html', 2000);
                }, 1500);
            }
        });

        // Remove error pulse on typings
        checkoutForm.querySelectorAll('.form-input, input[type="checkbox"]').forEach(el => {
            el.addEventListener('input', () => {
                el.classList.remove('error-pulse');
                if(el.type === 'checkbox') el.closest('.checkbox-group').classList.remove('error-pulse');
            });
        });
    }
    
    // Set Checkout Route for all Cart Footers
    const cartCheckoutBtns = document.querySelectorAll('.cart-footer .btn-primary');
    cartCheckoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.remove('loaded');
            setTimeout(() => { window.location.href = 'checkout.html'; }, 800);
        });
    });

    // --- Smooth Page Transitions ---
    const links = document.querySelectorAll('a[href]:not([target="_blank"]):not([href^="#"])');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            if(link.getAttribute('href') === '#' || link.classList.contains('card-link')) return; 
            
            e.preventDefault();
            const target = link.href;
            
            document.body.classList.remove('loaded'); // Trigger CSS fade out
            
            setTimeout(() => {
                window.location.href = target;
            }, 800); // Matches CSS transition duration
        });
    });
});
