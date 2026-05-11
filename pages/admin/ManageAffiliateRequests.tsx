import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import Icon from "../../components/Icon";
import { useNavigate } from "react-router-dom";
import { useNotify } from "../../components/Notifications";
import { AffiliateRequest } from "../../types";

const ManageAffiliateRequests: React.FC = () => {
  const [requests, setRequests] = useState<AffiliateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const notify = useNotify();

  useEffect(() => {
    const q = query(
      collection(db, "affiliate_requests"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setRequests(
        snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as AffiliateRequest,
        ),
      );
      setLoading(false);
    });
    return unsub;
  }, []);

  const updateStatus = async (
    request: AffiliateRequest,
    newStatus: "approved" | "rejected",
  ) => {
    try {
      await updateDoc(doc(db, "affiliate_requests", request.id!), {
        status: newStatus,
      });

      if (newStatus === "approved") {
        const namePart = request.fullName
          .split(" ")[0]
          .toUpperCase()
          .replace(/[^A-Z]/g, "");
        const generatedCode =
          namePart.length >= 2
            ? `AFF-${namePart}`
            : `AFF-${request.userId.substring(0, 6).toUpperCase()}`;
        const userRef = doc(db, "users", request.userId);
        const uDoc = await getDoc(userRef);

        await updateDoc(userRef, {
          isAffiliate: true,
          affiliateStatus: "approved",
          affiliateCode: uDoc.data()?.affiliateCode || generatedCode,
          walletBalance: uDoc.data()?.walletBalance || 0,
        });

        if (!uDoc.data()?.affiliateCode) {
          await addDoc(collection(db, "coupons"), {
            code: generatedCode,
            discount: 5,
            type: "percent",
            maxUses: 999999,
            usedCount: 0,
            isActive: true,
            isAffiliate: true,
            affiliateId: request.userId,
            createdAt: Date.now(),
          });
        }

        await addDoc(collection(db, "notifications"), {
          userId: request.userId,
          title: "Affiliate Application Approved",
          message:
            "Congratulations! Your affiliate application has been approved. You can now start sharing your custom promo code to earn rewards.",
          isRead: false,
          createdAt: Date.now(),
          type: "system",
        });
      } else {
        // rejected
        await updateDoc(doc(db, "users", request.userId), {
          isAffiliate: false,
          affiliateStatus: "rejected",
        });

        await addDoc(collection(db, "notifications"), {
          userId: request.userId,
          title: "Affiliate Application Rejected",
          message:
            "Unfortunately, your affiliate application was not approved at this time.",
          isRead: false,
          createdAt: Date.now(),
          type: "system",
        });
      }
      notify(`Application ${newStatus}`, "success");
    } catch (e) {
      notify("Failed to update application status", "error");
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-10 min-h-screen">
      <div className="flex items-center space-x-6 mb-10">
        <button
          onClick={() => navigate("/admin")}
          className="w-10 h-10 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full hover:bg-zinc-900 hover:text-white transition-all"
        >
          <Icon name="arrow-left" />
        </button>
        <div>
          <h1 className="text-lg font-semibold tracking-tight mb-1">
            Affiliate Applications
          </h1>
          <p className="text-[10px]  font-bold text-zinc-400 tracking-normal">
            Review and approve requests
          </p>
        </div>
      </div>

      <div className="flex flex-col space-y-3 max-w-4xl mx-auto">
        {requests.map((req) => (
          <div
            key={req.id}
            className="flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm group hover:border-pink-300 dark:hover:border-pink-800 transition-colors"
          >
            <div className="flex items-start gap-4 pl-2">
              <div className="w-12 h-12 bg-pink-50 dark:bg-zinc-800 text-pink-600 dark:text-pink-400 rounded-xl flex items-center justify-center shrink-0 border border-pink-100 dark:border-zinc-700 shadow-sm">
                <Icon name="handshake" className="text-xl" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    {req.fullName}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${req.status === "pending" ? "bg-yellow-100 text-yellow-700" : req.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {req.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  <span>{req.email}</span>
                  <span>•</span>
                  <span>{req.phone}</span>
                  {req.socialUrl && (
                    <>
                      <span>•</span>
                      <a href={req.socialUrl} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">Link</a>
                    </>
                  )}
                </div>
              </div>
            </div>

            {req.status === "pending" && (
              <div className="flex items-center space-x-2 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => updateStatus(req, "approved")}
                  className="flex items-center justify-center size-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                  title="Approve"
                >
                  <Icon name="check" className="text-xs text-emerald-600" />
                </button>
                <button
                  onClick={() => updateStatus(req, "rejected")}
                  className="flex items-center justify-center size-8 rounded-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  title="Reject"
                >
                  <Icon name="times" className="text-xs text-red-500" />
                </button>
              </div>
            )}
          </div>
        ))}
        {requests.length === 0 && (
          <div className="py-20 text-center text-zinc-400 font-bold tracking-normal text-xs">
            No applications found.
          </div>
        )}
      </div>
    </div>
  );
};
export default ManageAffiliateRequests;
