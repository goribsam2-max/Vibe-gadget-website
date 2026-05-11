import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useNotify } from "../../components/Notifications";
import { uploadToImgbb } from "../../services/imgbb";
import Icon from "../../components/Icon";

const PRESET_SONGS = [
  {
    name: "LoFi Chill",
    url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
  },
  {
    name: "Upbeat Corporate",
    url: "https://cdn.pixabay.com/download/audio/2022/10/24/audio_34b4ce6dcb.mp3?filename=uplifting-upbeat-corporate-125086.mp3",
  },
  {
    name: "Cyberpunk Action",
    url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_249ea36566.mp3?filename=cyberpunk-2099-10701.mp3",
  },
  {
    name: "Epic Cinematic",
    url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=epic-hollywood-trailer-9489.mp3",
  },
  {
    name: "Pop Vibe",
    url: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_c6ccf3232f.mp3?filename=summer-nights-tropical-house-music-11440.mp3",
  },
  {
    name: "YT Playlist Track 1",
    url: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=electronic-future-beats-117997.mp3",
  },
  {
    name: "YT Playlist Track 2",
    url: "https://cdn.pixabay.com/download/audio/2021/11/24/audio_a1622f98f6.mp3?filename=modern-vlog-140795.mp3",
  },
];

import { motion, AnimatePresence } from "framer-motion";

const ManageStories: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [type, setType] = useState<"image" | "video">("image");
  const [category, setCategory] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  // Audio Selection
  const [songSource, setSongSource] = useState<"preset" | "custom">("preset");
  const [selectedSongUrl, setSelectedSongUrl] = useState("");
  const [customSongUrl, setCustomSongUrl] = useState("");
  const [audioStart, setAudioStart] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "stories"), (snap) => {
      setStories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const url = await uploadToImgbb(file);
      setPreviewUrl(url);
    } catch {
      notify("Failed to upload image", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (
      !category ||
      (type === "image" && !previewUrl) ||
      (type === "video" && !videoUrl)
    ) {
      return notify("Please fill required fields", "error");
    }

    const finalAudioUrl =
      songSource === "preset" ? selectedSongUrl : customSongUrl;

    setLoading(true);
    try {
      await addDoc(collection(db, "stories"), {
        type,
        category: category.trim(),
        mediaUrl: type === "image" ? previewUrl : videoUrl,
        linkUrl: linkUrl.trim(),
        duration: type === "image" ? 10 : 15,
        audioUrl: finalAudioUrl || null,
        audioStart: Number(audioStart) || 0,
        createdAt: new Date().toISOString(),
      });
      notify("Story saved", "success");
      setIsAdding(false);
      setCategory("");
      setPreviewUrl("");
      setVideoUrl("");
      setLinkUrl("");
      setSelectedSongUrl("");
      setCustomSongUrl("");
      setAudioStart(0);
    } catch (e) {
      notify("Failed to save story", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this story?")) return;
    try {
      await deleteDoc(doc(db, "stories", id));
      notify("Story deleted", "success");
    } catch (e) {
      notify("Failed to delete", "error");
    }
  };

  const finalAudioPreviewUrl =
    songSource === "preset" ? selectedSongUrl : customSongUrl;

  if (isAdding) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10 pb-32 min-h-screen bg-zinc-50 dark:bg-zinc-800 animate-fade-in relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
        <div className="flex items-center justify-between mb-12 relative z-10 animate-stagger-1">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setIsAdding(false)}
              className="w-12 h-12 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-full shadow-sm hover:bg-zinc-900 dark:bg-zinc-100 hover:text-white transition-all active:scale-95 group hover-tilt"
            >
              <Icon name="chevron-left" className="text-xs group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-xl md:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-1.5 text-shine">
                Create New Story
              </h1>
              <p className="text-zinc-400 text-[10px] md:text-xs font-bold tracking-normal">
                Story Management
              </p>
            </div>
          </div>
        </div>

        <motion.div
           initial={{ opacity: 0, y: -20, scale: 0.95 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           exit={{ opacity: 0, y: -20, scale: 0.95 }}
           className="mb-12 relative z-10"
        >
          <div className="flex items-center justify-center">
            <div className="w-full sm:mx-auto max-w-4xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2rem] shadow-sm">
              <h3 className="text-xl font-semibold text-foreground mb-6">
                 Add new story details
              </h3>

              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-2 block">
                    Story Category / Title
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Flash Sales, Top Offers"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl text-sm outline-none border border-zinc-200 dark:border-zinc-700 focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-2 block">
                    Media Protocol
                  </label>
                  <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-full">
                    <button
                      onClick={() => setType("image")}
                      className={`flex-1 py-3 text-sm font-bold rounded-full transition-all ${type === "image" ? "bg-white dark:bg-zinc-700 shadow border border-zinc-200 dark:border-zinc-600" : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}
                    >
                      Image Cover
                    </button>
                    <button
                      onClick={() => setType("video")}
                      className={`flex-1 py-3 text-sm font-bold rounded-full transition-all ${type === "video" ? "bg-white dark:bg-zinc-700 shadow border border-zinc-200 dark:border-zinc-600" : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}
                    >
                      Direct Video Link
                    </button>
                  </div>
                </div>

                {type === "image" ? (
                  <div>
                    <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-2 block">
                      Upload Cover
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="h-48 border-2 border-solid border-zinc-300 dark:border-zinc-700 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors relative overflow-hidden group"
                    >
                      {loading && !previewUrl ? (
                        <Icon name="spinner" className="animate-spin text-zinc-400 text-xl" />
                      ) : previewUrl ? (
                        <img src={previewUrl} className="w-full h-full object-cover" alt="preview" />
                      ) : (
                        <div className="text-center group-hover:scale-105 transition-transform">
                          <Icon name="cloud-upload-alt" className="text-xl text-zinc-400 mb-3" />
                          <p className="text-sm font-bold text-zinc-500">Tap to browse files</p>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-2 block">
                      Direct Video URL (.mp4)
                    </label>
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://.../video.mp4"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl text-sm outline-none border border-zinc-200 dark:border-zinc-700 focus:border-black transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-2 block">
                    Associated Link URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://vibegadget.com/product/..."
                    className="w-full bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl text-sm outline-none border border-zinc-200 dark:border-zinc-700 focus:border-black transition-colors"
                  />
                  <p className="text-[10px] font-bold tracking-normal text-zinc-400 mt-2">
                    Where should users go when they swipe up or click?
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-4 block">
                    Audio Sync
                  </label>
                  <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-full mb-6">
                    <button
                      onClick={() => setSongSource("preset")}
                      className={`flex-1 py-3 text-sm font-bold rounded-full transition-all ${songSource === "preset" ? "bg-white dark:bg-zinc-700 shadow border border-zinc-200 dark:border-zinc-600" : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}
                    >
                      Presets
                    </button>
                    <button
                      onClick={() => setSongSource("custom")}
                      className={`flex-1 py-3 text-sm font-bold rounded-full transition-all ${songSource === "custom" ? "bg-white dark:bg-zinc-700 shadow border border-zinc-200 dark:border-zinc-600" : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}
                    >
                      Custom URL
                    </button>
                  </div>

                  {songSource === "preset" ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                      {PRESET_SONGS.map((song, i) => (
                        <div
                          key={i}
                          onClick={() => { setSelectedSongUrl(song.url); setAudioStart(0); }}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${selectedSongUrl === song.url ? "border-black dark:border-white bg-zinc-100 dark:bg-zinc-800" : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"}`}
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selectedSongUrl === song.url ? "bg-black dark:bg-white text-white dark:text-black" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500"}`}
                          >
                            <Icon name="music" className="text-sm" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate">
                              {song.name}
                            </p>
                            <p className="text-[10px] text-zinc-400 font-medium">
                              TikTok Trend
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={customSongUrl}
                      onChange={(e) => setCustomSongUrl(e.target.value)}
                      placeholder="e.g. https://.../audio.mp3"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl text-sm outline-none border border-zinc-200 dark:border-zinc-700 mb-4"
                    />
                  )}

                  {finalAudioPreviewUrl && (
                    <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                      <Icon name="clock" className="text-zinc-400" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-zinc-500 mb-1">
                          Start Time (Secs)
                        </p>
                        <input
                          type="number"
                          value={audioStart}
                          onChange={(e) => setAudioStart(Number(e.target.value))}
                          className="w-20 bg-transparent border-b-2 border-zinc-300 dark:border-zinc-600 outline-none text-center font-mono font-bold"
                        />
                      </div>
                      <div className="mt-4 flex items-center space-x-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 p-3 rounded-2xl shadow-sm">
                        <audio
                          ref={audioRef}
                          src={finalAudioPreviewUrl}
                          preload="auto"
                        />
                        <button
                          onClick={() => {
                            if (audioRef.current) {
                              audioRef.current.currentTime = audioStart;
                              audioRef.current.play();
                              setTimeout(() => audioRef.current?.pause(), 5000);
                            }
                          }}
                          className="flex-1 text-xs font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black px-4 py-3 rounded-xl active:scale-95 transition-all"
                        >
                          Preview 5s Sync
                        </button>
                        <button
                          onClick={() => audioRef.current?.pause()}
                          className="text-xs font-bold border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 rounded-xl active:scale-95 transition-all"
                        >
                          Stop
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 pb-12">
                  <button
                    onClick={handleSave}
                    disabled={
                      loading ||
                      !category ||
                      (type === "image" && !previewUrl) ||
                      (type === "video" && !videoUrl)
                    }
                    className="w-full py-4 bg-zinc-900 border-none text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg font-bold tracking-wide mt-4 shadow-xl disabled:opacity-50 hover-lift active:scale-95 transition-all outline-none!"
                  >
                    {loading ? "Synching To Cloud..." : "Build Story"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10 pb-32 min-h-screen bg-zinc-50 dark:bg-zinc-800 animate-fade-in relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="flex items-center justify-between mb-12 relative z-10 animate-stagger-1">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => navigate("/admin")}
            className="w-12 h-12 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-full shadow-sm hover:bg-zinc-900 dark:bg-zinc-100 hover:text-white transition-all active:scale-95 group hover-tilt"
          >
            <Icon name="chevron-left" className="text-xs group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-xl md:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-1.5 text-shine">
              Stories Setup
            </h1>
            <p className="text-zinc-400 text-[10px] md:text-xs font-bold tracking-normal">
               Manage active flash stories
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className={`px-6 py-3 rounded-full font-bold text-[10px] tracking-normal shadow-lg transition-all active:scale-95 border hover-tilt hover-glow bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900`}
        >
          Add Story
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 relative z-10">
        {stories.map((story) => (
          <div
            key={story.id}
            className="relative aspect-[9/16] rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 group shadow-sm"
          >
            {story.type === "video" ? (
              <video
                src={story.mediaUrl}
                className="w-full h-full object-cover"
                muted
                loop
              />
            ) : (
              <img
                src={story.mediaUrl}
                className="w-full h-full object-cover"
                alt=""
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20 opacity-80" />
            <div className="absolute top-3 left-3 bg-zinc-50 dark:bg-zinc-900/20 backdrop-blur-md px-2 py-1 rounded-md text-[9px] font-bold text-white  tracking-normal">
              {story.category}
            </div>
            <button
              onClick={() => handleDelete(story.id)}
              className="absolute bottom-4 right-4 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 xl:group-hover:opacity-100 lg:opacity-0 opacity-100 transition-opacity hover:scale-110 shadow-lg border border-red-400"
            >
              <Icon name="trash" />
            </button>
          </div>
        ))}
        {stories.length === 0 && (
          <div className="col-span-full py-20 text-center bg-zinc-50 dark:bg-zinc-800 border border-solid border-zinc-200 dark:border-zinc-700 rounded-2xl">
            <Icon name="layer-group" className="text-zinc-300 text-lg mb-4" />
            <p className="text-xs font-bold  tracking-normal text-zinc-400">
              No stories active
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 text-[10px] font-bold  tracking-normal text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-900 px-4 py-2 rounded-lg"
            >
              Create First Story
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default ManageStories;
