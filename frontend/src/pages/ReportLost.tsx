import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Upload, Sparkles, ExternalLink, Lock } from 'lucide-react';
import api from '../services/api';
import { ImageUploader } from '../components/ImageUploader';



export const ReportLost: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [lostDate, setLostDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [createdItem, setCreatedItem] = useState<{ report_id: string; access_token: string } | null>(null);

  const handleAIDetected = (detected: { category: string; brand: string; color: string }) => {
    if (detected.brand) setBrand(detected.brand.slice(0, 50));
    if (detected.color) setColor(detected.color.slice(0, 50));
  };

  const handleNextFromStep2 = () => {
    if (location.trim().length > 200) {
      setError('Location must not exceed 200 characters.');
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    if (lostDate > todayStr) {
      setError('Date Lost cannot be in the future.');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleNextFromStep3 = () => {
    const wordCount = description.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > 100) {
      setError(`Description exceeds the maximum limit of 100 words (currently ${wordCount} words).`);
      return;
    }
    setError('');
    setStep(4);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    const calculatedTitle = (title || `${color} ${brand}`).trim();
    if (calculatedTitle.length > 100) {
      setError('Title must not exceed 100 characters.');
      return;
    }

    if (location.trim().length > 200) {
      setError('Location must not exceed 200 characters.');
      return;
    }

    const wordCount = description.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > 100) {
      setError(`Description exceeds the maximum limit of 100 words (currently ${wordCount} words).`);
      return;
    }

    if (contactEmail.trim().length > 254) {
      setError('Email address must not exceed 254 characters.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (lostDate > todayStr) {
      setError('Date Lost cannot be in the future.');
      return;
    }



    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', calculatedTitle);
      if (brand) formData.append('brand', brand);
      if (color) formData.append('color', color);
      formData.append('location', location);
      formData.append('lost_date', lostDate);
      formData.append('description', description);
      formData.append('contact_email', contactEmail);
      if (uploadedFile) formData.append('file', uploadedFile);

      const res = await api.post('/lost/create', formData);

      setCreatedItem({
        report_id: res.data.report_id,
        access_token: res.data.access_token
      });
    } catch (err: any) {
      let errorMessage = 'Failed to submit report. Please try again.';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map((e: any) => `${e.loc.join('.')} ${e.msg}`).join(', ');
        } else if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (createdItem) {
    const trackingUrl = `${window.location.origin}/track?report_id=${createdItem.report_id}&token=${createdItem.access_token}`;

    const handleCopyReportId = () => {
      navigator.clipboard.writeText(createdItem.report_id);
      alert('Report ID copied to clipboard!');
    };

    return (
      <div className="max-w-md mx-auto py-12">
        <div className="saas-card p-8 text-center space-y-5">
          <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Report Submitted Successfully</h2>
            <p className="text-xs text-zinc-400 mt-1">
              A confirmation email with your private tracking link has been sent to <span className="text-zinc-200 font-semibold">{contactEmail}</span>.
            </p>
          </div>

          <div className="bg-zinc-900 p-4 rounded border border-zinc-800 font-mono space-y-2 text-left">
            <div className="text-[10px] text-zinc-500 uppercase">Your Unique Report ID</div>
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-white tracking-wider">{createdItem.report_id}</div>
              <button
                type="button"
                onClick={handleCopyReportId}
                className="saas-button-secondary text-[11px] py-1 px-2.5"
              >
                Copy ID
              </button>
            </div>
          </div>

          <p className="text-[11px] text-zinc-500">
            Forgot your Report ID later? Simply search your email inbox for <strong>"Lost &amp; Found"</strong> or <strong>"{createdItem.report_id.slice(0, 9)}"</strong> to recover it instantly.
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <a
              href={trackingUrl}
              className="saas-button-primary text-xs py-2.5 flex items-center justify-center gap-1.5"
            >
              Open Private Tracking Dashboard <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="/"
              className="saas-button-secondary text-xs py-2 flex items-center justify-center"
            >
              Return to Homepage
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      
      {/* Progress Bar */}
      <div className="saas-card p-4 flex items-center justify-between font-mono text-xs">
        <span className="text-zinc-300 font-semibold">Report Lost Item</span>
        <span className="text-zinc-400">
          Step {step} of 4 &nbsp;
          <span className="text-white">
            {step === 1 && '■□□□'}
            {step === 2 && '■■□□'}
            {step === 3 && '■■■□'}
            {step === 4 && '■■■■'}
          </span>
        </span>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs p-3.5 rounded flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Card Container */}
      <div className="saas-card p-6 sm:p-8 space-y-6">
        
        {/* STEP 1: ITEM TYPE & IMAGE */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Step 1: What did you lose?</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Select category and upload a photo if available</p>
            </div>

            <ImageUploader
              onImageChange={setUploadedFile}
              onAIDetect={handleAIDetected}
            />

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Item Title *</label>
              <input
                type="text"
                required
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Blue Macbook Air"
                className="saas-input w-full py-2 px-3"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Brand (Optional)</label>
                <input
                  type="text"
                  maxLength={50}
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Apple, Dell, Titan"
                  className="saas-input w-full py-2 px-3"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Color (Optional)</label>
                <input
                  type="text"
                  maxLength={50}
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Black, Navy Blue"
                  className="saas-input w-full py-2 px-3"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={!title}
                onClick={() => setStep(2)}
                className="saas-button-primary text-xs flex items-center gap-1.5"
              >
                Next: Where &amp; When Lost <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: WHERE & WHEN */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Step 2: Where and when was it lost?</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Location details help our matching algorithm</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Specific Location * (Max 200 chars)</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Central Library 2nd Floor, Food Court Table 12"
                className="saas-input w-full py-2 px-3"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Date Lost *</label>
              <input
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
                value={lostDate}
                onChange={(e) => setLostDate(e.target.value)}
                className="saas-input w-full py-2 px-3"
              />
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="saas-button-secondary text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="button"
                disabled={!location.trim()}
                onClick={handleNextFromStep2}
                className="saas-button-primary text-xs flex items-center gap-1.5"
              >
                Next: Distinctive Details <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TELL US SOMETHING UNIQUE */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Step 3: Tell us something unique</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Serial numbers, stickers, contents, or distinctive marks (Max 100 words)</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Unique Identification Details *</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Sticker of GitHub Octocat on laptop lid, wallpaper is a mountain lake, serial # DL-94821"
                className="saas-input w-full p-3"
              />
              <div className="text-[11px] text-zinc-500 mt-1 text-right font-mono">
                {description.trim().split(/\s+/).filter(Boolean).length} / 100 words
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="saas-button-secondary text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="button"
                disabled={!description.trim()}
                onClick={handleNextFromStep3}
                className="saas-button-primary text-xs flex items-center gap-1.5"
              >
                Next: Contact Details <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CONTACT DETAILS */}
        {step === 4 && (
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Step 4: Contact Information</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Where should status notifications be sent?</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address * (Max 254 chars)</label>
              <input
                type="email"
                required
                maxLength={254}
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="your.email@university.edu"
                className="saas-input w-full py-2 px-3"
              />
            </div>



            {/* Trust Indicators */}
            <div className="bg-zinc-900 border border-zinc-800 rounded p-3 text-[11px] font-mono text-zinc-400 space-y-1">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                Your email is encrypted and never shared publicly.
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                Photos are automatically verified for safety.
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                Only Security Staff can approve final item pickup.
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="saas-button-secondary text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="submit"
                disabled={loading || !contactEmail.trim()}
                className="saas-button-primary text-xs py-2 px-4 flex items-center gap-1.5"
              >
                {loading ? 'Submitting Report...' : 'Complete & Submit Report'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
