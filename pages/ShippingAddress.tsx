import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotify } from "../components/Notifications";
import Icon from "../components/Icon";
import { Button } from "@/components/ui/button";

const ShippingAddress: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const [selected, setSelected] = useState(
    localStorage.getItem("vibe_shipping_address") || "",
  );
  const [isAdding, setIsAdding] = useState(false);
  const [newAddr, setNewAddr] = useState("");

  const handleAdd = () => {
    if (!newAddr.trim()) return;
    localStorage.setItem("vibe_shipping_address", newAddr);
    setSelected(newAddr);
    setIsAdding(false);
    notify("Address saved!", "success");
  };

  return (
    <div className="p-6 pb-24 animate-fade-in min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-800 max-w-md mx-auto">
      <div className="flex items-center space-x-4 mb-10">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-[#f4f4f5] dark:bg-zinc-800/80 rounded-2xl"
        >
          <Icon name="chevron-left" className="text-sm" />
        </button>
        <h1 className="text-xl font-bold">Shipping Details</h1>
      </div>

      <div className="space-y-6 flex-1">
        {selected ? (
          <div className="p-6 rounded-2xl border-2 border-black bg-[#f4f4f5] dark:bg-zinc-800/80 shadow-sm shadow-black/5">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                <Icon name="map-marker" className="text-lg" />
              </div>
              <button
                onClick={() => {
                  setSelected("");
                  localStorage.removeItem("vibe_shipping_address");
                }}
                className="text-[10px] font-bold  text-red-500"
              >
                Remove
              </button>
            </div>
            <p className="text-xs font-bold leading-relaxed">{selected}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <Icon
              name="map-marker"
              className="text-lg mb-4 text-zinc-900 dark:text-zinc-100"
            />
            <p className="text-sm font-bold tracking-tight">
              No address saved.
            </p>
          </div>
        )}

        {isAdding ? (
          <div className="space-y-4 animate-fade-in">
            <textarea
              placeholder="Enter full address details (House, Road, Area, City)..."
              className="w-full bg-[#f4f4f5] dark:bg-zinc-800/80 p-5 rounded-2xl outline-none border border-transparent focus:border-black text-sm font-medium h-32"
              value={newAddr}
              onChange={(e) => setNewAddr(e.target.value)}
            />
            <div className="flex space-x-3">
              <Button
                onClick={handleAdd}
                className="flex-1 tracking-normal"
              >
                Save Address
              </Button>
              <button
                onClick={() => setIsAdding(false)}
                className="px-6 py-4 rounded-full text-xs font-bold tracking-normal text-zinc-500"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-5 bg-zinc-50 dark:bg-zinc-800 text-black dark:text-white rounded-full font-bold text-xs tracking-normal border-2 border-solid border-gray-200 hover:border-zinc-900 transition-all"
          >
            + Add Delivery Address
          </button>
        )}
      </div>

      <Button
        variant="primary"
        onClick={() => navigate("/checkout")}
        disabled={!selected}
        className="w-full mt-10 shadow-sm shadow-black/20 disabled:opacity-50 tracking-normal"
      >
        Apply Address
      </Button>
    </div>
  );
};

export default ShippingAddress;
