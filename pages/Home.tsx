import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { Product } from "../types";
import { getReadableAddress } from "../services/location";
import { useNotify } from "../components/Notifications";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import Logo from "../components/Logo";
import Icon from "../components/Icon";
import WelcomePopup from "../components/WelcomePopup";
import MysteryBox from "../components/MysteryBox";
import SEO from "../components/SEO";
import { useTheme } from "../components/ThemeContext";
import { ProductSkeleton } from "../components/Skeletons";
import { CustomSectionEmbed } from "../components/CustomSectionEmbed";
import { OffersCarousel } from "../components/ui/offers-carousel";

import StoryViewer from "../components/ui/StoryViewer";
import { ProductCard } from "../components/ui/ProductCard";
import { HeroSlider } from "../components/ui/hero-slider";
import { LogoTimeline, type LogoItem } from "../components/ui/logo-timeline";
import { Tag } from "lucide-react";

const BrandIcon = ({ brandName }: { brandName: string }) => {
  const [error, setError] = useState(false);
  if (error) return <Tag className="size-5 opacity-70" />;
  const normalized = brandName.toLowerCase().replace(/\s+/g, "");
  return (
    <img
      src={`https://cdn.simpleicons.org/${normalized}/currentColor`}
      className="size-5 dark:invert"
      alt={brandName}
      onError={() => setError(true)}
    />
  );
};

const ThinBanner = ({ banner, navigate }: { banner: any; navigate: any }) => {
  const [showAdLabel, setShowAdLabel] = useState(false);

  useEffect(() => {
    let timeout: any;
    if (showAdLabel) {
      timeout = setTimeout(() => setShowAdLabel(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [showAdLabel]);

  if (!banner) return null;

  return (
    <div
      className="relative overflow-hidden rounded-full cursor-pointer hover-tilt w-full mb-14 border border-zinc-100 dark:border-zinc-800 shadow-sm"
      onClick={() => banner.link && navigate(banner.link)}
    >
      <img
        src={banner.imageUrl}
        alt="banner"
        className="w-full h-auto object-cover"
      />

      <div
        className="absolute top-3 right-3 z-20 flex items-center justify-end"
        onClick={(e) => {
          e.stopPropagation();
          setShowAdLabel(!showAdLabel);
        }}
      >
        <motion.div
          layout
          className="bg-zinc-900 dark:bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center text-white overflow-hidden shadow-lg border border-white/20"
          initial={{ borderRadius: 999 }}
        >
          <AnimatePresence mode="wait">
            {showAdLabel ? (
              <motion.span
                key="text"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="pl-3 pr-4 py-1.5 text-[10px] font-bold  tracking-normal whitespace-nowrap"
              >
                Sponsored Ad
              </motion.span>
            ) : (
              <motion.div
                key="icon"
                className="w-8 h-8 flex items-center justify-center font-serif text-sm font-bold"
              >
                i
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

const Home: React.FC<{ userData?: any }> = ({ userData }) => {
  const isAdmin = userData?.role === 'admin' || userData?.email === 'admin@vibe.shop';
  const { isDark, toggleTheme } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [activeBanner, setActiveBanner] = useState(0);
  const [activeFeatured, setActiveFeatured] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [locationName, setLocationName] = useState("Locating...");
  const [quickViewImg, setQuickViewImg] = useState<string | null>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<any[]>([]);

  const heroBanners = banners.filter(
    (b) => !b.bannerType || b.bannerType === "hero",
  );
  const popupBanners = banners.filter((b) => b.bannerType === "popup");
  const gifBanners = banners.filter((b) => b.bannerType === "gif");

  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem("f_search_history") || "[]");
      setSearchHistory(h);
    } catch (e) {}
  }, []);

  const saveSearchHistory = (query: string) => {
    if (!query.trim()) return;
    try {
      let history = JSON.parse(
        localStorage.getItem("f_search_history") || "[]",
      );
      history = [
        query.trim(),
        ...history.filter((h: string) => h !== query.trim()),
      ].slice(0, 5);
      localStorage.setItem("f_search_history", JSON.stringify(history));
      setSearchHistory(history);
    } catch (e) {}
  };
  const [timeLeft, setTimeLeft] = useState({
    y: 0,
    mo: 0,
    d: 0,
    h: 2,
    m: 45,
    s: 30,
  });
  const [showProof, setShowProof] = useState(false);
  const [proofData, setProofData] = useState({
    name: "Someone",
    item: "an item",
    location: "Dhaka",
  });

  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  const bannerContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: bannerContainerRef,
    offset: ["start end", "end start"],
    layoutEffect: false,
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const smoothY = useSpring(parallaxY, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001,
  });

  useEffect(() => {
    const qProds = query(collection(db, "products"));
    const unsubscribeProds = onSnapshot(
      qProds,
      (snapshot) => {
        setProducts(
          snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as Product,
          ),
        );
      },
      (err) => {
        console.warn("Products fetch error:", err.message);
      },
    );

    const qBanners = query(
      collection(db, "banners"),
      orderBy("createdAt", "desc"),
    );
    const unsubscribeBanners = onSnapshot(
      qBanners,
      (snapshot) => {
        setBanners(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (err) => {
        console.warn("Banners fetch error:", err.message);
      },
    );

    const unsubscribeSettings = onSnapshot(
      doc(db, "settings", "platform"),
      (snap) => {
        if (snap.exists()) setSettings(snap.data());
      },
    );

    const unsubscribeStories = onSnapshot(collection(db, "stories"), (snap) => {
      setStories(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    import("firebase/firestore").then(({ limit }) => {
      const qBlogs = query(
        collection(db, "blogs"),
        orderBy("createdAt", "desc"),
        limit(3),
      );
      onSnapshot(qBlogs, (snap) => {
        setRecentBlogs(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const address = await getReadableAddress(
            position.coords.latitude,
            position.coords.longitude,
          );
          setLocationName(address);
        },
        () => setLocationName("Dhaka, Bangladesh"),
      );
    }
    return () => {
      unsubscribeProds();
      unsubscribeBanners();
      unsubscribeSettings();
      unsubscribeStories();
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (settings?.dealEndTime) {
        const diff =
          new Date(settings.dealEndTime).getTime() - new Date().getTime();
        if (diff > 0) {
          const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
          const y = Math.floor(totalDays / 365);
          const mo = Math.floor((totalDays % 365) / 30);
          const d = (totalDays % 365) % 30;
          const h = Math.floor(
            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          );
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft({ y, mo, d, h, m, s });
        } else {
          setTimeLeft({ y: 0, mo: 0, d: 0, h: 0, m: 0, s: 0 });
        }
      } else {
        setTimeLeft({ y: 0, mo: 0, d: 0, h: 0, m: 0, s: 0 });
      }
    }, 1000);

    // Setup timer based on initial load
    return () => clearInterval(timer);
  }, [settings?.dealEndTime]);

  // Separate useEffect for the Social Proof logic so we always have the freshest products list
  useEffect(() => {
    const proofTimer = setInterval(() => {
      if (localStorage.getItem("hide_mock_purchases") === "true") return;

      const names = [
        "Karim",
        "Ayesha",
        "Mominul",
        "Nafis",
        "Tasnim",
        "Rahim",
        "Jamil",
        "Sadia",
        "Farid",
        "Imran",
        "Tarek",
        "Hasan",
        "Rakib",
        "Mehedi",
        "Sumaiya",
        "Anis",
        "Sabbir",
        "Arif",
        "Riyad",
        "Sanjida",
        "Rubel",
        "Nazmul",
      ];
      const locations = [
        "Dhaka",
        "Chittagong",
        "Sylhet",
        "Rajshahi",
        "Khulna",
        "Barisal",
        "Rangpur",
        "Mymensingh",
        "Comilla",
        "Gazipur",
        "Narayanganj",
        "Bogra",
      ];

      let randomItemTitle = "Premium Gadget";
      if (products.length > 0) {
        randomItemTitle =
          products[Math.floor(Math.random() * products.length)].name;
      } else {
        // Fallback just in case
        const fallbackItems = [
          "AirPods Pro",
          "MacBook Air",
          "iPhone 15",
          "Apple Watch",
        ];
        randomItemTitle =
          fallbackItems[Math.floor(Math.random() * fallbackItems.length)];
      }

      setProofData({
        name: names[Math.floor(Math.random() * names.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        item: randomItemTitle,
      });
      setShowProof(true);
      setTimeout(() => setShowProof(false), 8000);
    }, 15000);

    return () => clearInterval(proofTimer);
  }, [products]);

  useEffect(() => {
    if (!settings?.featuredCategory) return;
    const featuredProds = products.filter(
      (p) =>
        p.category.toLowerCase() === settings.featuredCategory.toLowerCase(),
    );
    if (featuredProds.length > 1) {
      const interval = setInterval(
        () => setActiveFeatured((prev) => (prev + 1) % featuredProds.length),
        4000,
      );
      return () => clearInterval(interval);
    }
  }, [products, settings?.featuredCategory]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }
    const results = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .slice(0, 5);
    setSearchResults(results);
  }, [searchQuery, products]);

  // Auto Slider for Hero Banners
  useEffect(() => {
    let heroBanners = [];
    if (banners && banners.length > 0) {
      heroBanners = banners;
    } else if (settings?.heroBanners && settings?.heroBanners.length > 0) {
      heroBanners = settings.heroBanners;
    } else {
      heroBanners = [
        {
          title: "Summer Collection",
          description: "Up to 50% off on all items",
          imageUrl:
            "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&auto=format&fit=crop&q=80",
          link: "",
        },
        {
          title: "New Tech Gadgets",
          description: "Discover the future today",
          imageUrl:
            "https://images.unsplash.com/photo-1542382257-80dedb725088?w=800&auto=format&fit=crop&q=80",
          link: "",
        },
      ];
    }

    if (heroBanners.length > 1) {
      const interval = setInterval(() => {
        setActiveBanner((prev) => (prev + 1) % heroBanners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners, settings?.heroBanners]);

  // Story progress logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const brandLogos = useMemo(() => {
    const uniqueBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))) as string[];
    // Fill with default ones if there are no products holding brands
    const defaultBrands = ["Apple", "Samsung", "Sony", "Dji", "Bose", "Anker", "Logitech", "Xiaomi", "Oppo", "Vivo", "Realme", "OnePlus"];
    const displayBrands = uniqueBrands.length >= 6 ? uniqueBrands : Array.from(new Set([...uniqueBrands, ...defaultBrands]));
    
    // Distribute nicely across 3 rows
    const numRows = 3;
    const itemsPerRow = Math.ceil(displayBrands.length / numRows);
    
    return displayBrands.map((brand, idx) => {
      const rowNum = (idx % numRows) + 1;
      const rowIndex = Math.floor(idx / numRows);
      
      return {
        label: brand,
        icon: <BrandIcon brandName={brand} />,
        row: rowNum,
        animationDelay: -(rowIndex * (50 / itemsPerRow)),
        animationDuration: 50,
      } as LogoItem;
    });
  }, [products]);

  const categories = [
    {
      name: "Mobile",
      image:
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=250&h=250&auto=format&fit=crop",
    },
    {
      name: "Accessories",
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=250&h=250&auto=format&fit=crop",
    },
    {
      name: "Gadgets",
      image:
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=250&h=250&auto=format&fit=crop",
    },
    {
      name: "Chargers",
      image:
        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=250&h=250&auto=format&fit=crop",
    },
  ];

  return (
    <div className="relative pt-0 pb-24 px-6 md:px-12 bg-zinc-50 dark:bg-zinc-800 max-w-[1440px] mx-auto min-h-screen font-inter">
      <SEO
        title="Home"
        description="VibeGadget - Premium Tech Hub for Mobile, Accessories, and Gadgets in Bangladesh"
        keywords="vibegadget, gadgets, mobile, accessories, apple, iphone, tech, bd"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "VibeGadget",
          url: "https://vibegadget.com",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://vibegadget.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <WelcomePopup banners={popupBanners} />
      <CustomSectionEmbed location="home_top" />



      {/* Stories Section */}
      <div className="mb-8 w-full">
        <StoryViewer stories={stories} isAdmin={isAdmin} />
      </div>

      {heroBanners.length > 0 && (
        <motion.div
           ref={bannerContainerRef}
           className="relative mb-14 -mx-6 md:mx-0 md:rounded-2xl overflow-hidden shadow-sm z-10 animate-stagger-2 group h-[280px] md:h-[400px] lg:h-[480px]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBanner}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center bg-zinc-100 dark:bg-zinc-900"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/90 via-zinc-900/50 to-transparent z-10 hidden dark:block"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent z-10 dark:hidden"></div>

              <img
                src={heroBanners[activeBanner]?.imageUrl}
                className="absolute inset-0 w-full h-full object-cover origin-center opacity-80 mix-blend-multiply dark:mix-blend-normal"
                alt=""
              />

              <div className="relative z-20 p-8 md:p-16 max-w-2xl h-full flex flex-col justify-center">
                <motion.span 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.3 }}
                   className="inline-block px-4 py-1.5 bg-primary-500 text-white rounded-full text-[10px] font-bold tracking-wide uppercase mb-6 w-max "
                >
                  Featured Collection
                </motion.span>
                <motion.h2 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.4 }}
                   className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight text-zinc-900 dark:text-zinc-100"
                >
                  {heroBanners[activeBanner]?.title}
                </motion.h2>
                <motion.p 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.5 }}
                   className="text-sm md:text-base font-medium text-zinc-600 dark:text-zinc-300 mb-8 max-w-md line-clamp-2"
                >
                  {heroBanners[activeBanner]?.description}
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  onClick={() => heroBanners[activeBanner]?.link && navigate(heroBanners[activeBanner].link)}
                  className="px-8 py-4 bg-primary-500 text-white rounded-2xl font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center gap-3 w-max "
                >
                  <span>Shop Now</span>
                  <Icon name="arrow-right" className="text-xs" />
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>

        </motion.div>
      )}

      {settings?.featuredCategory &&
        products.filter(
          (p) =>
            p.category.toLowerCase() ===
            settings.featuredCategory.toLowerCase(),
        ).length > 0 && (
          <div className="mb-10 md:mb-14">
            <div className="relative w-full h-[280px] sm:h-[300px] md:h-[340px] lg:h-[380px] rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 group">
              <div
                className="flex transition-transform duration-1000 ease-[cubic-bezier(0.23, 1, 0.32, 1)] h-full"
                style={{ transform: `translateX(-${activeFeatured * 100}%)` }}
              >
                {products
                  .filter(
                    (p) =>
                      p.category.toLowerCase() ===
                      settings.featuredCategory.toLowerCase(),
                  )
                  .map((product, i) => (
                    <div
                      key={product.id}
                      className="min-w-full h-full relative grid grid-cols-5 items-center"
                    >
                      <div className="col-span-2 md:col-span-3 h-full relative bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center p-6 overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-200/50 via-zinc-100/10 to-zinc-50/0 dark:from-zinc-700/50 dark:via-zinc-800/10 dark:to-zinc-900/0 mix-blend-multiply dark:mix-blend-normal"></div>
                        <img
                          src={product.image}
                          className="w-full h-[80%] object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-[1.1] transition-transform duration-1000 relative z-10 "
                          alt={product.name}
                        />
                      </div>
                      <div className="col-span-3 md:col-span-2 p-6 md:p-10 flex flex-col justify-center h-full bg-primary-500 text-white relative">
                        <div className="absolute top-0 right-0 p-4 md:p-6">
                          <span className="px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-emerald-300 dark:bg-zinc-900/10 dark:text-black rounded-full text-[9px] font-semibold  tracking-normal backdrop-blur-md whitespace-nowrap border border-emerald-900/50 dark:border-zinc-900/20">
                            Featured
                          </span>
                        </div>
                        <h4 className="text-lg md:text-lg lg:text-xl font-semibold mb-2 tracking-tight truncate w-full pr-4">
                          {product.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mb-6 md:mb-8 truncate w-full">
                          <p className="text-xl md:text-xl font-semibold text-zinc-800 dark:text-zinc-200">
                            ৳
                            {product.isOffer && product.offerPrice
                              ? product.offerPrice
                              : product.price}
                          </p>
                          {product.isOffer && (
                            <p className="text-xs md:text-sm text-zinc-500 font-bold line-through">
                              ৳{product.price}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="mt-2 px-6 md:px-8 py-3 md:py-4 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 dark:text-white font-semibold  tracking-normal text-[10px] md:text-xs rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors self-start shadow-sm shadow-black/10 active:scale-95 flex items-center whitespace-nowrap"
                        >
                          Shop Now{" "}
                          <Icon
                            name="arrow-right"
                            className="ml-3 text-[10px]"
                          />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

      {products.length > 0 && (
        <div className="mb-10 md:mb-14">
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Trending Products
            </h2>
          </div>
          <HeroSlider
            autoSlideDelay={3000}
            pauseDurationAfterInteract={10000}
            cards={products.map((p) => ({
              id: p.id,
              title: p.name,
              description: p.description || "Discover the best gadgets at VibeGadget.",
              category: p.category,
              image: p.image,
              date: p.isOffer && p.offerPrice ? `৳${p.offerPrice}` : `৳${p.price}`,
              actionText: "Buy Now"
            }))}
          />
        </div>
      )}

      <div className="mb-10 md:mb-16 lg:hidden">
        <h1 className="text-lg md:text-lg lg:text-xl xl:text-lg font-semibold font-outfit tracking-tight text-zinc-900 dark:text-zinc-100 leading-[1.1] mb-2 animate-fade-in">
          Find your perfect <br />
          <span className="text-gradient">Vibe Gadget.</span>
        </h1>

        <div
          ref={searchRef}
          className="relative w-full max-w-md mt-6 lg:mt-0 lg:mb-8 z-10 hover-lift"
        >
          <div
            className={`relative flex items-center bg-zinc-50 dark:bg-zinc-800 rounded-full border transition-all ${isSearchFocused ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-zinc-50 dark:bg-zinc-800" : "border-zinc-200 dark:border-zinc-700"}`}
          >
            <Icon name="search" className="absolute left-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search for iPhones, AirPods, accessories..."
              className="w-full bg-transparent py-4 pl-12 pr-12 outline-none text-sm font-semibold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  saveSearchHistory(searchQuery);
                  navigate("/search");
                }
              }}
            />
            <button className="absolute right-4 text-zinc-900 dark:text-zinc-100 hover:text-emerald-700 transition-colors">
              <Icon name="microphone" />
            </button>
          </div>

          <AnimatePresence>
            {isSearchFocused &&
              (searchQuery.trim() !== "" || searchHistory.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 w-full bg-zinc-50 dark:bg-zinc-800 rounded-full shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden"
                >
                  {searchQuery.trim() === "" && searchHistory.length > 0 ? (
                    <div className="p-2">
                      <p className="text-[10px] font-bold  tracking-normal text-zinc-400 px-3 py-2">
                        Recent Searches
                      </p>
                      {searchHistory.map((h, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSearchQuery(h);
                            setIsSearchFocused(false);
                            saveSearchHistory(h);
                            navigate("/search");
                          }}
                          className="w-full flex items-center p-3 hover:bg-zinc-50 dark:bg-zinc-800 rounded-2xl transition-colors text-left"
                        >
                          <Icon
                            name="history"
                            className="text-zinc-400 mr-3 text-xs"
                          />
                          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            {h}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="flex items-center space-x-4 px-5 py-3 hover:bg-zinc-50 dark:bg-zinc-800 cursor-pointer transition-colors"
                        >
                          <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-100 dark:border-zinc-800 flex-shrink-0 p-1">
                            <img
                              src={product.image}
                              className="w-full h-full object-contain"
                              alt={product.name}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs truncate text-zinc-900 dark:text-zinc-100">
                              {product.name}
                            </h4>
                            <p className="text-[10px] text-zinc-400 font-bold  tracking-normal mt-1">
                              ৳{product.price}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div className="px-3 pt-2 pb-1 border-t border-zinc-50">
                        <button
                          onClick={() => navigate("/search")}
                          className="w-full py-2 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-100 hover:text-white rounded-full text-[10px] font-bold  tracking-normal text-zinc-600 dark:text-zinc-400 transition-colors"
                        >
                          View All Results
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-sm font-semibold text-zinc-500">
                      No products found for "{searchQuery}"
                    </div>
                  )}
                </motion.div>
              )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search Output above */}

      {/* Limited Time Deals */}
      {products.some((p) => p.isOffer) && (
        <div className="mb-10 w-full animate-fade-in">
          <OffersCarousel
            offerTitle="Flat 25% off on products"
            offerSubtitle="Code pre-applied for you! Explore our flash sale today."
            ctaText="View all deals"
            onCtaClick={() => navigate("/all-products?filter=offer")}
            onItemClick={(item) => navigate(`/product/${item.id}`)}
            items={products.filter((p) => p.isOffer).map(p => ({
              id: p.id,
              imageUrl: p.images?.[0] || p.image || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80",
              title: p.name,
              subtitle: p.description || p.category,
              rating: p.rating || 0,
              price: p.price,
              originalPrice: (p as any).originalPrice || Math.round(p.price * 1.25),
              discountPercentage: (p as any).originalPrice ? Math.round((((p as any).originalPrice - p.price) / (p as any).originalPrice) * 100) : 25
            }))}
          />
        </div>
      )}

      {/* Partner & Earn Cash */}
      <div
        className="mb-10 w-full animate-fade-in group cursor-pointer"
        onClick={() => navigate("/affiliate")}
      >
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between border border-emerald-200 dark:border-emerald-800/50 transition-all hover:shadow-lg relative overflow-hidden">
          <div className="flex items-center flex-col md:flex-row gap-5 mb-6 md:mb-0 md:mr-8 w-full z-10">
            <div className="text-center md:text-left flex-1">
              <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-50 tracking-tight mb-2">
                Partner & Earn Cash 💸
              </h3>
              <p className="text-emerald-700 dark:text-emerald-200/80 text-sm font-medium">
                Share your referral link and earn up to{" "}
                <span className="font-bold text-emerald-600 dark:text-emerald-300">
                  ৳200 commission
                </span>{" "}
                per successful sale.
              </p>
            </div>
          </div>
          <button className="w-full md:w-auto bg-emerald-600 text-white px-8 py-3.5 rounded-full text-sm font-bold transition-all active:scale-95 whitespace-nowrap hover:bg-emerald-700 z-10 shadow-sm block text-center">
            Start Earning
          </button>
        </div>
      </div>

      {/* Latest Blog */}
      {recentBlogs && recentBlogs.length > 0 && (
        <div 
          className="mb-10 w-full animate-fade-in group cursor-pointer"
          onClick={() => navigate(`/blog/${recentBlogs[0]?.slug}`)}
        >
          <div className="bg-zinc-900 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row-reverse items-center justify-between shadow-2xl relative overflow-hidden group-hover:bg-black transition-colors">
            <div className="w-full md:w-1/3 mb-6 md:mb-0 z-10">
               <img 
                 src={recentBlogs[0]?.image || recentBlogs[0]?.imageUrl || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80"} 
                 alt="Blog" 
                 className="w-full h-32 md:h-40 object-cover rounded-2xl border border-zinc-800" 
               />
            </div>
            <div className="flex-1 text-center md:text-left z-10 md:pr-8">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 block">Latest Story</span>
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-3">
                {recentBlogs[0]?.title || "Insights from our Team"}
              </h3>
              <p className="text-zinc-400 text-sm font-medium max-w-md">
                Read our latest stories, updates, and insights.
              </p>
            </div>
          </div>
        </div>
      )}

      {gifBanners.length > 0 && (
        <ThinBanner banner={gifBanners[0]} navigate={navigate} />
      )}

      <div className="animate-stagger-3 relative z-10">
        <div className="flex justify-between items-end mb-10 px-2">
          <div>
            <h3 className="text-[10px] font-bold  tracking-normal text-zinc-900 dark:text-zinc-100 mb-2 px-3 py-1 bg-zinc-50 dark:bg-zinc-900 rounded-full inline-block border border-zinc-200 shadow-sm backdrop-blur-md">
              Our Collection
            </h3>
            <h2 className="text-lg md:text-xl font-semibold tracking-tight text-shine mt-4">
              New Arrivals.
            </h2>
          </div>
          <button
            onClick={() => navigate("/all-products")}
            className="text-[10px] font-bold  tracking-normal bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-2.5 rounded-full hover:bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 dark:hover:bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:text-white dark:hover:text-white transition-colors flex items-center shadow-lg active:scale-95 group hover-tilt"
          >
            View All{" "}
            <Icon
              name="arrow-right"
              className="ml-2 text-[8px] group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 lg:gap-8">
          {products.length === 0
            ? Array(12)
                .fill(0)
                .map((_, i) => <ProductSkeleton key={i} />)
            : products
                .filter(
                  (p) =>
                    activeCategory === "All" || p.category === activeCategory,
                )
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
        </div>
      </div>

      {gifBanners.length > 1 && (
        <ThinBanner banner={gifBanners[1]} navigate={navigate} />
      )}

      <AnimatePresence>
        {quickViewImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-900 dark:bg-zinc-100/50 backdrop-blur-xl z-[1000] flex items-center justify-center p-6"
            onClick={() => setQuickViewImg(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xl aspect-square bg-zinc-50 dark:bg-zinc-800 rounded-2xl shadow-sm p-10 flex items-center justify-center border border-zinc-100 dark:border-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setQuickViewImg(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center hover:bg-zinc-900 dark:bg-zinc-100 hover:text-white transition-all"
              >
                <Icon name="times" className="text-xs" />
              </button>
              <img
                src={quickViewImg}
                className="max-w-full max-h-full object-contain"
                alt="Preview"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Social Proof Popup */}
      <AnimatePresence>
        {showProof && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 left-6 z-[100] bg-zinc-50 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-100 dark:border-zinc-800 shadow-sm rounded-2xl p-4 max-w-[280px]"
          >
            <button
              onClick={() => setShowProof(false)}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-zinc-400 hover:text-black dark:text-white hover:bg-zinc-200 transition-all"
            >
              <Icon name="times" className="text-[10px]" />
            </button>
            <div className="flex items-center space-x-4 mb-2 pr-4">
              <div className="bg-emerald-100 text-zinc-800 dark:text-zinc-200 w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner">
                <Icon name="check-circle" className="text-sm" />
              </div>
              <div>
                <p className="text-[11px] text-zinc-500 font-medium leading-tight mb-1">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {proofData.name}
                  </span>{" "}
                  from{" "}
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {proofData.location}
                  </span>{" "}
                  just bought
                </p>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate tracking-tight">
                  {proofData.item}
                </p>
                <p className="text-[9px] text-zinc-400 mt-0.5  tracking-normal font-bold">
                  Just now
                </p>
              </div>
            </div>
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2 mt-1">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-3 h-3 text-zinc-800 dark:text-zinc-200 rounded focus:ring-emerald-500 border-zinc-300"
                  onChange={(e) => {
                    if (e.target.checked) {
                      localStorage.setItem("hide_mock_purchases", "true");
                      setShowProof(false);
                    }
                  }}
                />
                <span className="text-[9px] font-bold text-zinc-400  tracking-normal group-hover:text-zinc-600 dark:text-zinc-400 transition-colors">
                  Do not show again
                </span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {gifBanners.length > 2 && (
        <ThinBanner banner={gifBanners[2]} navigate={navigate} />
      )}

      {brandLogos.length > 0 && (
        <LogoTimeline
          items={brandLogos}
          title="Top Brands"
          height="h-[250px] md:h-[300px]"
          iconSize={24}
        />
      )}

      {gifBanners.length > 3 && (
        <ThinBanner banner={gifBanners[3]} navigate={navigate} />
      )}
      {gifBanners.length > 4 && (
        <ThinBanner banner={gifBanners[4]} navigate={navigate} />
      )}

      <CustomSectionEmbed location="home_bottom" />
    </div>
  );
};

export default Home;
