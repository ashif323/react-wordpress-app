import React, { useEffect, useState } from "react";
import AddPostModal from "./Modal/AddPostModal";
import EditPostModal from './Modal/EditPostModal';
import Loader from "../loader";

const PostList = () => {
  const [addPostModalFlag, setAddPostModalFlag] = useState(false);
  const [editPostModalFlag, setEditPostModalFlag] = useState(false);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState({});
  const [featuredImages, setFeaturedImages] = useState({});
  const [displayLoader, setDisplayLoader] = useState(false);
  const [editPostId, setEditPostId] = useState(null);

  const toggleAddPostModal = () => {
    setAddPostModalFlag(!addPostModalFlag);
  };

  const toggleEditPostModal = (postId) => {
    setEditPostModalFlag(!editPostModalFlag);
    setEditPostId(postId);
  };

  // List of Wordpress posts
  const fetchWordpressPosts = async () => {
    setDisplayLoader(true);
    try {
      const apiResponse = await fetch("http://localhost/wp/wp_plugins/wp-json/wp/v2/posts?status=publish,draft,trash", {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          "Authorization": "Bearer " + window.localStorage.getItem("jwt_token"),
        },
      });

      const listPosts = await apiResponse.json();
      setPosts(listPosts);

      const featureMediaImages = await fetchWordpressMediaImages(listPosts);
      setFeaturedImages(featureMediaImages);
    } catch (error) {
      console.log(error);
    } finally {
      setDisplayLoader(false);
    }
  };

  const generateJWTTokenValue = async () => {
    try {
      const apiResponse = await fetch("http://localhost/wp/wp_plugins/wp-json/jwt-auth/v1/token", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          username: "admin",
          password: "tazirnanhe@1234",
        }),
      });

      const apiData = await apiResponse.json();

      window.localStorage.setItem("jwt_token", apiData.token);

      await validateJWTToken(apiData.token);
    } catch (error) {
      console.log(error);
    }
  };

  const validateJWTToken = async (token) => {
    try {
      const apiResponse = await fetch("http://localhost/wp/wp_plugins/wp-json/jwt-auth/v1/token/validate", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + token,
        },
      });

      const apiData = await apiResponse.json();
      console.log(apiData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    generateJWTTokenValue();
    fetchWordpressPosts();
    fetchWordpressPostsCategories();
  }, []);

  const getPostStatusButton = (status) => {
    if (status === "draft") {
      return <button className="border px-4 py-2 bg-orange-500 text-white">{status}</button>;
    } else if (status === "trash") {
      return <button className="border px-4 py-2 bg-red-500 text-white">{status}</button>;
    } else if (status === "publish") {
      return <button className="border px-4 py-2 bg-green-500 text-white">{status}</button>;
    }
  };

  // Fetch Categories
  const fetchWordpressPostsCategories = async () => {
    try {
      const apiResponse = await fetch("http://localhost/wp/wp_plugins/wp-json/wp/v2/categories", {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          "Authorization": "Basic " + btoa("admin:tazirnanhe@1234"),
        },
      });

      const apiData = await apiResponse.json();

      const categoryObjectData = apiData.reduce((categoryObject, singleCategoryObject) => {
        categoryObject[singleCategoryObject.id] = singleCategoryObject.name;
        return categoryObject;
      }, {});

      setCategories(categoryObjectData);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch mediaImagesArray
  const fetchWordpressMediaImages = async (listPosts) => {
    const mediaImagesArray = {};

    await Promise.all(
      listPosts.map(async (singlePostObject) => {
        if (singlePostObject.featured_media > 0) {
          try {
            const apiResponse = await fetch(
              "http://localhost/wp/wp_plugins/wp-json/wp/v2/media/" + singlePostObject.featured_media,
              {
                method: "GET",
                headers: {
                  "Content-type": "application/json",
                  "Authorization": "Basic " + btoa("admin:tazirnanhe@1234"),
                },
              }
            );

            const apiData = await apiResponse.json();
            mediaImagesArray[singlePostObject.id] = apiData.source_url;
          } catch (error) {
            console.log(error);
            mediaImagesArray[singlePostObject.id] = "http://localhost/wp/wp_plugins/wp-content/uploads/2025/10/no-image-icon-10.png";
          }
        } else {
          mediaImagesArray[singlePostObject.id] = "http://localhost/wp/wp_plugins/wp-content/uploads/2025/10/no-image-icon-10.png";
        }
      })
    );
    return mediaImagesArray;
  };

  // Handle Post Delete with JWT Token Auth
  const handlePostDelete = async (postId) => {
    if (!confirm("Are you sure want to delete?")) {
      return;
    }

    setDisplayLoader(true);
    try {
      const token = window.localStorage.getItem("jwt_token");
      const apiResponse = await fetch(
        `http://localhost/wp/wp_plugins/wp-json/wp/v2/posts/${postId}?force=true`,
        {
          method: "DELETE",
          headers: {
            "Authorization": "Bearer " + token,
          },
        }
      );

      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        console.log("Deleted successfully", apiData);
        fetchWordpressPosts();
      } else {
        const errorData = await apiResponse.json();
        console.error("Failed to delete post:", errorData);
        alert("Failed to delete post: " + errorData.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setDisplayLoader(false);
    }
  };

  return (
    <>
      <div className="container mx-auto p-4">
        {displayLoader && <Loader />}

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Posts</h1>
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={toggleAddPostModal}>
            Add Post
          </button>
        </div>

        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Featured Image</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((singlePost, index) => (
              <tr key={index} className="text-center">
                <td className="border px-4 py-2">{singlePost.id}</td>
                <td className="border px-4 py-2">{singlePost.title.rendered}</td>
                <td className="border px-4 py-2">{getPostStatusButton(singlePost.status)}</td>
                <td className="border px-4 py-2">{categories[singlePost?.categories[0]] || "No Category"}</td>
                <td className="border px-4 py-2">
                  <img
                    src={
                      featuredImages[singlePost.id] ||
                      "http://localhost/wp/wp_plugins/wp-content/uploads/2025/10/no-image-icon-10.png"
                    }
                    alt={singlePost.featured_media}
                    className="w-16 h-16 object-cover"
                  />
                </td>
                <td className="border px-4 py-2">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded mr-2"
                    onClick={() => toggleEditPostModal(singlePost.id)}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handlePostDelete(singlePost.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {addPostModalFlag && (
          <AddPostModal handleCloseEvent={toggleAddPostModal} categoriesList={categories} refreshWordpressPosts={fetchWordpressPosts} />
        )}

        {editPostModalFlag && (
          <EditPostModal categoriesList={categories} handleCloseEvent={toggleEditPostModal} postId={editPostId} refreshWordpressPosts={fetchWordpressPosts} />
        )}
      </div>
    </>
  );
};

export default PostList;
