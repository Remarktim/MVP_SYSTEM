import { useState, useEffect } from "react";
import { toggleLike, getLikeStatus, getLikeCount } from "../supabase";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-hot-toast";

const LikeButton = ({ issueId, initialCount = 0, initialLiked = false, size = "default" }) => {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetch initial status if not provided
  useEffect(() => {
    async function fetchLikeData() {
      if (!issueId) return;

      try {
        const [statusResult, countResult] = await Promise.all([getLikeStatus(issueId), getLikeCount(issueId)]);

        if (!statusResult.error) {
          setLiked(statusResult.data.liked);
        }

        if (!countResult.error) {
          setCount(countResult.data.count);
        }
      } catch (error) {
        console.error("Error fetching like data:", error);
      }
    }

    fetchLikeData();
  }, [issueId]);

  const handleLikeClick = async (e) => {
    e.stopPropagation(); // Prevent card click

    if (loading) return;

    if (!user) {
      toast.error("Please sign in to like reports");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await toggleLike(issueId);

      if (error) {
        toast.error(error.message || "Failed to update like status");
        return;
      }

      if (data) {
        setLiked(data.liked);
        setCount(data.count);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Determine the size classes
  const sizeClasses = size === "small" ? "h-4 w-4" : size === "large" ? "h-6 w-6" : "h-5 w-5";

  return (
    <div className="flex items-center">
      <button
        className={`flex items-center space-x-1 transition-colors p-1 -m-1 rounded-md ${liked ? "text-red-500 hover:text-red-600" : "text-gray-500 hover:text-red-500"} ${
          loading ? "opacity-50 cursor-wait" : "cursor-pointer"
        }`}
        onClick={handleLikeClick}
        disabled={loading}
        aria-label={liked ? "Unlike" : "Like"}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={sizeClasses}
          fill={liked ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={liked ? "0" : "2"}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        {count > 0 && <span className={`${liked ? "text-red-500" : "text-gray-500"} text-xs font-medium`}>{count}</span>}
      </button>
    </div>
  );
};

export default LikeButton;
