import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2, Lock, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { ImageUploader } from '../components/ImageUploader';

export const ReportLost: React.FC = () => {
  const [step, setStep] = useState(1);

  // Form Data
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [location, setLocation] = useState('');
  const [lostDate, setLostDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [createdItem, setCreatedItem] = useState<{ report_id: string; access_token: string } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    'Electronics',
    'Laptop',
    'Wallet',
    'Bottle',
    'Bag',
    'Phone',
    'Keys',
    'ID Card'
  ];

  const handleAIDetected = (detected: { category: string; brand: string; color: string }) => {
    if (detected.category) setCategory(detected.category);
    if (detected.brand) setBrand(detected.brand);
    if (detected.color) setColor(detected.color);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title || `${color} ${brand} ${category}`.trim());
      formData.append('category', category);
      if (brand) formData.append('brand', brand);
      if (color) formData.append('color', color);
      formData.append('location', location);
      formData.append('lost_date', lostDate);
      formData.append('description', description);
      formData.append('contact_email', contactEmail);
      if (contactPhone) formData.append('contact_phone', contactPhone);
      if (uploadedFile) formData.append('file', uploadedFile);

      const res = await api.post('/lost/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setCreatedItem({
        report_id: res.data.report_id,
        access_token: res.data.access_token
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit report. Please try again.');
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
            Forgot your Report ID later? Simply search your email inbox for <strong>"Lost & Found"</strong> or <strong>"{createdItem.report_id.slice(0, 9)}"</strong> to recover it instantly.
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

      <div className="saas-card p-6 sm:p-8 space-y-6">
        
        {error && (
          <div className="bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs p-3 rounded font-mono">
            {error}
          </div>
        )}

        {/* STEP 1: PHOTO OR SKIP + ITEM NAME + CATEGORY */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Step 1: Upload Photo OR Enter Item Name</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Upload a photo if you have one, or skip directly to item name</p>
            </div>

            {/* Photo Upload Area */}
            <div>
              <ImageUploader
                onImageChange={setUploadedFile}
                onAIDetect={handleAIDetected}
                isRequired={false}
                selectedCategory={category}
              />
            </div>

            {/* Item Title / Name */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Item Name *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Black Leather Wallet or Dell XPS 15 Laptop"
                className="saas-input w-full py-2 px-3"
              />
            </div>

            {/* Category Choice */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">Category</label>
              <div className="grid grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-2 px-3 rounded border text-xs font-medium text-center transition-all ${
                      category === cat
                        ? 'bg-white text-black border-white font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={!title.trim()}
                onClick={() => setStep(2)}
                className="saas-button-primary text-xs flex items-center gap-1.5"
              >
                Next: Location & Date <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: WHERE & WHEN */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Step 2: Where and when was it lost?</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Specify location and date details</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Last Seen Location *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Main Library 2nd Floor Reading Room"
                className="saas-input w-full py-2 px-3"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Date Lost *</label>
              <input
                type="date"
                required
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
                onClick={() => setStep(3)}
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
              <p className="text-xs text-zinc-400 mt-0.5">Serial numbers, stickers, contents, or distinctive marks</p>
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
                onClick={() => setStep(4)}
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
              <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address * (Never shared publicly)</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="your.email@university.edu"
                className="saas-input w-full py-2 px-3"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Phone Number (Optional)</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 234 567 8900"
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
