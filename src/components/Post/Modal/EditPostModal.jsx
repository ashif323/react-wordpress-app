import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useState } from "react";


const EditPostModal = ({handleCloseEvent}) => {

    const [title, setTitle] = useState("")
    const [category, setCategory] = useState("")
    const [editorContent, setEditorContent] = useState("")
    const [featuredImage, setFeaturedImage] = useState("")
    const [status, setStatus] = useState("")

    // Handle Form Submit
    const handleFormSubmitData = (event) => {
      event.preventDefault();

      const postData = {
        title,
        content: editorContent,
        categories: [category],
        featured_media: featuredImage,
        status
      }
      console.log(postData);
      
    }

    return <>
        <div className="modal" id="editPostModal">
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 relative">
                <div className="loader"></div> 
                <h2 className="text-2xl mb-4">Edit Post</h2>
                <form onSubmit={handleFormSubmitData}>
                    <div className="mb-4 flex space-x-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-2">Title</label>
                        <input
                        type="text"
                        className="border border-gray-300 rounded w-full p-2"
                        value={title}
                        onChange={ (e) => {
                            setTitle(e.target.value)
                        }}
                        required
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-2">Category</label>
                        <select
                        value={category}
                        onChange={ (e) => {
                            setCategory(e.target.value)
                        }}
                        className="border border-gray-300 rounded w-full p-2"
                        required
                        >
                        <option value="">Select Category</option>
                        <option value="1">Category 1</option> 
                        <option value="2">Category 2</option> 
                        </select>
                    </div>
                    </div>
            
                    <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Content</label>
                    <CKEditor editor={ClassicEditor} data={editorContent} onChange={ (e, editor) =>{
                        const editorData = editor.getData()
                        setEditorContent(editorData)
                    }} />
                    </div>
            
                    <div className="mb-4 flex space-x-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-2">Featured Image</label>
                        <input
                        type="file"
                        onChange={ (e) => {
                            setFeaturedImage(e.target.files[0])
                        }}
                        />
                        <br /><br />
                        <img src="" alt="Featured" /> 
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-2">Status</label>
                        <select
                        value={status}
                        onChange={ (e) => {
                            setStatus(e.target.value)
                        }}
                        className="border border-gray-300 rounded w-full p-2"
                        required
                        >
                        <option value="publish">Publish</option>
                        <option value="draft">Draft</option>
                        </select>
                    </div>
                    </div>
            
                    <div className="flex justify-end">
                    <button
                        type="button"
                        className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                    onClick={handleCloseEvent}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Update
                    </button>
                    </div>
                </form>
                </div>
            </div>
    </div>

  

    </>
}

export default EditPostModal;