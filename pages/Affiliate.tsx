import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import { UserProfile, AffiliateLog } from "../types";
import { AffiliateOnboardingForm, AffiliateFormData } from "../components/AffiliateOnboardingForm";
import Icon from "../components/Icon";
import { useNotify } from "../components/Notifications";
import {
  sendAffiliateRequestToTelegram,
  sendCreatorVideoToTelegram,
} from "../services/telegram";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "../components/ThemeContext";
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, TrendingUp, Eye, RefreshCw, ArrowDown, ArrowUp, ArrowLeftRight, Clock, Bitcoin, Link as LinkIcon, Gift } from "lucide-react"

const CreatorHub: React.FC<{ userData: UserProfile }> = ({ userData }) => {
  const notify = useNotify();
  const [platform, setPlatform] = useState("youtube");
  const [videoUrl, setVideoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "creator_videos"),
      where("userId", "==", userData.uid),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const v: any[] = [];
      snapshot.forEach((d) => v.push({ id: d.id, ...d.data() }));
      setHistory(v);
    });
    return () => unsub();
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) return notify("Please enter the video URL", "error");

    setSubmitting(true);
    let reward = 0;
    if (platform === "youtube") reward = 100;
    if (platform === "facebook") reward = 150;
    if (platform === "tiktok") reward = 200;

    try {
      const data = {
        userId: userData.uid,
        userName: userData.displayName || "Unknown",
        userCode: userData.affiliateCode || "",
        platform,
        videoUrl,
        rewardAmount: reward,
        status: "pending",
        createdAt: Date.now(),
      };
      await addDoc(collection(db, "creator_videos"), data);

      // Send to Telegram
      await sendCreatorVideoToTelegram(data);

      notify("Video submitted for review successfully!", "success");
      setVideoUrl("");
    } catch (err) {
      console.error(err);
      notify("Failed to submit video", "error");
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-semibold tracking-tight mb-4 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
          <Icon name="video" className="text-zinc-500" /> Content Creator Hub
        </h2>
        <div className="bg-zinc-50 dark:bg-[#121212] p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 mb-6">
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-3">
            Rules & Guidelines
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-400 text-sm">
            <li>
              <strong>YouTube:</strong> Minimum 1000 views to get ৳100.
            </li>
            <li>
              <strong>Facebook:</strong> Minimum 1000 views to get ৳150.
            </li>
            <li>
              <strong>TikTok:</strong> Minimum 5000 views to get ৳200.
            </li>
            <li>
              Video must explicitly mention that{" "}
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                Vibe Gadget
              </span>{" "}
              is sponsoring the video.
            </li>
            <li>
              Description must include our website link:{" "}
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                https://www.vibegadgets.shop
              </span>
            </li>
            <li>
              You must talk about Vibe Gadget products & features for at least{" "}
              <strong>1 minute</strong>.
            </li>
            <li>
              No limit! You can submit an unlimited number of videos as long as
              they meet the target.
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Social Media Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-[#121212] px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 block text-sm font-medium outline-none"
            >
              <option value="youtube">YouTube (Min 1000 views - ৳100)</option>
              <option value="facebook">Facebook (Min 1000 views - ৳150)</option>
              <option value="tiktok">TikTok (Min 5000 views - ৳200)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Video URL
            </label>
            <input
              type="url"
              required
              placeholder="https://..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-[#121212] px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 block text-sm font-medium outline-none"
            />
          </div>
          <button
            disabled={submitting}
            type="submit"
            className="w-full py-4 bg-primary-500 text-white rounded-full font-semibold text-sm transition-transform active:scale-[0.98] disabled:opacity-50 hover:scale-[1.02] "
          >
            {submitting ? "Submitting..." : "Submit Video for Review"}
          </button>
        </form>
      </div>

      {history.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold mb-4">Submission History</h3>
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 gap-3"
              >
                <div className="truncate">
                  <span className="text-[10px]  font-bold text-zinc-500 tracking-wider block mb-0.5">
                    {item.platform}
                  </span>
                  <a
                    href={item.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-blue-500 hover:underline truncate block"
                  >
                    {item.videoUrl}
                  </a>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 dark:text-zinc-800 dark:text-zinc-200">
                    ৳{item.rewardAmount}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold  ${item.status === "pending" ? "bg-amber-100 text-amber-700" : item.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AffiliatePage: React.FC<{ userData: UserProfile | null }> = ({
  userData,
}) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const { isDark, toggleTheme } = useTheme();
  const [logs, setLogs] = useState<AffiliateLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCopying, setIsCopying] = useState(false);

  const [isEditingCode, setIsEditingCode] = useState(false);
  const [tempCode, setTempCode] = useState("");
  const [savingCode, setSavingCode] = useState(false);
  const [configs, setConfigs] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "creator_hub">(
    "dashboard",
  );

  useEffect(() => {
    getDoc(doc(db, "settings", "platform")).then((snap) => {
      if (snap.exists()) setConfigs(snap.data());
    });
  }, []);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    socialUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!userData) {
      if (!auth.currentUser) navigate("/auth-selector");
      return;
    }
    setTempCode(userData.affiliateCode || "");

    if (userData.isAffiliate) {
      const unsub = onSnapshot(
        query(
          collection(db, "affiliates_log"),
          where("affiliateId", "==", userData.uid),
          orderBy("createdAt", "desc"),
        ),
        (snapshot) => {
          const l: AffiliateLog[] = [];
          snapshot.forEach((doc) =>
            l.push({ id: doc.id, ...doc.data() } as AffiliateLog),
          );
          setLogs(l);
          setLoading(false);
        },
      );
      return () => unsub();
    } else {
      setLoading(false);
    }
  }, [userData, navigate]);

  if (loading || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon
          name="spinner-third"
          className="animate-spin text-lg text-zinc-900"
        />
      </div>
    );
  }

  const handleApplyAffiliate = async (formData: AffiliateFormData) => {
    setSubmitting(true);
    try {
      const requestData = {
        userId: auth.currentUser!.uid,
        email: userData.email,
        displayName: userData.displayName,
        fullName: formData.fullName,
        phone: formData.phone,
        socialUrl: formData.socialUrl,
        platform: formData.platform,
        followerCount: formData.followerCount,
        promotionMethod: formData.promotionMethod,
        additionalInfo: formData.additionalInfo,
        status: "pending",
        createdAt: Date.now(),
      };
      await addDoc(collection(db, "affiliate_requests"), requestData);

      await updateDoc(doc(db, "users", auth.currentUser!.uid), {
        affiliateStatus: "pending",
      });

      await sendAffiliateRequestToTelegram(requestData);

      notify("Application submitted successfully!", "success");
    } catch (e) {
      notify("Error submitting application", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!userData.isAffiliate) {
    if (userData.affiliateStatus === "pending") {
      return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#121212] p-6 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl shadow-sm max-w-sm w-full mx-auto"
          >
            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="clock" className="text-lg" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight">
              Application Reviewing
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-8">
              We are reviewing your affiliate application. This usually takes
              24-48 hours. We'll update you soon.
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="w-full py-3.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm"
            >
              Back to Profile
            </button>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background text-foreground font-sans relative overflow-hidden p-6 lg:p-12 pb-32 flex flex-col items-center justify-center">
          <div aria-hidden className="fixed inset-0 isolate contain-strict -z-10 opacity-30 dark:opacity-60 pointer-events-none">
              <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(0,0,0,0.06)_0,rgba(0,0,0,0.02)_50%,rgba(0,0,0,0.01)_80%)] dark:bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(255,255,255,0.06)_0,rgba(255,255,255,0.02)_50%,rgba(255,255,255,0.01)_80%)] absolute top-0 right-0 h-[800px] w-[560px] -translate-y-[350px] rounded-full" />
              <div className="bg-[radial-gradient(50%_50%_at_50%_50%,rgba(0,0,0,0.04)_0,rgba(0,0,0,0.01)_80%,transparent_100%)] dark:bg-[radial-gradient(50%_50%_at_50%_50%,rgba(255,255,255,0.04)_0,rgba(255,255,255,0.01)_80%,transparent_100%)] absolute top-0 right-0 h-[800px] w-[240px] translate-x-[5%] translate-y-[-50%] rounded-full" />
          </div>
        <div className="max-w-2xl w-full relative z-10">
          <div className="flex items-center justify-between mb-8 px-1">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/profile")}
                className="w-10 h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-full transition-colors group"
              >
                <Icon
                  name="arrow-left"
                  className="text-xs group-hover:-translate-x-1 transition-transform text-zinc-900 dark:text-zinc-100"
                />
              </button>
              <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Partner Program
              </h1>
            </div>


          </div>

          <div className="mb-10 text-center md:text-left">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight mb-3">
              Partner & Earn
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed max-w-xl">
              Join our exclusive network. Share your custom promo code to give
              your audience 5% OFF, and earn up to{" "}
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                ৳200 commission
              </span>{" "}
              for every successful sale directly to your wallet based on your
              tier!
            </p>
          </div>

          <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-6 flex flex-col items-start gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight">
                  5% Flat Discount
                </h3>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                  Your audience gets a flat discount on every purchase using
                  your code.
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 flex flex-col items-start gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight">
                  Tiered Commission
                </h3>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                  The more you sell, the more you earn. Reach higher tiers for
                  up to ৳200 per sale.
                </p>
              </div>
            </div>
          </div>

          <AffiliateOnboardingForm
            initialData={{
              fullName: formData.fullName,
              phone: formData.phone,
              email: userData.email || "",
            }}
            onSubmit={handleApplyAffiliate}
            isSubmitting={submitting}
          />
        </div>
      </div>
    );
  }

  const getConfigVal = (key: string, fallback: number) =>
    configs?.[key] ?? fallback;

  const minWithdrawal = getConfigVal("affiliateMinWithdrawal", 50);
  const t1Limit = getConfigVal("affiliateTier1Threshold", 3);
  const t1Comm = getConfigVal("affiliateTier1Commission", 50);
  const t2Limit = getConfigVal("affiliateTier2Threshold", 10);
  const t2Comm = getConfigVal("affiliateTier2Commission", 100);
  const t3Limit = getConfigVal("affiliateTier3Threshold", 20);
  const t3Comm = getConfigVal("affiliateTier3Commission", 150);
  const t4Limit = getConfigVal("affiliateTier4Threshold", 30);
  const t4Comm = getConfigVal("affiliateTier4Commission", 200);

  const salesCount = logs.length;

  let currentTier = 1;
  let currentTarget = t1Limit;
  let prevTarget = 0;
  let currentCommission = t1Comm;
  let nextCommission = t2Comm;

  if (salesCount >= t3Limit) {
    currentTier = 4;
    prevTarget = t3Limit;
    currentTarget = t4Limit;
    currentCommission = t4Comm;
    nextCommission = t4Comm;
  } else if (salesCount >= t2Limit) {
    currentTier = 3;
    prevTarget = t2Limit;
    currentTarget = t3Limit;
    currentCommission = t3Comm;
    nextCommission = t4Comm;
  } else if (salesCount >= t1Limit) {
    currentTier = 2;
    prevTarget = t1Limit;
    currentTarget = t2Limit;
    currentCommission = t2Comm;
    nextCommission = t3Comm;
  }

  let progressPercent = 0;
  if (currentTier === 4 && salesCount >= t4Limit) {
    progressPercent = 100;
  } else {
    progressPercent = Math.min(
      100,
      Math.max(
        0,
        ((salesCount - prevTarget) / (currentTarget - prevTarget)) * 100,
      ),
    );
  }

  const affiliateCode =
    userData.affiliateCode ||
    `AFF-${userData.uid.substring(0, 6).toUpperCase()}`;
  const shareLink = `${window.location.origin}/?ref=${affiliateCode}`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopying(true);
      notify("Copied!", "success");
      setTimeout(() => setIsCopying(false), 2000);
    } catch (err) {
      notify("Failed to copy", "error");
    }
  };

  const handleSaveCode = async () => {
    let userCode = tempCode.trim().toUpperCase();
    if (!userCode || userCode.length < 3)
      return notify("Code must be at least 3 characters", "error");
    if (!/^[A-Z0-9_-]+$/.test(userCode))
      return notify(
        "Only letters, numbers, hyphens and underscores allowed",
        "error",
      );

    const code = userCode;

    const reservedWords = [
      "TEST",
      "USER",
      "ADMIN",
      "SYSTEM",
      "DEFAULT",
      "PROMO",
      "DISCOUNT",
    ];
    if (reservedWords.includes(userCode) && userData.role !== "admin") {
      return notify(
        "This promo code name is reserved. Choose another name.",
        "error",
      );
    }

    if (code === userData.affiliateCode) {
      setIsEditingCode(false);
      return;
    }

    setSavingCode(true);
    try {
      // Check if coupon exists
      const couponQ = query(
        collection(db, "coupons"),
        where("code", "==", code),
      );
      const snap = await getDocs(couponQ);
      if (!snap.empty) {
        notify("This promo code is already taken!", "error");
        setSavingCode(false);
        return;
      }

      // Update user document
      await updateDoc(doc(db, "users", userData.uid), { affiliateCode: code });

      // Add new coupon
      await addDoc(collection(db, "coupons"), {
        code: code,
        discount: 5,
        type: "percent",
        maxUses: 999999,
        usedCount: 0,
        isActive: true,
        isAffiliate: true,
        affiliateId: userData.uid,
        createdAt: Date.now(),
      });

      notify("Custom promo code saved!", "success");
      setIsEditingCode(false);
    } catch (e) {
      notify("Failed to save code", "error");
    }
    setSavingCode(false);
  };

  // Compute chart data
  const getChartData = () => {
    const last12Months = Array.from({ length: 6 })
      .map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return {
          month: d.toLocaleString("default", { month: "short" }),
          year: d.getFullYear(),
          earned: 0,
          sales: 0,
        };
      })
      .reverse();

    logs.forEach((log: any) => {
      const d = new Date(log.createdAt);
      const month = d.toLocaleString("default", { month: "short" });
      const year = d.getFullYear();
      const match = last12Months.find(
        (m) => m.month === month && m.year === year,
      );
      if (match) {
        match.earned += log.commission || 0;
        match.sales += 1;
      }
    });
    return last12Months;
  };

  const chartData = getChartData();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 min-h-screen bg-background text-foreground font-sans relative overflow-hidden pb-32">
        <div aria-hidden className="fixed inset-0 isolate contain-strict -z-10 opacity-30 dark:opacity-60 pointer-events-none">
            <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(0,0,0,0.06)_0,rgba(0,0,0,0.02)_50%,rgba(0,0,0,0.01)_80%)] dark:bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(255,255,255,0.06)_0,rgba(255,255,255,0.02)_50%,rgba(255,255,255,0.01)_80%)] absolute top-0 right-0 h-[800px] w-[560px] -translate-y-[350px] rounded-full" />
            <div className="bg-[radial-gradient(50%_50%_at_50%_50%,rgba(0,0,0,0.04)_0,rgba(0,0,0,0.01)_80%,transparent_100%)] dark:bg-[radial-gradient(50%_50%_at_50%_50%,rgba(255,255,255,0.04)_0,rgba(255,255,255,0.01)_80%,transparent_100%)] absolute top-0 right-0 h-[800px] w-[240px] -translate-y-[350px] rounded-full" />
        </div>
      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => navigate("/profile")}
            className="p-3.5 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:bg-zinc-900 hover:text-white transition-all active:scale-95 group hover-tilt"
          >
            <Icon
              name="chevron-left"
              className="text-xs group-hover:-translate-x-1 transition-transform"
            />
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl lg:text-base xl:text-sm font-semibold tracking-tight  text-shine">
              Partners.
            </h1>
            <p className="text-[9px] font-bold text-zinc-800 dark:text-zinc-200/70  tracking-normal mt-1 pl-1">
              Affiliate Portal
            </p>
          </div>
        </div>
      </div>

      <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-full mb-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex-1 py-3 text-xs md:text-sm font-bold tracking-normal rounded-full transition-all ${activeTab === "dashboard" ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm " : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("creator_hub")}
          className={`flex-1 py-3 text-xs md:text-sm font-bold tracking-normal rounded-full transition-all ${activeTab === "creator_hub" ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md " : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
        >
          Creator Hub
        </button>
      </div>

      {activeTab === "dashboard" ? (
        <>
          <div className="flex flex-col lg:flex-row gap-6 mb-8 w-full max-w-5xl mx-auto">
            {/* Wallet style card */}
            <Card className="flex-1 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-3xl">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Card className="p-4 bg-gradient-to-r from-pink-200 to-rose-200 dark:from-pink-900/40 dark:to-rose-900/40 border border-pink-300/50 dark:border-pink-800/50 shadow-sm rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black/10 dark:bg-white/10 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-200">Total Lifetime Earnings</span>
                      </div>
                      <span className="font-semibold text-gray-800 dark:text-gray-100">
                        ৳{((userData.walletBalance || 0) + logs.reduce((acc: any, log: any) => acc + (log.commission || 0), 0)).toLocaleString()}
                      </span>
                    </div>
                  </Card>

                  <Card className="p-4 bg-gradient-to-r from-purple-200 to-indigo-200 dark:from-purple-900/40 dark:to-indigo-900/40 border border-purple-300/50 dark:border-purple-800/50 shadow-sm rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black/10 dark:bg-white/10 rounded-lg flex items-center justify-center">
                          <Gift className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-200">Total Sales</span>
                      </div>
                      <span className="font-semibold text-gray-800 dark:text-gray-100">{salesCount} Sales</span>
                    </div>
                  </Card>
                </div>

                <div className="space-y-4 py-6 px-4 border border-gray-100 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                      </div>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Available Balance</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">
                      ৳{(userData.walletBalance || 0).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 text-emerald-500">
                      <span className="font-medium">Active</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => navigate("/withdraw")} className="flex-1 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl h-12 gap-2 border border-pink-600">
                    <ArrowDown className="w-4 h-4" />
                    Withdraw
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => copyToClipboard(shareLink)}
                    className="flex-1 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 rounded-2xl h-12 gap-2 border border-gray-300 dark:border-zinc-700"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Copy Link
                  </Button>
                </div>

                <div className="space-y-1 pt-2">
                  <div className="flex items-center gap-4 p-3 border border-gray-100 dark:border-zinc-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center border border-pink-200 dark:border-pink-800/50">
                      <TrendingUp className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Level {currentTier} Partner</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{currentCommission}৳ per sale</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 border border-gray-100 dark:border-zinc-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center border border-purple-200 dark:border-purple-800/50">
                      <Wallet className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Next Goal</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{currentTier === 4 && salesCount >= t4Limit ? "MAX TIER ACTIVE" : `${currentTarget - salesCount} sales to Level ${currentTier + 1}`}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Goal Progress Card  */}
            <div className="flex-1 flex flex-col gap-6">
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col h-full relative overflow-hidden group">
                <div className="z-10 relative flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                        Level up to Level {currentTier < 4 ? currentTier + 1 : 4}
                      </h2>
                      <span className="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 px-3 py-1.5 rounded-full text-xs font-semibold">
                        {currentTier < 4 ? `+ ${nextCommission}৳ / Sale` : "Max Level"}
                      </span>
                    </div>

                    <div className="flex items-end gap-2 mb-6">
                      <h3 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        {salesCount}
                      </h3>
                      <p className="text-sm font-bold text-zinc-500 mb-1">
                        / {currentTarget} Sales
                      </p>
                    </div>

                    <div className="h-6 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden relative mb-4">
                      <div
                        className="absolute h-full left-0 top-0 bg-pink-500 dark:bg-pink-600 rounded-full transition-all duration-1000"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {currentTier === 4 && salesCount >= t4Limit ? (
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full w-max mt-4">
                      <Icon name="check-circle" className="mr-2 text-lg text-emerald-500" /> MAX TIER ACHIEVED
                    </p>
                  ) : (
                    <p className="text-sm font-bold text-zinc-500 leading-relaxed mt-4">
                      <span className="text-zinc-900 dark:text-zinc-100 font-semibold text-lg">
                        {currentTarget - salesCount} more sales
                      </span>{" "}
                      needed. Keep pushing!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm mb-8 overflow-hidden relative hidden md:block">
            <div className="flex justify-between items-center mb-6 z-10 relative">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Performance Over Time
              </h2>
              <div className="flex items-center gap-4 text-[10px] font-bold  tracking-normal text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"></span>{" "}
                  Sales
                </div>
              </div>
            </div>
            <div className="h-56 w-full relative z-10 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#71717a" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#71717a" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{
                      stroke: "#ecfdf5",
                      strokeWidth: 2,
                      strokeDasharray: "4 4",
                    }}
                    contentStyle={{
                      backgroundColor: "white",
                      borderRadius: "1.5rem",
                      border: "1px solid #f4f4f5",
                      boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                      padding: "12px 16px",
                    }}
                    itemStyle={{
                      fontSize: "14px",
                      fontWeight: "900",
                      color: "#10b981",
                    }}
                    labelStyle={{
                      fontSize: "10px",
                      color: "#a1a1aa",
                      textTransform: "",
                      letterSpacing: "0.1em",
                      fontWeight: "700",
                      marginBottom: "4px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    name="Total Sales"
                    stroke="#10b981"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm mb-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
                  Your Promotion Hub
                </h2>
                <p className="text-xs text-zinc-500 font-medium max-w-md leading-relaxed">
                  Share your code everywhere. Customers get{" "}
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 dark:text-zinc-800 dark:text-zinc-200">
                    5% OFF
                  </span>{" "}
                  instantly, and you earn{" "}
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 dark:text-zinc-800 dark:text-zinc-200">
                    {currentCommission}৳
                  </span>{" "}
                  immediately upon delivery.
                </p>
              </div>

              <div className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-2 rounded-full flex items-center space-x-3 w-full md:w-auto">
                <div className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-800 dark:text-zinc-200">
                  <Icon name="tag" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-zinc-500 tracking-normal mb-0.5">
                    Your Rate
                  </p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {currentCommission}৳ / Sale
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700/50">
                <label className="text-[10px] font-bold  tracking-normal text-zinc-400 mb-3 block">
                  Custom Promo Code
                </label>
                {isEditingCode ? (
                  <div className="flex bg-white dark:bg-zinc-900 border-2 border-emerald-500 p-1.5 rounded-full transition-all h-14 shadow-sm">
                    <input
                      type="text"
                      value={tempCode}
                      onChange={(e) =>
                        setTempCode(e.target.value.toUpperCase())
                      }
                      className="flex-1 bg-transparent px-4 text-sm font-semibold text-zinc-800 dark:text-zinc-200 outline-none  tracking-normal min-w-0"
                      placeholder="e.g. VIBEGADGET"
                    />
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={handleSaveCode}
                        disabled={savingCode}
                        className="h-full w-12 flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-full shadow-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors "
                      >
                        {savingCode ? (
                          <Icon
                            name="spinner-third"
                            className="animate-spin text-sm"
                          />
                        ) : (
                          <Icon name="check" className="text-sm" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingCode(false);
                          setTempCode(userData.affiliateCode || "");
                        }}
                        className="h-full w-12 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <Icon name="times" className="text-sm" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-1.5 rounded-full transition-all h-14 shadow-sm group">
                    <input
                      type="text"
                      readOnly
                      value={affiliateCode}
                      className="flex-1 bg-transparent px-4 text-base font-semibold text-zinc-800 dark:text-zinc-200 dark:text-zinc-800 dark:text-zinc-200 outline-none  tracking-normal min-w-0"
                    />
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => setIsEditingCode(true)}
                        className="h-full px-4 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-[10px] font-bold  tracking-normal"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => copyToClipboard(affiliateCode)}
                        className="h-full px-5 flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 text-white rounded-full hover:bg-zinc-900 transition-colors text-[10px] font-bold  tracking-normal shadow-md"
                      >
                        {isCopying ? "Copied!" : "Copy Code"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700/50">
                <label className="text-[10px] font-bold  tracking-normal text-zinc-400 mb-3 block transform-gpu">
                  Direct Referral Link
                </label>
                <div className="flex bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-1.5 rounded-full transition-all h-14 shadow-sm group">
                  <div className="flex items-center justify-center w-10 text-zinc-300 dark:text-zinc-600">
                    <Icon name="link" />
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={shareLink}
                    className="flex-1 bg-transparent pr-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 outline-none min-w-0 truncate"
                  />
                  <button
                    onClick={() => copyToClipboard(shareLink)}
                    className="h-full px-5 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-[10px] font-bold  tracking-normal"
                  >
                    {isCopying ? <Icon name="check" /> : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Transaction History
                </h3>
                <span className="text-[10px] font-bold text-zinc-400  tracking-normal bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                  {logs.length} Sales
                </span>
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-solid border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon
                      name="receipt"
                      className="text-xl text-zinc-300 dark:text-zinc-600"
                    />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                    No transactions yet
                  </h4>
                  <p className="text-[11px] font-medium text-zinc-500 max-w-xs mx-auto leading-relaxed">
                    Your earnings will appear here once customers receive their
                    orders using your code.
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col gap-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between py-4 px-5 bg-zinc-50 dark:bg-zinc-800/30 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                    >
                      <div className="flex items-center overflow-hidden pr-4">
                        <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 flex items-center justify-center shrink-0 mr-4 shadow-inner group-hover:scale-105 transition-transform">
                          <Icon name="arrow-down-left" className="text-sm" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate mb-1">
                            Sale Commission
                          </p>
                          <p className="text-[10px] font-bold text-zinc-500 flex items-center gap-2">
                            <span>
                              {new Date(log.createdAt).toLocaleDateString()}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                            <span className="truncate max-w-[100px] sm:max-w-[150px]">
                              {log.customerName || "Customer"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-semibold text-zinc-800 dark:text-zinc-200 dark:text-zinc-800 dark:text-zinc-200 text-lg">
                          +৳{log.commission}
                        </p>
                        <p className="text-[9px] font-bold text-zinc-800 dark:text-zinc-200/50  tracking-normal mt-0.5">
                          Added to Wallet
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-zinc-900 dark:bg-zinc-50 p-8 rounded-2xl text-white dark:text-zinc-900 shadow-sm overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/10 dark:bg-zinc-900 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 backdrop-blur-md">
                    <Icon name="bullhorn" className="text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight mb-3">
                    Marketing Tips
                  </h3>
                  <ul className="space-y-5 mb-4">
                    <li className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900/10 dark:bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900/20 flex items-center justify-center shrink-0 border border-emerald-500/20 mt-0.5 shadow-sm">
                        <Icon
                          name="check"
                          className="text-zinc-800 dark:text-zinc-200 dark:text-zinc-800 dark:text-zinc-200 text-[10px]"
                        />
                      </div>
                      <p className="text-xs font-bold text-zinc-400 dark:text-zinc-600 leading-relaxed">
                        Add your code to your Instagram & TikTok bios.
                      </p>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900/10 dark:bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900/20 flex items-center justify-center shrink-0 border border-emerald-500/20 mt-0.5 shadow-sm">
                        <Icon
                          name="check"
                          className="text-zinc-800 dark:text-zinc-200 dark:text-zinc-800 dark:text-zinc-200 text-[10px]"
                        />
                      </div>
                      <p className="text-xs font-bold text-zinc-400 dark:text-zinc-600 leading-relaxed">
                        Share our daily offers and mention your code gives extra
                        5% off.
                      </p>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900/10 dark:bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900/20 flex items-center justify-center shrink-0 border border-emerald-500/20 mt-0.5 shadow-sm">
                        <Icon
                          name="check"
                          className="text-zinc-800 dark:text-zinc-200 dark:text-zinc-800 dark:text-zinc-200 text-[10px]"
                        />
                      </div>
                      <p className="text-xs font-bold text-zinc-400 dark:text-zinc-600 leading-relaxed">
                        Unbox products and vocally remind viewers to use your
                        code.
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <CreatorHub userData={userData} />
      )}
      <div className="h-20" />
    </div>
  );
};

export default AffiliatePage;
