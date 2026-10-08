import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { trpc } from "./lib/trpc";
import {
  ArrowRight, BadgeCheck, BatteryCharging, Bike, Camera, Check, ChevronDown, ChevronRight,
  ArrowLeft, CircleUserRound, CreditCard, Eye, EyeOff, Heart, Instagram, Laptop, MapPin, Menu, Package, PackageCheck, Star,
  House, LockKeyhole, Mail, Moon, Phone, Plus, RotateCcw, Search, ShieldCheck, ShoppingBag, Smartphone, Sparkles, Store, Sun, Tag,
  Trash2, Truck, UploadCloud, Wrench, X, Zap,
} from "lucide-react";

const IMG = {
  hero: "https://files.manuscdn.com/search-media/310519663933648094/Et6LyycN5iP9ToYjJFtwzB/QnDuQcixwAeWSV4C6efJxb.jpg",
  repair: "https://files.manuscdn.com/search-media/310519663933648094/Et6LyycN5iP9ToYjJFtwzB/ocTx8St7QxHz87A3bhnbiB.jpg",
  phones: "https://files.manuscdn.com/search-media/310519663933648094/Et6LyycN5iP9ToYjJFtwzB/hARVVZXMDeRsRHJf7qX5xW.jpg",
  store: "https://files.manuscdn.com/search-media/310519663933648094/Et6LyycN5iP9ToYjJFtwzB/F4wCRumpvJMb9Mwu2DD82a.jpg",
};

type Product = { id: number; name: string; spec: string; price: number; was: number; tag: string; image: string; category: string; tone: string; rating: string; stock: string; description?: string };
const products: Product[] = [
  { id: -1, name: "iPhone 13", spec: "128GB · Midnight · Excellent", price: 32990, was: 37990, tag: "Top pick", image: IMG.phones, category: "iPhone", tone: "violet", rating: "4.8", stock: "Only 2 left" },
  { id: -2, name: "Samsung S23", spec: "256GB · Green · Like new", price: 27990, was: 32990, tag: "Just in", image: IMG.hero, category: "Samsung", tone: "blue", rating: "4.7", stock: "Ready to ship" },
  { id: -3, name: "Google Pixel 7", spec: "128GB · Snow · Excellent", price: 18990, was: 21990, tag: "Deal", image: IMG.phones, category: "Android", tone: "mint", rating: "4.6", stock: "Ready to ship" },
  { id: -4, name: "MacBook Air M1", spec: "8GB · 256GB SSD · 2020", price: 49990, was: 56990, tag: "Laptop", image: IMG.store, category: "Laptops", tone: "sand", rating: "4.9", stock: "Only 1 left" },
  { id: -5, name: "iPhone 12", spec: "64GB · Blue · Very good", price: 23990, was: 27990, tag: "Value buy", image: IMG.phones, category: "iPhone", tone: "violet", rating: "4.5", stock: "Ready to ship" },
  { id: -6, name: "OnePlus 11", spec: "256GB · Titan Black · Like new", price: 24990, was: 29990, tag: "Hot deal", image: IMG.hero, category: "Android", tone: "blue", rating: "4.7", stock: "Ready to ship" },
  { id: -7, name: "iPad Air 4", spec: "64GB · Wi‑Fi · Sky Blue", price: 29990, was: 34990, tag: "Trending", image: IMG.store, category: "Tablets", tone: "sand", rating: "4.8", stock: "Only 3 left" },
  { id: -8, name: "Galaxy Watch 5", spec: "44mm · Bluetooth · Graphite", price: 12990, was: 16990, tag: "Wearable", image: IMG.hero, category: "Wearables", tone: "mint", rating: "4.4", stock: "Ready to ship" },
];
const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const categories = [{ label: "Mobiles", icon: Smartphone }, { label: "Laptops", icon: Laptop }, { label: "Tablets", icon: Package }, { label: "Wearables", icon: Sparkles }, { label: "Repair", icon: Wrench }, { label: "Sell / Exchange", icon: RotateCcw }];
const reveal = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: .55 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: .08 } } };

type Drawer = "cart" | "login" | "sell" | "repair" | "checkout" | "product" | null;
type Page = "home" | "shop" | "sell" | "repair" | "auth" | "admin" | "track";

function readStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [cart, setCart] = useState<Product[]>(() => readStored<Product[]>("iconnect.cart", []));
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [toast, setToast] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [sort, setSort] = useState("Recommended");
  const [saved, setSaved] = useState<number[]>(() => readStored<number[]>("iconnect.saved", []));
  const [showSaved, setShowSaved] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const catalogQuery = trpc.catalog.list.useQuery(undefined, { retry: false });
  const storeVideoQuery = trpc.siteMedia.currentStoreVideo.useQuery(undefined, { retry: false });
  const catalogCreate = trpc.catalog.create.useMutation();
  const managedProducts = useMemo<Product[]>(() => (catalogQuery.data ?? []).map(product => ({ ...product, was: product.wasPrice, tone: "mint", rating: "New" })), [catalogQuery.data]);
  const allProducts = useMemo(() => [...products, ...managedProducts], [managedProducts]);
  const [page, setPage] = useState<Page>(() => window.location.pathname === "/shop" ? "shop" : window.location.pathname === "/sell" ? "sell" : window.location.pathname === "/repair" ? "repair" : window.location.pathname === "/admin" ? "admin" : window.location.pathname === "/track" ? "track" : window.location.pathname === "/login" || window.location.pathname === "/signup" ? "auth" : "home");
  const filtered = useMemo(() => {
    const result = allProducts.filter(p => (filter === "All" || p.category === filter) && (!showSaved || saved.includes(p.id)) && `${p.name} ${p.spec}`.toLowerCase().includes(search.toLowerCase()));
    return [...result].sort((a, b) => sort === "Price: low to high" ? a.price - b.price : sort === "Price: high to low" ? b.price - a.price : 0);
  }, [allProducts, filter, search, sort, showSaved, saved]);
  useEffect(() => { localStorage.setItem("iconnect.cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("iconnect.saved", JSON.stringify(saved)); }, [saved]);
  const total = cart.reduce((sum, p) => sum + p.price, 0);
  const notify = (text: string) => { setToast(text); window.setTimeout(() => setToast(""), 2600); };
  const addToCart = (p: Product) => { setCart(c => { if (c.some(item => item.id === p.id)) { notify(`${p.name} is already in your bag`); return c; } notify(`${p.name} added to bag`); return [...c, p]; }); };
  const scrollTo = (id: string) => { setMobileNav(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };
  const openProduct = (p: Product) => { setSelected(p); setDrawer("product"); };
  const goPage = (next: Page) => { const path = next === "home" ? "/" : `/${next}`; window.history.pushState({}, "", path); setMobileNav(false); setShowSaved(false); setPage(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const saveManagedProduct = async (product: Product) => {
    const imageData = product.image.startsWith("data:image/") ? product.image : undefined;
    const image = imageData ? undefined : product.image;
    await catalogCreate.mutateAsync({ name: product.name, spec: product.spec, price: product.price, wasPrice: product.was, tag: product.tag, image, imageData, category: product.category, stock: product.stock, description: product.description });
    await catalogQuery.refetch();
  };

  const openCart = () => { if (page !== "home") goPage("home"); setDrawer("cart"); };
  const toggleSaved = (id: number) => setSaved(items => items.includes(id) ? items.filter(item => item !== id) : [...items, id]);

  if (page !== "home") return <DedicatedPage page={page} darkMode={darkMode} setDarkMode={setDarkMode} goPage={goPage} products={allProducts} filtered={filtered} search={search} addToCart={addToCart} submitted={submitted} setSubmitted={setSubmitted} saveManagedProduct={saveManagedProduct} filter={filter} setFilter={setFilter} sort={sort} setSort={setSort} saved={saved} toggleSaved={toggleSaved} cartCount={cart.length} openCart={openCart} />;

  return <div className={darkMode ? "market-shell editorial-dark" : "market-shell"}>
    <div className="market-alert"><span><Zap size={13} /> FREE SAME-DAY DIAGNOSIS ON REPAIRS</span><span className="market-alert-center">Bengaluru's trusted pre-owned device store</span><a href="https://www.instagram.com/iconnect.blr/" target="_blank" rel="noreferrer">Follow @iconnect.blr <Instagram size={13} /></a></div>
    <motion.header className="market-header" initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .45, ease: "easeOut" }}>
      <button className="brand market-brand" onClick={() => scrollTo("home")}><span className="brand-mark"><span /></span><span>iconnect<span className="brand-dot">.</span>blr</span></button>
      <form className="market-search" onSubmit={e => { e.preventDefault(); goPage("shop"); }}><Search size={18} /><input value={search} onChange={e => { setSearch(e.target.value); scrollTo("catalogue"); }} placeholder="Search for mobiles, laptops, repairs…" aria-label="Search mobiles, laptops and repairs" /><button className="search-submit" type="submit" aria-label="Search">Search</button><kbd>Ctrl K</kbd></form>
      <div className="market-actions"><button className="theme-toggle" onClick={() => setDarkMode(v => !v)} aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}>{darkMode ? <Sun size={17} /> : <Moon size={17} />}</button><button className="market-login" onClick={() => goPage("auth")}><CircleUserRound size={18} /><span>Login</span></button><button className="market-cart" onClick={() => setDrawer("cart")}><span>Bag</span><b>{cart.length}</b></button><button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Menu">{mobileNav ? <X /> : <Menu />}</button></div>
    </motion.header>
    <motion.nav className={mobileNav ? "market-nav open" : "market-nav"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .18, duration: .4 }}><button onClick={() => goPage("shop")}>Shop devices</button><button onClick={() => goPage("repair")}>Repair</button><button onClick={() => goPage("sell")}>Sell / Exchange</button><button onClick={() => goPage("track")}>Track an order</button><button onClick={() => scrollTo("stores")}>Stores</button><button className="nav-highlight" onClick={() => scrollTo("deals")}><Zap size={14} /> Deals of the day</button></motion.nav>

    <main id="home">
      <section className="market-hero">
        <motion.div className="hero-panel hero-panel-main" variants={stagger} initial="hidden" animate="show"><motion.div className="hero-copy" variants={stagger}><motion.span className="market-kicker" variants={reveal}>BENGALURU'S PHONE PEOPLE</motion.span><motion.h1 variants={reveal}>Upgrade smarter.<br /><em>Pay less.</em></motion.h1><motion.p variants={reveal}>Quality-checked phones, laptops and wearables. Buy, sell, exchange or repair — all in one place.</motion.p><motion.div className="hero-actions" variants={reveal}><button className="market-primary" onClick={() => goPage("shop")}>Shop pre-owned <ArrowRight size={17} /></button><button className="market-secondary" onClick={() => goPage("sell")}>Sell your device <ChevronRight size={16} /></button></motion.div><motion.div className="hero-trust" variants={reveal}><span><ShieldCheck size={15} /> 32-point checked</span><span><Truck size={15} /> Branch pickup</span><span><RotateCcw size={15} /> 7-day support</span></motion.div></motion.div><motion.div className="hero-product" initial={{ opacity: 0, scale: .94, y: 28 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: .2, duration: .7, ease: "easeOut" }}><div className="hero-badge">UP TO<br /><strong>₹5K OFF</strong></div><div className="hero-media"><img src={IMG.hero} alt="Smartphones ready for an upgrade" /></div><div className="hero-product-caption"><span>Fresh arrivals</span><b>Good phones.<br />Better stories.</b></div></motion.div></motion.div>
        <motion.div className="hero-side" variants={stagger} initial="hidden" animate="show"><motion.div className="side-card side-card-repair" variants={reveal} whileHover={{ y: -6, scale: 1.015 }}><span className="side-card-number">01</span><Wrench size={24} /><h3>Cracked screen?<br /><em>We've got you.</em></h3><p>Fast diagnosis. Honest estimate. Real technicians.</p><button onClick={() => goPage("repair")}>Book a repair <ArrowRight size={15} /></button></motion.div><motion.div className="side-card side-card-sell" variants={reveal} whileHover={{ y: -6, scale: 1.015 }}><span className="side-card-number">02</span><Tag size={24} /><h3>That old phone<br />could be <em>money.</em></h3><p>Get a transparent quote in minutes.</p><button onClick={() => goPage("sell")}>Get a quote <ArrowRight size={15} /></button></motion.div></motion.div>
      </section>

      <section className="category-bar"><div className="category-inner">{categories.map(({ label, icon: Icon }) => <motion.button key={label} whileHover={{ y: -4 }} onClick={() => label === "Repair" ? goPage("repair") : label === "Sell / Exchange" ? goPage("sell") : label === "Mobiles" ? goPage("shop") : (setFilter(label), scrollTo("catalogue"))}><span className="category-icon"><Icon size={22} /></span><b>{label}</b><ChevronDown size={12} /></motion.button>)}</div></section>

      <section className="about-iconnect"><div className="about-copy"><span className="market-kicker">WHY ICONNECT BLR</span><h2>Genuine devices.<br /><em>Honest upgrades.</em></h2><p>iConnect BLR is your local destination for genuine mobiles and smart devices in Bengaluru. Every device is carefully checked before it reaches you, with a checking guarantee, warranty support, exchange offers, and affordable pricing.</p><div className="about-pills"><span>Checked & genuine</span><span>Warranty support</span><span>Exchange offers</span><span>Affordable prices</span></div></div><div className="about-video"><div className="video-label"><span>ICONNECT BLR / IN STORE</span><span>{storeVideoQuery.data ? "Store video" : "Visit us in Bengaluru"}</span></div>{storeVideoQuery.data ? <video src={storeVideoQuery.data.videoUrl} controls playsInline preload="metadata" aria-label="Video from the iConnect BLR store" /> : <div className="about-video-empty"><Store size={40} aria-hidden="true" /><span>Your next upgrade starts here.</span></div>}</div></section>
      <section className="deal-section" id="deals"><div className="section-head-market"><div><span className="market-kicker">THE EDIT / THIS WEEK</span><h2>Good finds. <em>Better prices.</em></h2></div><button className="market-link" onClick={() => { setFilter("All"); setShowSaved(false); scrollTo("catalogue"); }}>Shop all devices <ArrowRight size={16} /></button></div><div className="deal-grid">{allProducts.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} saved={saved.includes(p.id)} toggleSave={() => toggleSaved(p.id)} openProduct={openProduct} addToCart={addToCart} />)}</div></section>

      <section className="catalogue-section" id="catalogue"><div className="section-head-market catalogue-head"><div><span className="market-kicker">THE ICONNECT COLLECTION</span><h2>Find your next <em>favourite.</em></h2></div><div className="sort-wrap"><span>{filtered.length} {filtered.length === 1 ? "device" : "devices"}</span><label className="sort-label" htmlFor="home-sort">Sort by</label><select id="home-sort" value={sort} onChange={e => setSort(e.target.value)}><option>Recommended</option><option>Price: low to high</option><option>Price: high to low</option></select></div></div><div className="catalogue-controls"><div className="catalogue-tabs">{["All", "iPhone", "Samsung", "Android", "Laptops", "Tablets", "Wearables"].map(f => <button key={f} className={filter === f && !showSaved ? "active" : ""} onClick={() => { setFilter(f); setShowSaved(false); }}>{f}</button>)}</div><button className={showSaved ? "catalogue-saved active" : "catalogue-saved"} onClick={() => setShowSaved(value => !value)} aria-pressed={showSaved}><Heart size={15} fill={showSaved ? "currentColor" : "none"} /> Saved <span>{saved.length}</span></button><div className="catalogue-note"><ShieldCheck size={16} /> 32-point checked</div></div><div className="catalogue-grid">{filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} saved={saved.includes(p.id)} toggleSave={() => toggleSaved(p.id)} openProduct={openProduct} addToCart={addToCart} />)}{filtered.length === 0 && <div className="catalogue-empty">{showSaved ? "No saved devices yet." : "No matching devices found."} <button onClick={() => { setSearch(""); setFilter("All"); setShowSaved(false); }}>Clear filters</button></div>}</div></section>
      <section className="stores-market" id="stores"><div className="section-head-market"><div><span className="market-kicker">COME SAY HI</span><h2>Three stores.<br /><em>Same energy.</em></h2></div><a href="https://www.instagram.com/iconnect.blr/" target="_blank" rel="noreferrer" className="market-link">See us on Instagram <Instagram size={15} /></a></div><div className="store-grid-market"><StoreCard number="01" title="RT Nagar" detail="Shop No. 3, 80 Feet Road, beside Absolute Interiors Studio, P&T Colony" phone="76768 72240" image={IMG.store} map="RT Nagar Bangalore" /><StoreCard number="02" title="Yeshwanthpur" detail="RTO Office Main Road, opposite Karawali Deluxe, Bengaluru" phone="63617 33735" image={IMG.store} map="Yeshwanthpur RTO Bangalore" /><StoreCard number="03" title="Ganganagar" detail="New iConnect BLR branch in Ganganagar, Bengaluru" phone="Call branch for timings" image={IMG.store} map="Ganganagar Bangalore" /></div></section>
    </main>
    <footer className="market-footer"><div className="market-footer-grid"><div><div className="brand footer-brand"><span className="brand-mark"><span /></span><span>iconnect<span className="brand-dot">.</span>blr</span></div><p>Real phones. Real people.<br />Right here in Bengaluru.</p></div><div className="footer-column"><b>Shop</b><button onClick={() => scrollTo("catalogue")}>Pre-owned devices</button><button onClick={() => setDrawer("sell")}>Sell / Exchange</button><button onClick={() => setDrawer("repair")}>Repair service</button><button onClick={() => goPage("track")}>Track an order</button><button onClick={() => goPage("admin")}>Admin sign in</button></div><div className="footer-column"><b>Visit</b><a href="tel:+917676872240">RT Nagar · 76768 72240</a><a href="tel:+916361733735">Yeshwanthpur · 63617 33735</a><a href="https://www.instagram.com/iconnect.blr/" target="_blank" rel="noreferrer">Instagram @iconnect.blr</a></div><div className="footer-cta"><span>Need help choosing?</span><a href="tel:+919164808000">Talk to our team <ArrowRight size={15} /></a></div></div><div className="footer-bottom"><span>© 2026 iConnect BLR</span><span>Built for better upgrades.</span></div></footer>

    <nav className="mobile-bottom-nav" aria-label="Mobile navigation"><button className="active" onClick={() => goPage("home")}><House size={18} /><span>Home</span></button><button onClick={() => goPage("shop")}><ShoppingBag size={18} /><span>Shop</span></button><button onClick={() => goPage("sell")}><RotateCcw size={18} /><span>Sell</span></button><button onClick={() => goPage("repair")}><Wrench size={18} /><span>Repair</span></button><button onClick={() => scrollTo("stores")}><Store size={18} /><span>More</span></button></nav>

    <AnimatePresence>{drawer && <motion.div className={drawer === "product" ? "drawer-backdrop product-backdrop" : "drawer-backdrop"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(null)}><motion.aside className={drawer === "product" ? "drawer product-drawer" : "drawer"} initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }} onClick={e => e.stopPropagation()}>{drawer === "cart" && <CartDrawer cart={cart} total={total} setDrawer={setDrawer} remove={id => setCart(c => c.filter(p => p.id !== id))} />}{drawer === "login" && <LoginDrawer close={() => setDrawer(null)} />}{drawer === "sell" && <SellDrawer close={() => setDrawer(null)} submitted={submitted} setSubmitted={setSubmitted} />}{drawer === "repair" && <RepairDrawer close={() => setDrawer(null)} />}{drawer === "checkout" && <CheckoutDrawer cart={cart} total={total} onPlaced={() => setCart([])} close={() => setDrawer(null)} />}{drawer === "product" && selected && <ProductDrawer product={selected} saved={saved.includes(selected.id)} toggleSaved={() => toggleSaved(selected.id)} addToCart={addToCart} buyNow={product => { if (!cart.some(item => item.id === product.id)) addToCart(product); setDrawer("checkout"); }} close={() => setDrawer(null)} />}</motion.aside></motion.div>}</AnimatePresence>
    <AnimatePresence>{toast && <motion.div className="toast" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}><Check size={17} /> {toast}</motion.div>}</AnimatePresence>
  </div>;
}

function ProductCard({ product: p, index, saved, toggleSave, openProduct, addToCart }: { product: Product; index: number; saved: boolean; toggleSave: () => void; openProduct: (p: Product) => void; addToCart: (p: Product) => void }) { return <motion.article className="market-product-card" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: .35, delay: Math.min(index * .05, .2) }} whileHover={{ y: -4 }}><div className={`market-product-image ${p.tone}`}><button className="product-image-open" onClick={() => openProduct(p)} aria-label={`View ${p.name}`}><img src={p.image} alt={p.name} loading="lazy" /></button><span className="market-tag">{p.tag}</span><button className={saved ? "saved market-heart" : "market-heart"} onClick={toggleSave} aria-label={saved ? `Remove ${p.name} from saved items` : `Save ${p.name}`} aria-pressed={saved}><Heart size={17} fill={saved ? "currentColor" : "none"} /></button></div><div className="market-product-info"><button className="market-product-title" onClick={() => openProduct(p)}><h3>{p.name}</h3><p>{p.spec}</p></button><div className="rating-row"><span><Star size={12} fill="currentColor" aria-hidden="true" /> {p.rating}</span><small>{p.stock}</small></div><div className="market-price-row"><div><strong>{money(p.price)}</strong><del>{money(p.was)}</del></div><button className="market-add" onClick={() => addToCart(p)}><Plus size={16} /> Add</button></div></div></motion.article>; }
function StoreCard({ number, title, detail, phone, image, map }: { number: string; title: string; detail: string; phone: string; image: string; map: string }) { return <div className="market-store-card"><img src={image} alt={`${title} iConnect BLR store`} loading="lazy" /><div className="market-store-overlay"><span>{number}</span><div><h3>{title}</h3><p>{detail}</p><a href={`tel:${phone.replace(/ /g, "")}`}><Phone size={14} /> {phone}</a></div><a className="market-map" href={`https://maps.google.com/?q=${encodeURIComponent(map)}`} target="_blank" rel="noreferrer"><MapPin size={17} /></a></div></div>; }
function DrawerHeader({ title, kicker, close }: { title: string; kicker: string; close: () => void }) { return <div className="drawer-header"><div><span className="market-kicker">{kicker}</span><h2>{title}</h2></div><button className="close-btn" onClick={close}><X /></button></div>; }
function CartDrawer({ cart, total, setDrawer, remove }: { cart: Product[]; total: number; setDrawer: (d: Drawer) => void; remove: (id: number) => void }) { return <><DrawerHeader title="Your bag" kicker="READY WHEN YOU ARE" close={() => setDrawer(null)} />{cart.length === 0 ? <div className="drawer-empty"><div className="empty-icon"><Bike /></div><h3>Your bag is taking a breather.</h3><p>Add a device from the catalogue and it'll show up here.</p><button className="market-primary full" onClick={() => { setDrawer(null); document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" }); }}>Browse devices</button></div> : <><div className="cart-items">{cart.map((p, i) => <div className="cart-item" key={`${p.id}-${i}`}><img src={p.image} alt="" /><div><b>{p.name}</b><small>{p.spec}</small><strong>{money(p.price)}</strong></div><button onClick={() => remove(p.id)} aria-label="Remove"><Trash2 size={16} /></button></div>)}</div><div className="cart-summary"><span>Estimated subtotal</span><b>{money(total)}</b></div><button className="market-primary full" onClick={() => setDrawer("checkout")}>Continue to checkout <ArrowRight size={16} /></button><p className="fine-print">Demo payment only — no real charge will be made.</p></>}</>; }
function LoginDrawer({ close }: { close: () => void }) { return <><DrawerHeader title="Good to see you." kicker="YOUR ICONNECT ACCOUNT" close={close} /><div className="login-art"><CircleUserRound size={44} /><span>Orders, quotes,<br />and repairs in one place.</span></div><p className="drawer-lead">Sign in with your iConnect BLR account to keep shopping and service requests together.</p><button className="market-primary full" onClick={() => { close(); window.location.href = "/login"; }}>Open sign in <ArrowRight size={16} /></button><p className="fine-print">Secure email/password account access.</p></>; }
function SellDrawer({ close, submitted, setSubmitted }: { close: () => void; submitted: boolean; setSubmitted: (v: boolean) => void }) { return <><DrawerHeader title="What are you selling?" kicker="GET A QUOTE" close={close} />{submitted ? <Success title="Quote request received" copy="Our team will review your details and get back with a fair estimate shortly." close={close} /> : <form className="drawer-form" onSubmit={e => { e.preventDefault(); setSubmitted(true); }}><label>Your name<input required placeholder="e.g. Arjun Rao" /></label><label>Phone number<input required type="tel" placeholder="10-digit mobile number" /></label><label>Device model<input required placeholder="e.g. iPhone 13 128GB" /></label><div className="form-row"><label>Condition<select><option>Like new</option><option>Good</option><option>Needs repair</option></select></label><label>Preferred branch<select><option>RT Nagar</option><option>Yeshwanthpur</option><option>Ganganagar</option></select></label></div><label>Tell us anything useful<textarea placeholder="Battery health, scratches, box / bill available…" rows={3} /></label><label className="upload-field"><Camera size={17} /> Add device photos<input type="file" accept="image/*" multiple /></label><button className="market-primary full" type="submit">Request my quote <ArrowRight size={16} /></button></form>}</>; }
function RepairDrawer({ close }: { close: () => void }) {
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const message = [
      "Hi iConnect BLR, I would like to book a device repair.",
      `Name: ${String(fields.get("customerName") || "")}`,
      `Phone: ${String(fields.get("phone") || "")}`,
      `Email: ${String(fields.get("email") || "Not provided")}`,
      `Device: ${String(fields.get("deviceType") || "")}`,
      `Model: ${String(fields.get("model") || "")}`,
      `Branch: ${String(fields.get("branch") || "")}`,
      `Issue: ${String(fields.get("issue") || "")}`,
    ].join("\n");
    window.location.assign(`https://wa.me/917829439076?text=${encodeURIComponent(message)}`);
  };
  return <><DrawerHeader title="Let's fix it." kicker="BOOK A REPAIR ON WHATSAPP" close={close} /><form className="drawer-form" onSubmit={submit}><label>Your name<input name="customerName" required minLength={2} placeholder="e.g. Priya S" /></label><div className="form-row"><label>Phone<input name="phone" required type="tel" placeholder="10-digit number" /></label><label>Email<input name="email" type="email" placeholder="you@email.com" /></label></div><div className="form-row"><label>Device<select name="deviceType"><option>Smartphone</option><option>Laptop</option><option>Tablet</option><option>Smartwatch</option></select></label><label>Branch<select name="branch"><option>RT Nagar</option><option>Yeshwanthpur</option><option>Ganganagar</option></select></label></div><label>Device model<input name="model" required placeholder="e.g. Samsung S22" /></label><label>What's wrong?<textarea name="issue" required placeholder="Screen, battery, charging, water damage…" rows={3} /></label><button className="market-primary full" type="submit">Continue to WhatsApp <ArrowRight size={16} /></button><p className="fine-print">Your repair details will be prepared in a WhatsApp message to +91 78294 39076.</p></form></>;
}function ProductDrawer({ product: p, saved = false, toggleSaved = () => undefined, addToCart, buyNow, close }: { product: Product; saved?: boolean; toggleSaved?: () => void; addToCart: (p: Product) => void; buyNow?: (p: Product) => void; close: () => void }) {
  const discount = p.was > p.price ? Math.round((1 - p.price / p.was) * 100) : 0;
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const getFocusable = () => dialog?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])') ?? [];
    dialog?.querySelector<HTMLElement>(".close-btn")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = getFocusable();
      if (!focusable.length) return;
      if (event.shiftKey && document.activeElement === focusable[0]) {
        event.preventDefault();
        focusable[focusable.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === focusable[focusable.length - 1]) {
        event.preventDefault();
        focusable[0].focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [close]);
const specs = p.spec.split(/[·•]/).map(value => value.trim()).filter(Boolean);
  const detailText = p.description || `A carefully selected ${p.name} in the listed ${specs.join(", ")} configuration. Review the condition and specifications above, then ask our Bengaluru team if you need help before reserving it.`;
  return <section ref={dialogRef} className="product-detail-view" role="dialog" aria-modal="true" aria-labelledby="product-detail-title" tabIndex={-1}>
    <header className="product-detail-header"><div className="product-detail-breadcrumb"><span>Shop</span><ChevronRight size={14} aria-hidden="true" /><span>{p.category}</span><ChevronRight size={14} aria-hidden="true" /><b>{p.name}</b></div><button className="close-btn" onClick={close} aria-label="Close product details"><X /></button></header>
    <div className="product-detail-layout">
      <div className={`product-detail-visual ${p.tone}`}><div className="product-visual-top"><span className="product-detail-category">{p.category}</span><button className={saved ? "detail-save saved" : "detail-save"} onClick={toggleSaved} aria-pressed={saved} aria-label={saved ? "Remove from saved items" : "Save this product"}><Heart size={18} fill={saved ? "currentColor" : "none"} /><span>{saved ? "Saved" : "Save"}</span></button></div><div className="product-photo-stage"><span className="product-detail-tag">{p.tag}</span><img src={p.image} alt={`${p.name}, ${p.spec}`} /><span className="product-image-count">Product photo</span></div><div className="product-visual-caption"><ShieldCheck size={15} aria-hidden="true" /><span>INSPECTED BEFORE LISTING</span><span>iConnect BLR / Bengaluru</span></div></div>
      <div className="product-detail-info"><div className="product-stock"><span className="stock-indicator" aria-hidden="true" />{p.stock}</div><span className="product-detail-eyebrow">PRE-OWNED DEVICE · CONDITION SHOWN IN LISTING</span><h2 id="product-detail-title">{p.name}</h2><p className="product-detail-spec">{p.spec}</p>
        <div className="product-detail-price"><div><small>iConnect price</small><strong>{money(p.price)}</strong></div>{p.was > p.price && <div className="product-detail-compare"><del>{money(p.was)}</del><span>Save {money(p.was - p.price)}</span></div>}</div>
        <p className="product-detail-description">{detailText}</p>
        <div className="product-spec-block"><h3>Device details</h3><dl>{specs.map((value, index) => <div key={`${value}-${index}`}><dt>{index === 0 ? "Configuration" : index === 1 ? "Finish / condition" : `Detail ${index + 1}`}</dt><dd>{value}</dd></div>)}<div><dt>Category</dt><dd>{p.category}</dd></div><div><dt>Availability</dt><dd>{p.stock}</dd></div></dl></div>
        <div className="product-detail-perks"><div><ShieldCheck size={19} aria-hidden="true" /><span><b>32-point quality check</b><small>Ask the store team to walk you through the inspection.</small></span></div><div><Store size={19} aria-hidden="true" /><span><b>See it in Bengaluru</b><small>Choose a branch and confirm stock before visiting.</small></span></div></div>
        <div className="product-detail-actions"><button className="market-primary full" onClick={() => { addToCart(p); close(); }}><ShoppingBag size={17} aria-hidden="true" /> Add to bag</button>{buyNow && <button className="product-buy-now" onClick={() => buyNow(p)}>Reserve this device <ArrowRight size={16} aria-hidden="true" /></button>}<button className="product-continue" onClick={close}>Continue browsing</button><small className="product-payment-note">No payment is taken until our team confirms availability and your pickup.</small></div>
      </div>
    </div>
  </section>;
}
function CheckoutDrawer({ cart, total, onPlaced, close }: { cart: Product[]; total: number; onPlaced: () => void; close: () => void }) {
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [branch, setBranch] = useState("RT Nagar");
  const placeOrder = trpc.checkout.placeOrder.useMutation();
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      const result = await placeOrder.mutateAsync({ customerName, phone, email, branch: branch as "RT Nagar" | "Yeshwanthpur" | "Ganganagar", items: cart.map(({ id, name, spec, price }) => ({ id, name, spec, price })) });
      setOrderNumber(result.orderNumber);
      onPlaced();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't save this order request. Please try again.");
    }
  };
  if (orderNumber) return <><DrawerHeader title="Request received" kicker="ORDER REQUEST SAVED" close={close} /><div className="order-confirmation"><div className="order-confirmation-icon"><Check size={24} /></div><p>Order reference</p><strong>{orderNumber}</strong><span>Your selected branch will confirm availability and the final amount before you pay. No payment has been taken.</span><button className="market-primary full" onClick={() => { close(); window.location.assign(`/track?order=${encodeURIComponent(orderNumber)}`); }}>Track this order <ArrowRight size={16} /></button></div></>;
  return <><DrawerHeader title="Checkout" kicker="BRANCH PICKUP REQUEST" close={close} /><div className="checkout-summary-list">{cart.map(item => <div key={item.id}><span>{item.name}<small>{item.spec}</small></span><b>{money(item.price)}</b></div>)}</div><div className="checkout-total"><span>Estimated total</span><b>{money(total)}</b></div><form className="drawer-form checkout-form" onSubmit={submit}><div className="checkout-callout"><BadgeCheck size={18} /><span><b>Pay at the store.</b> We'll confirm stock and the final amount before you travel. This request does not charge you.</span></div><label>Full name<input required minLength={2} maxLength={80} autoComplete="name" value={customerName} onChange={event => setCustomerName(event.target.value)} placeholder="Your name" /></label><label>Mobile number<input required type="tel" autoComplete="tel" value={phone} onChange={event => setPhone(event.target.value)} placeholder="Phone number for confirmation" /></label><label>Email <span className="optional-label">Optional</span><input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" /></label><label>Pickup branch<select value={branch} onChange={event => setBranch(event.target.value)}><option>RT Nagar</option><option>Yeshwanthpur</option><option>Ganganagar</option></select></label>{error && <p className="auth-message error" role="alert">{error}</p>}<button className="market-primary full" type="submit" disabled={placeOrder.isPending || cart.length === 0}>{placeOrder.isPending ? "Saving order request…" : "Place order request"} <ArrowRight size={16} /></button></form><p className="fine-print">Your order stays pending until the branch confirms it.</p></>;
}
function Success({ title, copy, close }: { title: string; copy: string; close: () => void }) { return <div className="success-state"><div className="success-icon"><Check /></div><h3>{title}</h3><p>{copy}</p><button className="market-primary" onClick={close}>Done</button></div>; }
export default App;


type DedicatedProps = { page: Page; darkMode: boolean; setDarkMode: (v: boolean) => void; goPage: (p: Page) => void; products: Product[]; filtered: Product[]; search: string; addToCart: (p: Product) => void; submitted: boolean; setSubmitted: (v: boolean) => void; saveManagedProduct: (product: Product) => Promise<void>; filter: string; setFilter: (filter: string) => void; sort: string; setSort: (sort: string) => void; saved: number[]; toggleSaved: (id: number) => void; cartCount: number; openCart: () => void };
function DedicatedPage({ page, darkMode, setDarkMode, goPage, products, filtered, search, addToCart, submitted, setSubmitted, saveManagedProduct, filter, setFilter, sort, setSort, saved, toggleSaved, cartCount, openCart }: DedicatedProps) {
  const title = page === "shop" ? "All mobiles, ready to move." : page === "sell" ? "Sell your mobile." : page === "repair" ? "Repair your mobile." : page === "track" ? "Track your order." : page === "auth" ? "Your iConnect account." : "Admin workspace.";
  return <div className={darkMode ? "market-shell editorial-dark dedicated-page" : "market-shell dedicated-page"}>
    <header className="dedicated-header"><button className="brand market-brand" onClick={() => goPage("home")}><span className="brand-mark"><span /></span><span>iconnect<span className="brand-dot">.</span>blr</span></button><div className="dedicated-header-actions"><button className="dedicated-back" onClick={() => goPage("home")}><ArrowLeft size={14} /> Back to home</button><button className="dedicated-bag" onClick={openCart} aria-label={`Open bag with ${cartCount} items`}><ShoppingBag size={17} /><span>Bag</span><b>{cartCount}</b></button><button className="dedicated-profile" onClick={() => goPage("auth")} aria-label="Open profile"><CircleUserRound size={18} /></button><button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle theme">{darkMode ? <Sun size={17} /> : <Moon size={17} />}</button></div></header>
    <main className={`dedicated-main${page === "auth" ? " auth-dedicated" : ""}`}>{page !== "auth" && <><div className="dedicated-kicker">{page === "admin" ? "PRIVATE OPERATIONS" : "ICONNECT BLR"}</div><h1>{title}</h1></>}{page === "track" && <TrackOrderPage />}{page === "shop" && <ShopPage products={products} filtered={filtered} search={search} addToCart={addToCart} filter={filter} setFilter={setFilter} sort={sort} setSort={setSort} saved={saved} toggleSaved={toggleSaved} />}{page === "sell" && <SellPage submitted={submitted} setSubmitted={setSubmitted} close={() => goPage("home")} />}{page === "repair" && <RepairPage close={() => goPage("home")} />}{page === "auth" && <AuthPage />}{page === "admin" && <AdminPage products={products} saveManagedProduct={saveManagedProduct} />}</main>
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation"><button className={page === "home" ? "active" : ""} onClick={() => goPage("home")}><House size={18} /><span>Home</span></button><button className={page === "shop" ? "active" : ""} onClick={() => goPage("shop")}><ShoppingBag size={18} /><span>Shop</span></button><button className={page === "sell" ? "active" : ""} onClick={() => goPage("sell")}><RotateCcw size={18} /><span>Sell</span></button><button className={page === "repair" ? "active" : ""} onClick={() => goPage("repair")}><Wrench size={18} /><span>Repair</span></button><button className={page === "admin" || page === "auth" ? "active" : ""} onClick={() => goPage("home")}><Store size={18} /><span>More</span></button></nav>
  </div>;
}
function ShopPage({ products, filtered, search, addToCart, filter, setFilter, sort, setSort, saved, toggleSaved }: { products: Product[]; filtered: Product[]; search: string; addToCart: (p: Product) => void; filter: string; setFilter: (filter: string) => void; sort: string; setSort: (sort: string) => void; saved: number[]; toggleSaved: (id: number) => void }) { const [selected, setSelected] = useState<Product | null>(null); return <><section className="dedicated-shop"><div className="dedicated-intro"><p>{search ? <>Showing results for <strong>“{search}”</strong>. </> : null}Every device is quality checked, clearly priced, and available for pickup at RT Nagar, Yeshwanthpur, or Ganganagar.</p><div><b>{filtered.length}</b><span>{search ? "matches" : "available now"}</span></div></div><div className="shop-toolbar"><div className="catalogue-tabs">{["All", "iPhone", "Samsung", "Android", "Laptops", "Tablets", "Wearables"].map(category => <button key={category} className={filter === category ? "active" : ""} onClick={() => setFilter(category)}>{category}</button>)}</div><label className="sort-wrap" htmlFor="shop-sort">Sort by <select id="shop-sort" value={sort} onChange={e => setSort(e.target.value)}><option>Recommended</option><option>Price: low to high</option><option>Price: high to low</option></select></label></div><div className="dedicated-product-grid">{filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} saved={saved.includes(p.id)} toggleSave={() => toggleSaved(p.id)} openProduct={setSelected} addToCart={addToCart} />)}</div>{filtered.length === 0 && <div className="catalogue-empty">No matching devices yet. <button onClick={() => setFilter("All")}>Clear filters</button></div>}</section><AnimatePresence>{selected && <motion.div className="drawer-backdrop product-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}><motion.aside className="drawer product-drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} onClick={e => e.stopPropagation()}><ProductDrawer product={selected} saved={saved.includes(selected.id)} toggleSaved={() => toggleSaved(selected.id)} addToCart={addToCart} buyNow={product => { addToCart(product); setSelected(null); }} close={() => setSelected(null)} /></motion.aside></motion.div>}</AnimatePresence></>; }
function SellPage({ submitted, setSubmitted, close }: { submitted: boolean; setSubmitted: (v: boolean) => void; close: () => void }) { return <section className="dedicated-form-page"><div className="form-page-copy"><span>01 / DEVICE INTAKE</span><p>Tell us what you have. Add photos, choose a branch, and our team will review it for a fair buy or exchange quote.</p><div className="form-page-points"><span>Transparent quote</span><span>Buy or exchange</span><span>RT Nagar / Yeshwanthpur / Ganganagar</span></div></div><div className="dedicated-form-card"><SellDrawer close={close} submitted={submitted} setSubmitted={setSubmitted} /></div></section>; }
function RepairPage({ close }: { close: () => void }) { return <section className="dedicated-form-page"><div className="form-page-copy"><span>02 / DEVICE INTAKE</span><p>Tell us what needs fixing and we’ll open WhatsApp with your details ready to send to the iConnect team.</p><div className="form-page-points"><span>Screen & battery</span><span>Laptop & tablet</span><span>RT Nagar / Yeshwanthpur / Ganganagar</span></div></div><div className="dedicated-form-card"><RepairDrawer close={close} /></div></section>; }function TrackOrderPage() {
  const params = new URLSearchParams(window.location.search);
  const [orderNumber, setOrderNumber] = useState(params.get("order") ?? "");
  const [phone, setPhone] = useState("");
  const [lookup, setLookup] = useState<{ orderNumber: string; phone: string } | null>(null);
  const order = trpc.checkout.lookup.useQuery(lookup ?? { orderNumber: "", phone: "" }, { enabled: Boolean(lookup), retry: false, refetchInterval: lookup ? 15000 : false });
  const statusLabel: Record<string, string> = { pending: "Awaiting branch confirmation", confirmed: "Confirmed by the branch", paid: "Payment received", ready: "Ready for pickup", completed: "Completed", cancelled: "Cancelled" };
  const submit = (event: React.FormEvent) => { event.preventDefault(); setLookup({ orderNumber: orderNumber.trim().toUpperCase(), phone }); };
  return <section className="track-order-page"><div className="track-order-intro"><PackageCheck size={26} /><div><h2>Order status, made simple.</h2><p>Enter your order reference and the phone number used at checkout.</p></div></div><form className="track-order-form" onSubmit={submit}><label>Order reference<input required minLength={8} maxLength={24} value={orderNumber} onChange={event => setOrderNumber(event.target.value)} placeholder="IC-XXXXXXXXXX" /></label><label>Mobile number<input required type="tel" value={phone} onChange={event => setPhone(event.target.value)} placeholder="Checkout phone number" /></label><button className="market-primary" type="submit" disabled={order.isFetching}>{order.isFetching ? "Checking…" : "Check order"} <ArrowRight size={16} /></button></form>{order.isError && <p className="auth-message error" role="alert">We couldn't check this order. Please try again in a moment.</p>}{order.data === null && <p className="order-lookup-status" role="status">No matching order found. Check the reference and phone number.</p>}{order.data && <article className="track-order-card"><div className="track-order-card-head"><div><small>ORDER REFERENCE</small><h3>{order.data.orderNumber}</h3></div><span className={`order-status-pill status-${order.data.status}`}>{statusLabel[order.data.status] ?? order.data.status}</span></div><p>{order.data.branch} pickup · placed {new Date(order.data.createdAt).toLocaleDateString("en-IN")}</p><div className="track-order-items">{order.data.items.map((item, index) => <div key={`${item.id}-${index}`}><span>{item.name}<small>{item.spec}</small></span><b>{money(item.price)}</b></div>)}</div><div className="track-order-total"><span>{order.data.status === "paid" ? "Payment received" : "Estimated total · pay at store"}</span><b>{money(order.data.total)}</b></div><small className="track-order-note">{order.data.status === "paid" ? "Your branch recorded the payment. Use this page to follow your order through pickup." : "No online payment was taken. Your branch will confirm availability and the final amount before pickup."}</small></article>}</section>;
}
function AuthPage() {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const signIn = trpc.auth.signIn.useMutation();
  const signUp = trpc.auth.signUp.useMutation();
  const busy = signIn.isPending || signUp.isPending;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (tab === "signup" && password !== confirmPassword) {
      setMessage({ text: "Those passwords don’t match yet.", error: true });
      return;
    }
    try {
      const result = tab === "signin" ? await signIn.mutateAsync({ email, password }) : await signUp.mutateAsync({ name, email, password });
      if (result.role === "admin") {
        window.location.assign("/admin");
        return;
      }
      setMessage({ text: tab === "signin" ? "You’re signed in. Welcome back." : "Your account is ready. You’re signed in.", error: false });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "Please check your details and try again.", error: true });
    }
  };
  const switchTab = (next: "signin" | "signup") => {
    setTab(next);
    setMessage(null);
  };

  return <section className="auth-page">
    <div className="auth-story">
      <span className="market-kicker">YOUR ICONNECT ACCOUNT</span>
      <h1>{tab === "signin" ? <>Good to see<br />you <em>again.</em></> : <>Make room for<br />your <em>next.</em></>}</h1>
      <p>{tab === "signin" ? "Sign in to continue with iConnect BLR." : "Create an account to get started with your next upgrade."}</p>
      <div className="auth-device-card"><div className="auth-device-top"><span>ICONNECT / BLR</span><span>DEVICE PICK 001</span></div><div className="auth-device-art"><span className="auth-device-halo" /><Smartphone size={82} strokeWidth={1.15} aria-hidden="true" /><Sparkles size={22} aria-hidden="true" /></div><div className="auth-device-foot"><b>Good phones.<br />Better stories.</b><span>BUILT FOR YOUR NEXT UPGRADE</span></div></div>
      <div className="auth-trust-row"><span><ShieldCheck size={16} aria-hidden="true" /> Quality-checked devices</span><span><Store size={16} aria-hidden="true" /> Bengaluru store support</span></div>
    </div>
    <form className="auth-card" onSubmit={submit}>
      <div className="auth-card-top"><span className="market-kicker">{tab === "signin" ? "ACCOUNT ACCESS" : "JOIN ICONNECT BLR"}</span><span className="auth-step">01 <i /> 02</span></div>
      <div className="auth-tabs" role="tablist" aria-label="Account access">
        <button id="signin-tab" type="button" role="tab" aria-selected={tab === "signin"} aria-controls="account-form" className={tab === "signin" ? "active" : ""} onClick={() => switchTab("signin")}>Sign in</button>
        <button id="signup-tab" type="button" role="tab" aria-selected={tab === "signup"} aria-controls="account-form" className={tab === "signup" ? "active" : ""} onClick={() => switchTab("signup")}>Create account</button>
      </div>
      <h2>{tab === "signin" ? "Welcome back." : "Let’s get you set up."}</h2>
      <p className="auth-intro">{tab === "signin" ? "Enter your details to access your account." : "A few details and you’re ready to go."}</p>
      <div id="account-form" role="tabpanel" aria-labelledby={tab === "signin" ? "signin-tab" : "signup-tab"}>
        {tab === "signup" && <label className="auth-field"><span>Full name</span><div className="auth-input-wrap"><CircleUserRound size={17} aria-hidden="true" /><input required autoComplete="name" minLength={2} maxLength={80} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Arjun Rao" /></div></label>}
        <label className="auth-field"><span>Email address</span><div className="auth-input-wrap"><Mail size={17} aria-hidden="true" /><input required type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" /></div></label>
        <label className="auth-field"><span>Password</span><div className="auth-input-wrap"><LockKeyhole size={17} aria-hidden="true" /><input required type={showPassword ? "text" : "password"} autoComplete={tab === "signin" ? "current-password" : "new-password"} minLength={7} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" /><button className="auth-password-toggle" type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
        {tab === "signup" && <label className="auth-field"><span>Confirm password</span><div className="auth-input-wrap"><LockKeyhole size={17} aria-hidden="true" /><input required type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={7} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Enter it one more time" /></div></label>}
      </div>
      <button className="market-primary full auth-submit" type="submit" disabled={busy}>{busy ? "Please wait…" : tab === "signin" ? "Sign in" : "Create my account"} <ArrowRight size={17} aria-hidden="true" /></button>
      {message && <p className={message.error ? "auth-message error" : "auth-message success"} role={message.error ? "alert" : "status"}>{message.text}</p>}
      <div className="auth-secure-note"><ShieldCheck size={15} aria-hidden="true" /><span>Your password is handled securely by iConnect BLR.</span></div>
    </form>
  </section>;
}

function AdminPage({ products, saveManagedProduct }: { products: Product[]; saveManagedProduct: (product: Product) => Promise<void> }) {
  const [branch, setBranch] = useState<"RT Nagar" | "Yeshwanthpur" | "Ganganagar">("RT Nagar");
  const [saved, setSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [videoError, setVideoError] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ name: "", spec: "", price: "", was: "", category: "iPhone", stock: "Ready to ship", image: "", description: "" });
  const aiDescription = trpc.ai.describeProduct.useMutation();
  const storeVideo = trpc.siteMedia.currentStoreVideo.useQuery(undefined, { retry: false });
  const uploadStoreVideo = trpc.siteMedia.uploadStoreVideo.useMutation();
  const ordersQuery = trpc.checkout.list.useQuery(undefined, { retry: false });
  const updateOrder = trpc.checkout.updateStatus.useMutation();
  const updateProduct = trpc.catalog.update.useMutation();
  const deleteProduct = trpc.catalog.delete.useMutation();
  const utils = trpc.useUtils();
  const update = (key: keyof typeof form, value: string) => setForm(f => ({ ...f, [key]: value }));
  const generateDescription = async () => {
    if (!form.name || !form.spec) return;
    setFormError("");
    try {
      const result = await aiDescription.mutateAsync({ name: form.name, spec: form.spec, category: form.category, branch });
      update("description", result.description);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not generate a description. Try again.");
    }
  };
  const readImage = (file?: File) => {
    if (!file) return;
    setFormError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFormError("Choose a JPEG, PNG, or WebP product image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Product images must be 5 MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update("image", String(reader.result));
    reader.onerror = () => setFormError("Could not read that image. Please choose another file.");
    reader.readAsDataURL(file);
  };
  const readVideo = (file?: File) => {
    if (!file) return;
    setVideoError("");
    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"] as const;
    if (!allowedTypes.includes(file.type as typeof allowedTypes[number])) {
      setVideoError("Choose an MP4, WebM, or MOV video.");
      return;
    }
    if (file.size > 24 * 1024 * 1024) {
      setVideoError("The video must be 24 MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await uploadStoreVideo.mutateAsync({ videoData: String(reader.result), contentType: file.type as "video/mp4" | "video/webm" | "video/quicktime", fileName: file.name });
        await storeVideo.refetch();
      } catch (error) {
        setVideoError(error instanceof Error ? error.message : "Could not upload the store video. Please try again.");
      }
    };
    reader.onerror = () => setVideoError("Could not read that video. Please choose another file.");
    reader.readAsDataURL(file);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    setFormError("");
    const product: Product = { id: 0, name: form.name.trim(), spec: form.spec.trim(), price: Number(form.price), was: Number(form.was || form.price), tag: branch, image: form.image || IMG.phones, category: form.category, tone: "mint", rating: "New", stock: form.stock, description: form.description.trim() };
    setPublishing(true);
    try {
      if (editingId !== null) {
        const imageData = product.image.startsWith("data:image/") ? product.image : undefined;
        await updateProduct.mutateAsync({ id: editingId, name: product.name, spec: product.spec, price: product.price, wasPrice: product.was, tag: product.tag, image: imageData ? undefined : product.image, imageData, category: product.category, stock: product.stock, description: product.description });
        await utils.catalog.list.invalidate();
      } else {
        await saveManagedProduct(product);
      }
      setSaveMessage(editingId === null ? "Product published to the shop." : "Product updated in the shop.");
      setSaved(true);
      setEditingId(null);
      setForm({ name: "", spec: "", price: "", was: "", category: "iPhone", stock: "Ready to ship", image: "", description: "" });
      window.setTimeout(() => setSaved(false), 3500);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not publish the product. Please try again.");
    } finally {
      setPublishing(false);
    }
  };
  const beginEdit = (product: Product) => {
    setEditingId(product.id);
    setBranch(product.tag === "RT Nagar" || product.tag === "Yeshwanthpur" || product.tag === "Ganganagar" ? product.tag : "RT Nagar");
    setForm({ name: product.name, spec: product.spec, price: String(product.price), was: String(product.was), category: product.category, stock: product.stock, image: product.image, description: product.description ?? "" });
    setSaved(false);
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const removeProduct = async (id: number) => {
    if (!window.confirm("Remove this product from the shop?")) return;
    setFormError("");
    try {
      await deleteProduct.mutateAsync({ id });
      await utils.catalog.list.invalidate();
      if (editingId === id) {
        setEditingId(null);
        setForm({ name: "", spec: "", price: "", was: "", category: "iPhone", stock: "Ready to ship", image: "", description: "" });
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not remove this product.");
    }
  };

  return <section className="admin-page"><div className="admin-toolbar"><div><span className="market-kicker">ADMIN OVERVIEW</span><h2>Shop administration</h2><small>Overview is open. Sign in to publish products, upload the store video, generate descriptions, and manage orders.</small></div><button type="button" onClick={() => window.location.assign("/login")}>Sign in for admin tools</button></div>
    <div className="admin-stats"><div><span>Products listed</span><b>{products.length}</b><small>Includes featured catalogue items</small></div><div><span>Active branch</span><b className="admin-stat-branch">{branch}</b><small>Choose a branch on each listing</small></div></div>
    <section className="admin-video-upload"><div><span className="market-kicker">HOMEPAGE FEATURE</span><h3>Store video</h3><p>Upload a short MP4, WebM, or MOV clip to replace the homepage video. Maximum 24 MB.</p>{storeVideo.data && <small>Current video: {storeVideo.data.fileName}</small>}</div><label className="admin-video-picker">{uploadStoreVideo.isPending ? "Uploading video…" : storeVideo.data ? "Replace video" : "Choose video"}<input type="file" accept="video/mp4,video/webm,video/quicktime" disabled={uploadStoreVideo.isPending} onChange={event => { readVideo(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label>{videoError && <p className="auth-message error" role="alert">{videoError}</p>}</section>
    <section className="admin-orders"><div className="admin-card-head"><div><span className="market-kicker">ORDER DESK</span><h3>Recent orders</h3></div><button type="button" onClick={() => void ordersQuery.refetch()} disabled={ordersQuery.isFetching}>{ordersQuery.isFetching ? "Refreshing…" : "Refresh"}</button></div>{ordersQuery.isError && <p className="auth-message error" role="alert">Couldn't load orders. Check the database connection.</p>}{ordersQuery.data?.length ? ordersQuery.data.map(order => <article className="admin-order-row" key={order.id}><div><b>{order.orderNumber}</b><span>{order.customerName} · {order.phone}</span><small>{order.items.map(item => item.name).join(", ")} · {order.branch}</small></div><strong>{money(order.total)}</strong><select aria-label={`Status for ${order.orderNumber}`} value={order.status} disabled={updateOrder.isPending} onChange={async event => { await updateOrder.mutateAsync({ id: order.id, status: event.target.value as typeof order.status }); await ordersQuery.refetch(); }}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="paid">Payment received</option><option value="ready">Ready for pickup</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></article>) : !ordersQuery.isLoading && <p className="admin-orders-empty">No order requests yet. New branch pickup requests will appear here.</p>}</section>
    <div className="admin-upload-grid"><form className="admin-upload-card" onSubmit={submit}>
      <div className="admin-card-head"><div><span className="market-kicker">{editingId === null ? "ADD TO SHOP" : "EDIT LISTING"}</span><h3>{editingId === null ? "New product" : "Edit product"}</h3></div><UploadCloud size={22} aria-hidden="true" /></div>
      <label>Product name<input required minLength={2} maxLength={120} value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g. iPhone 15 Pro" /></label>
      <label>Storage and condition<input required minLength={2} maxLength={240} value={form.spec} onChange={e => update("spec", e.target.value)} placeholder="256GB · Natural Titanium · Like new" /></label>
      <div className="form-row"><label>Sale price (₹)<input required type="number" min="1" value={form.price} onChange={e => update("price", e.target.value)} placeholder="54990" /></label><label>Compare-at price (₹)<input type="number" min="1" value={form.was} onChange={e => update("was", e.target.value)} placeholder="Same as sale price" /></label></div>
      <div className="form-row"><label>Category<select value={form.category} onChange={e => update("category", e.target.value)}><option>iPhone</option><option>Samsung</option><option>Android</option><option>Laptops</option><option>Tablets</option><option>Wearables</option></select></label><label>Store branch<select value={branch} onChange={e => setBranch(e.target.value as typeof branch)}><option>RT Nagar</option><option>Yeshwanthpur</option><option>Ganganagar</option></select></label></div>
      <label>Availability<select value={form.stock} onChange={e => update("stock", e.target.value)}><option>Ready to ship</option><option>Only 1 left</option><option>Pickup today</option></select></label>
      <label>Product description<textarea rows={4} maxLength={2000} value={form.description} onChange={e => update("description", e.target.value)} placeholder="Write a factual description or generate one from the details above." /></label>
      <button type="button" className="ai-description-btn" onClick={() => void generateDescription()} disabled={aiDescription.isPending || !form.name || !form.spec}>{aiDescription.isPending ? "Writing description…" : "Generate description with AI"}</button>
      <label>Product image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => readImage(e.target.files?.[0])} /><small>JPEG, PNG, or WebP. Maximum size: 5 MB.</small></label>
      <label>Or use an image URL<input type="url" value={form.image.startsWith("data:") ? "" : form.image} onChange={e => update("image", e.target.value)} placeholder="https://..." /></label>
      {formError && <p className="auth-message" role="alert">{formError}</p>}
      <button className="market-primary full" type="submit" disabled={publishing}>{publishing ? "Publishing…" : editingId !== null ? "Save product changes" : "Publish product"} <ArrowRight size={16} /></button>
      {editingId !== null && <button type="button" className="admin-cancel-edit" onClick={() => { setEditingId(null); setForm({ name: "", spec: "", price: "", was: "", category: "iPhone", stock: "Ready to ship", image: "", description: "" }); setFormError(""); }}>Cancel editing</button>}
      {saved && <div className="admin-saved" role="status"><Check size={15} aria-hidden="true" /> {saveMessage}</div>}
    </form><div className="admin-table admin-products-preview"><div className="admin-table-head"><b>Current catalogue</b><span>{products.filter(p => p.id > 0).length} products</span></div>{products.filter(p => p.id > 0).length === 0 ? <p className="admin-orders-empty">No admin-listed products yet.</p> : products.filter(p => p.id > 0).reverse().map(p => <div className="admin-row" key={`${p.tag}-${p.id}`}><span>{p.tag}</span><b>{p.name}</b><em>{money(p.price)}</em><small>{p.stock}</small><div className="admin-product-actions"><button type="button" onClick={() => beginEdit(p)}>Edit</button><button type="button" disabled={deleteProduct.isPending} onClick={() => void removeProduct(p.id)}>Delete</button></div></div>)}</div></div>
  </section>;
}
