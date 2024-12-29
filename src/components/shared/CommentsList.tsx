import { useQuery } from "@tanstack/react-query";
import { getUserById } from "@/lib/appwrite/api";
import { multiFormatDateString } from "@/lib/utils";
import { Models } from "appwrite";
import Loader from "./Loader";
import { useGetUserById } from "@/lib/react-query/queries";

type PostStatsProps = {
  comment: Models.Document;
};


const CommentsList = ({ comment }: PostStatsProps) => {
  const { data: user, isLoading: isCommentLoading, error } = useGetUserById(comment.user_id.$id);
  if (isCommentLoading) {
    return <Loader key={comment.$id} />;
  }

  if (error || !user) {
    return (
      <div key={comment.$id} className="m-5 flex flex-row">
        <p className="mr-2 text-red-500">User not found</p>
        <small className="text-light-3">
          {new Date(comment.timestamp).toLocaleString()}
        </small>
      </div>
    );
  }

  return (
    <div key={comment.$id} className="flex flex-col m-4">
      <div className="flex flex-row gap-2">
        <img
          src={
            user.imageUrl ||
            "/assets/icons/profile-placeholder.svg"
          }
          alt="creator"
          className="w-7 h-7 lg:w-7 lg:h-7 rounded-full"
        />
        <p className="">
          <strong>{user.name}</strong> </p>
        <p className="subtle-semibold lg:small-regular text-light-3">
          {multiFormatDateString(comment.timestamp)}
        </p>
      </div>
      <p className="ml-9">{comment.content}</p>
    </div>
  );
}

export default CommentsList