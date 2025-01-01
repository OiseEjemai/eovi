import { Models } from "appwrite";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input"
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { useCreateComment, useFetchComments } from "@/lib/react-query/queries";

import { Link } from "react-router-dom";

import { PostStats } from "@/components/shared";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";

type PostCardProps = {
  post: Models.Document;
};

const PostCard = ({ post }: PostCardProps) => {
  const [content, setContent] = useState("");
  const { toast } = useToast()
  const { data: comments, isLoading: isLoadingComments } = useFetchComments(post.$id);

  const { user } = useUserContext();
  const navigate = useNavigate();
  const { mutate: addComment, isLoading: isAddingComment } = useCreateComment();

  const postId = post.$id
  const userId = user.id

  const handleAddComment = async () => {
    console.log(post.$id)
    console.log(userId)
    if (!content.trim()) return;

    addComment(
      { postId, userId, content },
      {
        onSuccess: () => {
          setContent(""); // Clear input on success
          toast({
            title: "Comment Successfully added",
          })
        },
        onError: (error) => {
          console.error("Error adding comment:", error);
          toast({
            title: "Something went wrong, Please try again",
          })
        },
      }
    );
  };

  const navigateToComment = () => {
    navigate(`/posts/${post.$id}`)
  }

  if (!post.creator) return;

  return (
    <div className="post-card">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.creator.$id}`}>
            <img
              src={
                post.creator?.imageUrl ||
                "/assets/icons/profile-placeholder.svg"
              }
              alt="creator"
              className="w-12 lg:h-12 rounded-full"
            />
          </Link>

          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-light-1">
              {post.creator.name}
            </p>
            <div className="flex-center gap-2 text-light-3">
              <p className="subtle-semibold lg:small-regular ">
                {multiFormatDateString(post.$createdAt)}
              </p>
              •
              <p className="subtle-semibold lg:small-regular">
                {post.location}
              </p>
            </div>
          </div>
        </div>

        <Link
          to={`/update-post/${post.$id}`}
          className={`${user.id !== post.creator.$id && "hidden"}`}>
          <img
            src={"/assets/icons/edit.svg"}
            alt="edit"
            width={20}
            height={20}
          />
        </Link>
      </div>

      <Link to={`/posts/${post.$id}`}>
        <img
          src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="post image"
          className="post-card_img mt-8"
        />
      </Link>

      <PostStats post={post} userId={user.id} />

      <div className="small-medium lg:base-medium py-5">
        <p><strong>{post.creator.username}</strong> <small>{post.caption}</small> </p>
        <ul className="flex gap-1 mt-2">
          {post.tags.map((tag: string, index: string) => (
            <li key={`${tag}${index}`} className="text-light-3 small-regular">
              #{tag}
            </li>
          ))}
        </ul>
      </div>
      <div>
        {/* <div>
          {comments?.documents?.map((comment) => (
            <div key={comment.$id}>
              <p>{comment.content}</p>
              <small>
                {new Date(comment.timestamp).toLocaleString()}
              </small>
            </div>

          ))}
        </div> */}
        <p className="cursor-pointer text-light-3" onClick={navigateToComment}>Add comment...</p>
        {/* <div className="flex w-full max-w-sm items-center space-x-2">

          <Input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Come on, Say it" className="appearance-none bg-transparent border-none w-96 text-gray-200 mr-3 py-1 px-2 leading-tight focus:outline-none" />
          <Button className="mt-5 shad-button_ghost" onClick={handleAddComment} disabled={isAddingComment}>
            {isAddingComment ? "Adding..." : "Add Comment"}
          </Button>
        </div> */}
      </div>
    </div>
  );
};

export default PostCard;
