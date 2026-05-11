import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { deleteUser } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { useNotify } from "../components/Notifications";
import { motion } from "framer-motion";
import Icon from "../components/Icon";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [pushEnabled, setPushEnabled] = useState(false);

  React.useEffect(() => {
    const isEnabled = localStorage.getItem("vibe_push_enabled") === "true";
    setPushEnabled(isEnabled);
  }, []);

  const togglePush = async () => {
    const OneSignal = (window as any).OneSignal;
    if (!OneSignal) return;

    if (!pushEnabled) {
      await OneSignal.Notifications.requestPermission();
      localStorage.setItem("vibe_push_enabled", "true");
      setPushEnabled(true);
      notify("Push notifications enabled", "success");
    } else {
      // Note: Truly disabling requires browser settings,
      // but we store the preference local state
      localStorage.setItem("vibe_push_enabled", "false");
      setPushEnabled(false);
      notify("Push notifications disabled locally", "info");
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setIsDeleting(true);
    try {
      // 1. Delete Firestore User Doc
      await deleteDoc(doc(db, "users", user.uid));
      // 2. Delete Auth Account
      await deleteUser(user);

      notify("Account permanently deleted", "info");
      navigate("/auth-selector");
    } catch (err: any) {
      if (err.code === "auth/requires-recent-login") {
        notify("Session expired. Please re-login to delete account.", "error");
        await auth.signOut();
        navigate("/signin");
      } else {
        notify("Process failed", "error");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const options = [
    { label: "Password Manager", path: "/settings/password", icon: "lock" },
    { label: "Privacy Policy", path: "/privacy", icon: "shield-alt" },
    {
      label: "Delete Account",
      path: "DELETE",
      danger: true,
      icon: "trash-alt",
    },
  ];

  return (
    <div className="p-6 md:p-12 pb-48 animate-fade-in min-h-screen bg-zinc-50 dark:bg-[#000000] max-w-3xl mx-auto font-inter">
      <div className="flex items-center space-x-6 mb-12">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group"
        >
          <Icon
            name="arrow-left"
            className="text-xs group-hover:-translate-x-1 transition-transform text-zinc-900 dark:text-zinc-100"
          />
        </button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-1">
            Settings.
          </h1>
          <p className="text-[11px] font-medium text-zinc-500 tracking-tight">
            App & Account
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="w-full flex items-center justify-between p-4 px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
          <div className="flex items-center space-x-4">
            <Icon
              name="bell"
              className="w-5 text-center text-zinc-500 dark:text-zinc-400"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                Push Notifications
              </span>
              <span className="text-[10px] text-zinc-500 font-medium tracking-wide uppercase mt-0.5">
                {pushEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
          <button
            onClick={togglePush}
            className={`w-12 h-6 rounded-full p-1 transition-colors flex ${pushEnabled ? "bg-zinc-900 dark:bg-zinc-100 justify-end" : "bg-zinc-200 dark:bg-zinc-800 justify-start"}`}
          >
            <motion.div
              layout
              className="w-4 h-4 bg-white dark:bg-zinc-900 rounded-full shadow-sm"
            ></motion.div>
          </button>
        </div>

        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() =>
              opt.path === "DELETE"
                ? setShowDeleteModal(true)
                : navigate(opt.path)
            }
            className={`w-full flex items-center justify-between p-4 px-6 bg-white dark:bg-zinc-900 border rounded-2xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group ${opt.danger ? "border-red-200 dark:border-red-900/50 hover:border-red-300 dark:hover:border-red-800 bg-red-50/50 dark:bg-red-900/10" : "border-zinc-200 dark:border-zinc-800"}`}
          >
            <div className="flex items-center space-x-4">
              <Icon
                name={opt.icon}
                className={`w-5 text-center transition-colors ${opt.danger ? "text-red-500" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white"}`}
              />
              <span
                className={`font-semibold text-sm transition-colors ${opt.danger ? "text-red-600 dark:text-red-400" : "text-zinc-900 dark:text-zinc-100"}`}
              >
                {opt.label}
              </span>
            </div>
            <Icon
              name="arrow-right"
              className={`text-[10px] transition-colors ${opt.danger ? "text-red-400" : "text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white"}`}
            />
          </button>
        ))}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-zinc-900 dark:bg-white/60 backdrop-blur-md z-[1000] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 w-full max-w-sm border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="exclamation-triangle" className="text-2xl" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-center mb-3 text-zinc-900 dark:text-zinc-100">
              Wait, are you sure?
            </h3>
            <p className="text-sm text-zinc-500 text-center leading-relaxed mb-8">
              Deleting your account is permanent. All your order history and
              profile data will be erased from our database.
            </p>
            <div className="space-y-3">
              <button
                disabled={isDeleting}
                onClick={handleDeleteAccount}
                className="w-full py-4 bg-red-500 text-white rounded-full font-semibold text-sm active:scale-[0.98] transition-transform disabled:opacity-50 hover:bg-red-600"
              >
                {isDeleting ? "Deleting..." : "Permanently Delete"}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-full font-semibold text-sm active:scale-[0.98] transition-transform hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                Keep Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
