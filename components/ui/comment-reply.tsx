import { cn } from "@/lib/utils";
import { useState } from "react";
import Icon from "./Icon"; // assuming this is the correct path for icons or we can use lucid-react

export interface ReviewComment {
  id: string;
  userName: string;
  userPhoto: string;
  rating: number;
  comment: string;
  createdAt: number;
}

export const CommentReply = ({ 
  review, 
  onReply 
}: { 
  review: ReviewComment;
  onReply?: (text: string) => void;
}) => {
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-[28px] p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 mb-6 flex flex-col gap-6">
      <div className="flex gap-4">
        {/* Profile Picture */}
        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-zinc-100 flex items-center justify-center border border-zinc-200">
          {review.userPhoto ? (
            <img src={review.userPhoto} alt={review.userName} className="w-full h-full object-cover" />
          ) : (
            <svg fill="none" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinejoin="round" fill="#707277" strokeLinecap="round" strokeWidth="2" stroke="#707277" d="M6.57757 15.4816C5.1628 16.324 1.45336 18.0441 3.71266 20.1966C4.81631 21.248 6.04549 22 7.59087 22H16.4091C17.9545 22 19.1837 21.248 20.2873 20.1966C22.5466 18.0441 18.8372 16.324 17.4224 15.4816C14.1048 13.5061 9.89519 13.5061 6.57757 15.4816Z"></path>
              <path strokeWidth="2" fill="#707277" stroke="#707277" d="M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z"></path>
            </svg>
          )}
        </div>

        {/* Comment Details */}
        <div className="flex-1">
          <div className="flex flex-col mb-2">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{review.userName}</h4>
            <span className="text-xs text-zinc-400 font-medium">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex space-x-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className={`w-3 h-3 ${i < review.rating ? "text-yellow-400" : "text-zinc-200 dark:text-zinc-700"}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
            ))}
          </div>
          
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
            {review.comment}
          </p>

          <div className="flex gap-4 items-center">
             <button 
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1.5 active:scale-95"
              onClick={() => setIsReplying(!isReplying)}
            >
              <svg fill="none" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" stroke="currentColor" d="M12.4286 12H13.6667C16.0599 12 18 14.0147 18 16.5C18 18.9853 16.0599 21 13.6667 21H8C6.58579 21 5.87868 21 5.43934 20.5607C5 20.1213 5 19.4142 5 18V12"></path>
              </svg>
              Reply
            </button>
          </div>
        </div>
      </div>

      {isReplying && (
        <div className="w-full bg-zinc-50 dark:bg-zinc-950/50 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 mt-[-10px]">
          <div className="flex flex-col gap-2">
            <textarea 
              className="w-full bg-transparent border-none outline-none resize-none min-h-[60px] text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 p-2 font-medium"
              placeholder="Write your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-2">
                 <button type="button" className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                  <svg fill="none" viewBox="0 0 24 24" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" stroke="currentColor" d="M5 6C5 4.58579 5 3.87868 5.43934 3.43934C5.87868 3 6.58579 3 8 3H12.5789C15.0206 3 17 5.01472 17 7.5C17 9.98528 15.0206 12 12.5789 12H5V6Z" clipRule="evenodd" fillRule="evenodd"></path>
                  </svg>
                </button>
                <button type="button" className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                  <svg fill="none" viewBox="0 0 24 24" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeWidth="2.5" stroke="currentColor" d="M12 4H19"></path>
                    <path strokeLinecap="round" strokeWidth="2.5" stroke="currentColor" d="M8 20L16 4"></path>
                    <path strokeLinecap="round" strokeWidth="2.5" stroke="currentColor" d="M5 20H12"></path>
                  </svg>
                </button>
              </div>
              <button 
                type="button" 
                className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                disabled={!replyText.trim()}
                onClick={() => {
                  if (onReply) onReply(replyText);
                  setReplyText("");
                  setIsReplying(false);
                }}
              >
                <svg fill="none" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" stroke="currentColor" d="M12 5L12 20"></path>
                  <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" stroke="currentColor" d="M7 9L11.2929 4.70711C11.6262 4.37377 11.7929 4.20711 12 4.20711C12.2071 4.20711 12.3738 4.37377 12.7071 4.70711L17 9"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
