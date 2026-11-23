import { useState } from 'react';
import profilePhoto from '../../../../assets/profile/profile.webp';
import { profile } from '../../../../data/portfolio';

/** react-pdf only reads PNG/JPEG, so the WebP photo is re-encoded through a canvas. */
async function toPngDataUrl(src: string): Promise<string> {
  const image = new Image();
  image.src = src;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  canvas.getContext('2d')?.drawImage(image, 0, 0);
  return canvas.toDataURL('image/png');
}

function DownloadCvButton() {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      // Loaded on demand: the PDF renderer is heavy and only needed here.
      const [{ pdf }, { default: CvDocument }, photo] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./components/CvDocument'),
        toPngDataUrl(profilePhoto),
      ]);
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
      const blob = await pdf(<CvDocument accent={accent} photo={photo} siteUrl={window.location.origin} />).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${profile.name.replace(/\s+/g, '-')}-CV.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Could not generate the CV', error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={download}
      disabled={busy}
      aria-busy={busy}
      className="cursor-pointer rounded-[10px] bg-accent px-[18px] py-2.5 font-semibold text-on-accent transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
    >
      {busy ? 'Generating…' : 'Download CV'}
    </button>
  );
}

export default DownloadCvButton;
