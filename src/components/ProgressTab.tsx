import React, { useContext, useMemo } from 'react';
import EXIF from 'exif-js';
import { DataContext } from '../DataContext';

interface ProgressPic {
  base64: string;
  timestamp: number;
  weight: string;
}

const ProgressTab = () => {
  const { data, setData } = useContext(DataContext);

  const sortedProgressPics = useMemo(() => [...data.progressPics].sort((a: ProgressPic, b: ProgressPic) => b.timestamp - a.timestamp), [data.progressPics]);

  const renderedProgressPics = useMemo(() => sortedProgressPics.map((pic: ProgressPic, index: number) => (
    <div key={index} className="progress-pic">
      <img src={pic.base64} alt="Progress" />
      <div className="timestamp">
        {new Date(pic.timestamp).toLocaleDateString()} ({pic.weight} lbs)
        <span className="trash" onClick={() => deleteProgressPic(index)}>🗑</span>
      </div>
    </div>
  )), [sortedProgressPics]);

  const uploadProgressPic = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          const base64 = event.target?.result as string;
          const img = new Image();
          img.src = base64;
          img.onload = () => {
            EXIF.getData(img as any, function() {
              let exifDate = EXIF.getTag(img, 'DateTimeOriginal');
              let timestamp = Date.now();
              if (exifDate) {
                const parts = exifDate.split(' ');
                const datePart = parts[0].replace(/:/g, '-');
                const timePart = parts[1];
                const dt = new Date(`${datePart}T${timePart}`);
                if (!isNaN(dt.getTime())) {
                  timestamp = dt.getTime();
                }
              }
              setData(prev => ({ ...prev, tempBase64: base64, tempTimestamp: timestamp, activeModal: 'weight-prompt-modal' }));
            });
          };
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const deleteProgressPic = (index: number) => {
    if (window.confirm("Are you sure you want to delete this progress pic?")) {
      const newPics = [...data.progressPics];
      const actualIndex = data.progressPics.indexOf(sortedProgressPics[index]);
      newPics.splice(actualIndex, 1);
      setData(prev => ({ ...prev, progressPics: newPics }));
    }
  };

  return (
    <div>
      <h1 className="section-title">Progress</h1>
      <button onClick={uploadProgressPic}>Upload Progress Pic</button>
      <div className="progress-grid" id="progress-list">{renderedProgressPics}</div>
    </div>
  );
};

export default ProgressTab;