import { Models } from "appwrite";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { checkIsLiked } from "@/lib/utils";
import {
  useLikePost,
  useSavePost,
  useDeleteSavedPost,
  useGetCurrentUser,
} from "@/lib/react-query/queries";
import { useCreateComment, useFetchComments } from "@/lib/react-query/queries";
import Loader from "./Loader";

type PostStatsProps = {
  post: Models.Document;
  userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  const location = useLocation();
  const [content, setContent] = useState("");
  const likesList = post.likes.map((user: Models.Document) => user.$id);
  const { data: comments, isLoading: isCommenting } = useFetchComments(post.$id);
  const postId = post.$id


  const [likes, setLikes] = useState<string[]>(likesList);
  const [isSaved, setIsSaved] = useState(false);

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost, isLoading: isSaving } = useSavePost();
  const { mutate: deleteSavePost } = useDeleteSavedPost();

  const { data: currentUser } = useGetCurrentUser();
  const { mutate: addComment, isLoading: isAddingComment } = useCreateComment();

  const savedPostRecord = currentUser?.save.find(
    (record: Models.Document) => record.post.$id === post.$id
  );

  const handleAddComment = () => {
    console.log(post.$id)
    console.log(userId)
    if (!content.trim()) return;

    addComment(
      { postId, userId, content },
      {
        onSuccess: () => {
          setContent(""); // Clear input on success
        },
        onError: (error) => {
          console.error("Error adding comment:", error);
        },
      }
    );
  };


  useEffect(() => {
    setIsSaved(!!savedPostRecord);
  }, [currentUser]);

  const handleLikePost = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    e.stopPropagation();

    let likesArray = [...likes];

    if (likesArray.includes(userId)) {
      likesArray = likesArray.filter((Id) => Id !== userId);
    } else {
      likesArray.push(userId);
    }

    setLikes(likesArray);
    likePost({ postId: post.$id, likesArray });
  };

  const handleSavePost = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    if (isSaving) {
      <Loader />
    }
    e.stopPropagation();

    if (savedPostRecord) {
      setIsSaved(false);
      return deleteSavePost(savedPostRecord.$id);
    }

    savePost({ userId: userId, postId: post.$id });
    setIsSaved(true);
  };

  const containerStyles = location.pathname.startsWith("/profile")
    ? "w-full"
    : "";

  return (
    <div
      className={`flex flex-col z-20 ${containerStyles}`}>
      <div className="flex flex-row justify-start items-start gap-4">
      <div className="flex gap-2 mr-5">
        <img
          src={`${checkIsLiked(likes, userId)
            ? "/assets/icons/liked.svg"
            : "/assets/icons/like.svg"
            }`}
          alt="like"
          width={30}
          height={30}
          onClick={(e) => handleLikePost(e)}
          className="cursor-pointer"
        />
        <p className="text-[14px] font-medium leading-[140%] lg:text-[20px]">{likes.length}</p>
      </div>

      <div className="flex gap-2">
        <img
          src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
          alt="share"
          width={30}
          height={30}
          className="cursor-pointer"
          onClick={(e) => handleSavePost(e)}
        />
      </div>
      </div>
    </div>
  );
};

export default PostStats;
