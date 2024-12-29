import { useParams, Link, useNavigate } from "react-router-dom";

import { Button, Input } from "@/components/ui";
import { Loader } from "@/components/shared";
import { GridPostList, PostStats } from "@/components/shared";

import {
  useGetPostById,
  useGetUserPosts,
  useDeletePost,
  useCreateComment,
  useFetchComments,
  useGetUserById
} from "@/lib/react-query/queries";
import { useToast } from "@/components/ui/use-toast"
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import CommentsList from "@/components/shared/CommentsList";


const PostDetails = () => {
  const navigate = useNavigate();
  const [followMessage, setFollowMessage] = useState("Follow");
  const { id } = useParams();
  const { user } = useUserContext();

  const [content, setContent] = useState("");
  const { toast } = useToast()

  const { mutate: addComment, isLoading: isAddingComment } = useCreateComment();
  const { data: comments, isLoading: isLoadingComments } = useFetchComments(id ?? "");

  const { data: post, isLoading } = useGetPostById(id);
  const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(
    post?.creator.$id
  );
  const [isFollowingState, setIsFollowingState] = useState(false);

  const postId = id
  const userId = user.id

  useEffect(() => {
    console.log(postId)
    setFollowMessage(isFollowingState ? "Unfollow" : "Follow");
  }, [isFollowingState]);
  const { mutate: deletePost } = useDeletePost();

  const relatedPosts = userPosts?.documents.filter(
    (userPost) => userPost.$id !== id
  );

  const handleDeletePost = () => {
    deletePost({ postId: id, imageId: post?.imageId });
    navigate(-1);
  };

  const handleAddComment = async () => {
    if (!postId) {
      console.error("Post ID is undefined");
      toast({
        title: "Cannot add a comment without a valid Post ID but don't worry this is a dev error so just reload the page",
      });
      return;
    }
    console.log(userId)
    if (!content.trim()) {
      toast({
        title: "Comment content cannot be empty",
      });
      return;
    }

    addComment(
      { postId, userId, content },
      {
        onSuccess: () => {
          setContent(""); // Clear input on success
          toast({
            title: "Comment Successfully added",
          })
          window.location.reload()
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

  return (
    <div className="post_details-container">
      <div className="hidden md:flex max-w-5xl w-full">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="shad-button_ghost">
          <img
            src={"/assets/icons/back.svg"}
            alt="back"
            width={24}
            height={24}
          />
          <p className="small-medium lg:base-medium">Back</p>
        </Button>
      </div>

      {isLoading || !post ? (
        <Loader />
      ) : (
        <div className="post_details-card">
          <img
            src={post?.imageUrl}
            alt="creator"
            className="post_details-img"
          />

          <div className="post_details-info">
            <div className="flex-between w-full">
              <Link
                to={`/profile/${post?.creator.$id}`}
                className="flex items-center gap-3">
                <img
                  src={
                    post?.creator.imageUrl ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  alt="creator"
                  className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
                />
                <div className="flex gap-1 flex-col">
                  <p className="base-medium lg:body-bold text-light-1">
                    {post?.creator.name} • <span className="small-medium text-light-3">{followMessage}</span>
                  </p>
                </div>
              </Link>

              <div className="flex-center gap-4">
                <Link
                  to={`/update-post/${post?.$id}`}
                  className={`${user.id !== post?.creator.$id && "hidden"}`}>
                  <img
                    src={"/assets/icons/edit.svg"}
                    alt="edit"
                    width={24}
                    height={24}
                  />
                </Link>

                <Button
                  onClick={handleDeletePost}
                  variant="ghost"
                  className={`ghost_details-delete_btn ${user.id !== post?.creator.$id && "hidden"
                    }`}>
                  <img
                    src={"/assets/icons/delete.svg"}
                    alt="delete"
                    width={24}
                    height={24}
                  />
                </Button>
              </div>
            </div>

            <hr className="border w-full border-dark-4/80" />

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular ">
              <div className="flex flex-row gap-2">
                <img
                  src={
                    post?.creator.imageUrl ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  alt="creator"
                  className="w-7 h-7 lg:w-7 lg:h-7 rounded-full"
                />
                <p className="">
                  <strong>{post?.creator.name}</strong> </p>
                <p className="subtle-semibold lg:small-regular text-light-3">
                  {multiFormatDateString(post?.$createdAt)}
                </p>
              </div>
              <p className="ml-9">{post?.caption}</p>
              <ul className="flex gap-1 mt-2">
                {post?.tags.map((tag: string, index: string) => (
                  <li
                    key={`${tag}${index}`}
                    className="text-light-3 small-regular">
                    #{tag}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col mt-8">
                {comments?.documents?.map((comment) => (
                  // <div key={comment.$id} className="m-5 flex flex-row">
                  //   <p className="mr-2">{comment.creator?.username}</p>
                  //   <small className="text-light-3">
                  //     {multiFormatDateString(comment.timestamp)}
                  //   </small>
                  // </div>
                  <CommentsList key={comment.$id} comment={comment} />

                ))}
              </div>
            </div>

            <div className="w-full">
              <hr className="border w-full border-dark-4/80 mb-8 " />
              <PostStats post={post} userId={user.id} />
              <div className="flex w-full max-w-sm items-center space-x-2">

                <Input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Come on, Say it" className="appearance-none bg-transparent border-none w-96 text-gray-200 mr-3 py-1 px-2 leading-tight focus:outline-none" />
                <Button className="mt-5 shad-button_ghost" onClick={handleAddComment} disabled={isAddingComment}>
                  {isAddingComment ? "Adding..." : "Add Comment"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl">
        <hr className="border w-full border-dark-4/80 " />

        <h3 className="body-bold md:h3-bold w-full my-10">
          More Related Posts
        </h3>
        {isUserPostLoading || !relatedPosts ? (
          <Loader />
        ) : (
          <GridPostList posts={relatedPosts} />
        )}
      </div>
    </div>
  );
};

export default PostDetails;
