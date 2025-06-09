type UploadFileProps = {
  onResult: (message: string) => void;
  setLoading: (loading: boolean) => void; // Add setLoading prop
};

const UploadFile: React.FC<UploadFileProps> = ({ onResult, setLoading }) => {
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      setLoading(true); // Show loading spinner when upload starts

      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (data.advice) {
        onResult(data.advice);
      } else {
        onResult('No advice returned.');
      }
    } catch (error) {
      console.error('File upload failed:', error);
      onResult('An error occurred while uploading the file.');
    }
  };

  return (
    <div className="flex items-center justify-center mt-8">
      <label className="cursor-pointer bg-blue-600 text-white font-semibold py-3 px-6 rounded-full shadow-md hover:bg-blue-700 transition duration-300">
        Browse File
        <input
          type="file"
          accept=".xls,.xlsx,.csv"
          onChange={handleUpload}
          className="hidden"
        />
      </label>
    </div>
  );
};

export default UploadFile;
