import React, { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Loader from "../../loader";

const AddPostModal = ({ handleCloseEvent, categoriesList, refreshWordpressPosts }) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [status, setStatus] = useState("");
  const [displayLoader, setDisplayLoader] = useState(false);

  // Handle form submission
  const handleFormSubmitData = async (event) => {
    event.preventDefault();
    setDisplayLoader(true);

    try {
      const token = window.localStorage.getItem("jwt_token");
      if (!token) {
        alert("Authentication error. Please login again.");
        setDisplayLoader(false);
        return;
      }

      let featuredImageID = null;

      // Upload image if provided
      if (featuredImage) {
        featuredImageID = await handleFeaturedImageUpload(featuredImage);
      }

      const postData = {
        title,
        content: editorContent,
        categories: [category],
        featured_media: featuredImageID,
        status
      };

      // Create a new post
      const apiResponse = await fetch(
        "http://localhost/wp/wp_plugins/wp-json/wp/v2/posts",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
            "Content-type": "application/json"
          },
          body: JSON.stringify(postData)
        }
      );

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        console.error("Failed to add post:", errorData);
        alert("Failed to add post: " + errorData.message);
        return;
      }

      const apiData = await apiResponse.json();
      console.log("Post Added Successfully:", apiData);

      // Refresh the post list before closing
      await refreshWordpressPosts();
      handleCloseEvent();
    } catch (error) {
      console.error("Error adding post:", error);
      alert("Unexpected error occurred while adding post.");
    } finally {
      setDisplayLoader(false);
    }
  };

  // Upload featured image to WordPress media library
  const handleFeaturedImageUpload = async (featuredImageFile) => {
    try {
      const token = window.localStorage.getItem("jwt_token");

      // Check file type
      if (!["image/jpeg", "image/png"].includes(featuredImageFile.type)) {
        alert("Only JPEG or PNG images are allowed!");
        return null;
      }

      const formdata = new FormData();
      formdata.append("file", featuredImageFile);
      formdata.append("alt_text", "Featured Image of Post");

      const apiResponse = await fetch(
        "http://localhost/wp/wp_plugins/wp-json/wp/v2/media",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token
          },
          body: formdata
        }
      );

      const apiData = await apiResponse.json();

      if (!apiResponse.ok) {
        console.error("Media upload failed:", apiData);
        alert("Media upload failed: " + apiData.message);
        return null;
      }

      console.log("Media Uploaded:", apiData);
      return apiData.id;
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Unexpected error uploading featured image.");
      return null;
    }
  };

  return (
    <div className="modal" id="addPostModal">
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 relative">
          {displayLoader && <Loader />}
          <h2 className="text-2xl mb-4">Add New Post</h2>

          <form onSubmit={handleFormSubmitData}>
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded w-full p-2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border border-gray-300 rounded w-full p-2"
                  required
                >
                  <option value="">Select Category</option>
                  {Object.entries(categoriesList).map(([index, value]) => (
                    <option key={index} value={index}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 mb-4">
                <label className="block text-sm font-medium mb-2">Content</label>
                <CKEditor
                  editor={ClassicEditor}
                  data={editorContent}
                  onChange={(e, editor) => {
                    const data = editor.getData();
                    setEditorContent(data);
                  }}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Featured Image</label>
                <input
                  type="file"
                  onChange={(e) => setFeaturedImage(e.target.files[0])}
                  accept="image/jpeg,image/png"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border border-gray-300 rounded w-full p-2"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="publish">Publish</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={handleCloseEvent}
                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPostModal;
