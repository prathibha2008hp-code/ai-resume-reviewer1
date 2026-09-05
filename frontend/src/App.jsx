{uploadResult && (
  <div className="text-center bg-white p-4 rounded shadow max-w-md">
    <p className="font-semibold">{uploadResult.filename}</p>
    <p className="text-sm text-gray-600">Extracted {uploadResult.text_length} characters</p>
    <p className="text-sm text-gray-800 mt-2 text-left whitespace-pre-wrap">{uploadResult.preview}...</p>
  </div>
)}