import React, { useState, useEffect } from "react";
import {
  Route,
  Routes,
  Link,
  Outlet,
  useParams,
  useLocation,
} from "react-router-dom";

import { Button } from "@/components/ui";
import { LikedPosts } from "@/_root/pages";
import { QueryClient } from "@tanstack/react-query";
import { useUserContext } from "@/context/AuthContext";
import { useFollowUser, useGetUserById, useGetFollowing, useUnfollowUser } from "@/lib/react-query/queries"; // Assuming you have this query hook
import { GridPostList, Loader } from "@/components/shared";

interface StabBlockProps {
  value: string | number;
  label: string;
}

const StatBlock = ({ value, label }: StabBlockProps) => (
  <div className="flex-center gap-2">
    <p className="small-semibold lg:body-bold text-primary-500">{value}</p>
    <p className="small-medium lg:base-medium text-light-2">{label}</p>
  </div>
);

const Profile = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  const { pathname } = useLocation();
  const queryClient = new QueryClient()
  const [followMessage, setFollowMessage] = useState("Follow");

  const { data: currentUser } = useGetUserById(id || "");
  const { mutateAsync: followUser, isLoading: isFollowingUser } = useFollowUser();
  const { mutateAsync: unfollowUser, isLoading: isUnfollowingUser } = useUnfollowUser();
  const [followersCount, setFollowersCount] = useState(currentUser?.followers?.length || 0);
  const [followingCount, setFollowingCount] = useState(currentUser?.following?.length || 0);

  const { data: followingList = [], isLoading: isFollowingLoading, isError } = useGetFollowing(user.id);
  const [isFollowingState, setIsFollowingState] = useState(false);

  useEffect(() => {
    setFollowMessage(isFollowingState ? "Unfollow" : "Follow");
  }, [isFollowingState]);

  const handleFollow = async () => {
    try {
      console.log(followUser)
      if (isFollowingState) {
        await unfollowUser({ userId: user.id, targetUserId: id });
        setIsFollowingState(false);
        // setFollowersCount((prev) => prev - 1); // Optimistic update
        setFollowersCount(currentUser?.following?.length); // Optimistic update
        window.location.reload()
      } else {
        await followUser({ userId: user.id, targetUserId: id });
        setIsFollowingState(true);
        // setFollowersCount((prev) => prev + 1); // Optimistic update
        setFollowersCount((currentUser?.following?.length)); // Optimistic update
        window.location.reload()
      }
      queryClient.setQueryData(["user", id], (oldData: any) => {
        if (!oldData) return oldData;

        const updatedFollowers = isFollowingState
          ? oldData.followers.filter((followerId: string) => followerId !== user.id)
          : [...oldData.followers, user.id];

        return {
          ...oldData,
          followers: updatedFollowers,
        };
      });
    } catch (error) {
      console.error("Failed to update follow status", error);
    }
  };

  useEffect(() => {
    console.log("Following list:", followingList); // Debug log
    console.log("Profile user ID:", id); // Debug log

    // Safely check if the user is in the following list
    if (Array.isArray(followingList) && id) {
      const isFollowingCurrent = followingList.includes(id);
      setIsFollowingState(isFollowingCurrent);
    }
  }, [followingList, id]);

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <div className="profile-container">
      <div className="profile-inner_container">
        {/* Profile Details */}
        <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7">
          <img
            src={currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="profile"
            className="w-28 h-28 lg:h-36 lg:w-36 rounded-full"
          />
          <div className="flex flex-col flex-1 justify-between md:mt-2">
            <div className="flex flex-col w-full">
              <h1 className="text-center xl:text-left h3-bold md:h1-semibold w-full gap-1 flex flex-row items-center justify-center">
                {/* {currentUser.name} <img src="/assets/icons/checkmark.svg" width={20} height={22} className="mb-4" alt="" /> */}
              </h1>
              <p className="small-regular md:body-medium text-light-3 text-center xl:text-left">
                @{currentUser.username}
              </p>
            </div>

            <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
              <StatBlock value={currentUser.posts.length} label="Posts" />
              {/* <StatBlock value={currentUser.followers.length || 0} label="Followers" />
              <StatBlock value={currentUser.following.length || 0} label="Following" /> */}
              <StatBlock value={currentUser.followers?.length || 0} label="Followers" />
              <StatBlock value={currentUser.following?.length || 0} label="Following" />
            </div>

            <p className="small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm">
              {currentUser.bio}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            {user.id === currentUser.$id ? (
              <Link
                to={`/update-profile/${currentUser.$id}`}
                className="h-12 bg-dark-4 px-5 text-light-1 flex-center gap-2 rounded-lg"
              >
                <img src={"/assets/icons/edit.svg"} alt="edit" width={20} height={20} />
                <p className="flex whitespace-nowrap small-medium">Edit Profile</p>
              </Link>
            ) : (
              <Button
                type="button"
                className="shad-button_primary px-8"
                onClick={handleFollow}
                disabled={isFollowingUser || isUnfollowingUser || isFollowingLoading}
              >
                {followMessage}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* User Content */}
      {currentUser.$id === user.id && (
        <div className="flex max-w-5xl w-full">
          <Link
            to={`/profile/${id}`}
            className={`profile-tab rounded-l-lg ${pathname === `/profile/${id}` && "!bg-dark-3"}`}
          >
            <img src={"/assets/icons/posts.svg"} alt="posts" width={20} height={20} />
            Posts
          </Link>
          <Link
            to={`/profile/${id}/liked-posts`}
            className={`profile-tab rounded-r-lg ${pathname === `/profile/${id}/liked-posts` && "!bg-dark-3"}`}
          >
            <img src={"/assets/icons/like.svg"} alt="like" width={20} height={20} />
            Liked Posts
          </Link>
        </div>
      )}

      <Routes>
        <Route
          index
          element={<GridPostList posts={currentUser.posts} showUser={false} />}
        />
        {currentUser.$id === user.id && (
          <Route path="/liked-posts" element={<LikedPosts />} />
        )}
      </Routes>
      <Outlet />
    </div>
  );
};


export default Profile;