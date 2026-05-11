import React, { useState, useRef, useEffect } from "react";
import { UserProfile } from "../types";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut, updateProfile } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { useNotify } from "../components/Notifications";
import { uploadToImgbb } from "../services/imgbb";
import { cn } from "../lib/utils";
import { Separator } from "../components/ui/separator";
import { AvatarUploader } from "../components/ui/avatar-uploader";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import Icon from "../components/Icon";
import { motion, AnimatePresence } from "framer-motion";
import { CustomSectionEmbed } from "../components/CustomSectionEmbed";
import { useTheme } from "../components/ThemeContext";

interface SectionColumnsType {
	title: string;
	description?: React.ReactNode;
	className?: string;
	children: React.ReactNode;
}

function SectionColumns({
	title,
	description,
	children,
	className,
}: SectionColumnsType) {
	return (
		<div className="animate-in fade-in grid grid-cols-1 gap-x-10 gap-y-4 py-8 duration-500 md:grid-cols-10">
			<div className="w-full space-y-1.5 md:col-span-4">
				<h2 className="font-heading text-lg leading-none font-semibold text-zinc-900 dark:text-zinc-100">
					{title}
				</h2>
				<p className="text-zinc-500 text-sm text-balance">
					{description}
				</p>
			</div>
			<div className={cn("md:col-span-6", className)}>{children}</div>
		</div>
	);
}

const Profile: React.FC<{ userData: UserProfile | null }> = ({
  userData: initialUserData,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const notify = useNotify();
  const [updating, setUpdating] = useState(false);
  const [localUserData, setLocalUserData] = useState<UserProfile | null>(
    initialUserData,
  );

  const [displayName, setDisplayName] = useState(initialUserData?.displayName || "");

  useEffect(() => {
    setLocalUserData(initialUserData);
    setDisplayName(initialUserData?.displayName || "");
  }, [initialUserData]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("f_cart");
    navigate("/auth-selector");
  };

  const handleAvatarUpload = async (file: File) => {
    if (!auth.currentUser) return { success: false };
    
    setUpdating(true);
    try {
      const url = await uploadToImgbb(file);
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        photoURL: url
      });
      await updateProfile(auth.currentUser, {
        photoURL: url
      });
      setLocalUserData((prev) => prev ? { ...prev, photoURL: url } : null);
      notify("Profile picture updated", "success");
      return { success: true };
    } catch (e: any) {
      notify(e.message || "Failed to update profile picture", "error");
      return { success: false };
    } finally {
      setUpdating(false);
    }
  };

  const handleNameUpdate = async () => {
    if (!auth.currentUser || displayName === localUserData?.displayName) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        displayName
      });
      await updateProfile(auth.currentUser, {
        displayName
      });
      setLocalUserData((prev) => prev ? { ...prev, displayName } : null);
      notify("Name updated", "success");
    } catch (e: any) {
      notify(e.message || "Failed to update name", "error");
    } finally {
      setUpdating(false);
    }
  };

  const menuItems = [
    {
      label: "My Orders",
      icon: "shopping-bag",
      path: "/orders",
      desc: "Track and view your orders",
    },
    {
      label: "Blog",
      icon: "newspaper",
      path: "/blog",
      desc: "Tech news and reviews",
    },
    {
      label: "My Wishlist",
      icon: "heart",
      path: "/wishlist",
      desc: "View saved products",
    },
    {
      label: "Help Center",
      icon: "headset",
      path: "/help-center",
      desc: "Contact customer support",
    },
    {
      label: "Privacy Policy",
      icon: "user-shield",
      path: "/privacy",
      desc: "Read our privacy policy",
    },
    {
      label: "Terms & Conditions",
      icon: "shield-check",
      path: "/terms",
      desc: "Read our terms and conditions",
    },
    {
      label: "About Us",
      icon: "info-circle",
      path: "/about",
      desc: "Learn more about VibeGadget",
    },
    {
      label: "Contact Us",
      icon: "envelope",
      path: "/contact",
      desc: "Get in touch with us",
    },
  ];

  const isAdmin =
    localUserData?.role === "admin" ||
    localUserData?.email?.toLowerCase().trim() === "admin@vibe.shop" ||
    localUserData?.role === "staff";

  if (!localUserData) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-40 animate-fade-in bg-zinc-50 dark:bg-[#000000] min-h-screen">
          <div className="w-24 h-24 bg-white dark:bg-zinc-900 rounded-[15px] flex items-center justify-center mb-6 border border-zinc-200 dark:border-zinc-800">
            <Icon
              name="user"
              className="text-2xl text-zinc-400 dark:text-zinc-500"
            />
          </div>
          <h2 className="text-xl font-semibold mb-2 tracking-tight text-zinc-900 dark:text-zinc-100">
            Sign In to Continue
          </h2>
          <p className="text-sm font-medium text-zinc-500 mb-10 max-w-xs leading-relaxed">
            Log in to view your profile, track orders, and manage wishlist.
          </p>
          <button
            onClick={() => navigate("/auth-selector")}
            className="px-8 py-4 bg-emerald-600 text-white rounded-[15px] font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-3"
          >
            <span>Sign In</span>
            <Icon name="arrow-right" className="text-xs" />
          </button>
        </div>
    );
  }

  return (
    <section className="relative min-h-screen w-full px-4 md:px-12 py-10 pb-24 bg-zinc-50 dark:bg-[#000000]">
      <div className="mx-auto w-full max-w-4xl space-y-8 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Account.</h2>
            <p className="text-zinc-500 text-base">
              Personal Portal
            </p>
          </div>

        </div>
        
        <Separator />

        <div className="py-2">
          <SectionColumns
            title="Your Avatar"
            description="Manage your profile picture securely."
          >
            <AvatarUploader onUpload={handleAvatarUpload}>
              <Avatar className="relative h-20 w-20 cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarImage src={localUserData?.photoURL || `https://ui-avatars.com/api/?name=${localUserData.displayName}&background=000&color=fff`} />
                <AvatarFallback className="border border-zinc-200 dark:border-zinc-800 text-2xl font-bold">
                  {localUserData.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </AvatarUploader>
          </SectionColumns>
          <Separator />
          <SectionColumns
            title="Your Name"
            description="Please enter a display name you are comfortable with."
          >
            <div className="w-full space-y-1">
              <Label className="sr-only">Name</Label>
              <div className="flex w-full items-center justify-center gap-2">
                <Input 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter Your Name" 
                />
                <Button
                  onClick={handleNameUpdate}
                  variant="outline"
                  className="text-xs md:text-sm shrink-0"
                  disabled={updating || displayName === localUserData.displayName}
                >
                  Save
                </Button>
              </div>
              <p className="text-zinc-500 text-xs mt-1 text-right">Max 32 characters</p>
            </div>
          </SectionColumns>
          <Separator />
          <SectionColumns
            title="Account Info"
            description={<>
              Your email address is managed securely. <br />
              <span className="inline-block mt-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-md text-[10px] font-bold tracking-wide uppercase">
                {isAdmin ? "Admin" : "Member"}
              </span>
            </>}
          >
            <Label className="sr-only">Email</Label>
            <div className="flex w-full items-center justify-center gap-2">
              <Input type="email" value={localUserData.email} disabled className="opacity-70 bg-zinc-50 dark:bg-zinc-900/50" />
            </div>
          </SectionColumns>

          {localUserData?.isAffiliate && (
            <>
              <Separator />
              <SectionColumns
                title="Affiliate Earnings"
                description="Monitor your wallet balance and lifetime affiliate earnings."
              >
                  <div className="bg-emerald-600 border border-emerald-500 rounded-[15px] p-6 text-white relative overflow-hidden group">
                    <div className="relative z-10 mb-6 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-medium text-emerald-100 mb-1">
                          Wallet Balance
                        </p>
                        <p className="text-2xl font-bold text-white">
                          ৳{localUserData?.walletBalance || 0}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-medium text-emerald-100 mb-1">
                          Total Earned
                        </p>
                        <p className="text-xl font-bold text-emerald-50">
                          ৳{localUserData?.totalEarned || 0}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate("/affiliate")}
                      className="w-full bg-white text-emerald-900 hover:bg-emerald-50 font-bold"
                    >
                      Manage Affiliate
                    </Button>
                  </div>
              </SectionColumns>
            </>
          )}

          {isAdmin && (
            <>
              <Separator />
              <SectionColumns
                title="Store Operations"
                description="Access administrative dashboard"
              >
                <div 
                  onClick={() => navigate("/admin")}
                  className="flex items-center justify-between p-5 px-6 bg-zinc-100 dark:bg-zinc-900 rounded-[15px] hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-800 group"
                >
                  <div className="flex items-center space-x-5 z-10">
                    <div className="w-12 h-12 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-[15px] flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm">
                      <Icon name="shield-alt" className="text-lg" />
                    </div>
                    <div>
                      <div className="font-semibold tracking-tight text-lg text-zinc-900 dark:text-zinc-100">
                        Admin Portal
                      </div>
                      <div className="text-[11px] font-medium text-zinc-500 mt-0.5">
                        Manage products & orders
                      </div>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-[15px] bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-500 z-10 border border-zinc-200 dark:border-zinc-700 shadow-sm transition-transform group-hover:bg-zinc-50 dark:group-hover:bg-zinc-700">
                    <Icon
                      name="arrow-right"
                      className="text-sm transition-transform"
                    />
                  </div>
                </div>
              </SectionColumns>
            </>
          )}

          <Separator />
          <SectionColumns
            title="Navigation"
            description="Explore platform services"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Link
                to={localUserData?.isAffiliate ? "/affiliate" : "/affiliate"}
                className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700/50 rounded-[15px] transition-colors group shadow-sm"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-[15px] bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400">
                    <Icon name="money-bill-wave" className="text-lg" />
                  </div>
                  <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    {localUserData?.isAffiliate ? "Affiliate Portal" : "Join Affiliate"}
                  </div>
                </div>
              </Link>
              {menuItems.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.path}
                  className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700/50 rounded-[15px] transition-colors group shadow-sm"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-[15px] bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400">
                      <Icon name={item.icon} className="text-lg" />
                    </div>
                    <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                      {item.label}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="pt-8">
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full flex items-center justify-center py-5 space-x-2 font-bold"
              >
                <Icon name="sign-out-alt" className="text-sm" />
                <span>Log Out Securely</span>
              </Button>
            </div>
          </SectionColumns>

        </div>
      </div>
      <CustomSectionEmbed location="profile_bottom" />
    </section>
  );
};

export default Profile;
