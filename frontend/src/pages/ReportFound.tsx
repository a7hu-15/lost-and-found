import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle2, Lock, ExternalLink, Link2 } from 'lucide-react';
import api from '../services/api';
import { ImageUploader } from '../components/ImageUploader';

export const ReportFound: React.FC = () => {
  const locationState = useLocation();
  const linkedLostItem = (locationState.state as { linkedLostItem?: any })?.linkedLostItem;

  const [step, setStep] = useState(1);

  // Form Data
  const [title, setTitle] = useState(linkedLostItem ? `Found ${linkedLostItem.title}` : '');
  const [category, setCategory] = useState(linkedLostItem ? linkedLostItem.category : 'Electronics');
  const [brand, setBrand] = useState(linkedLostItem ? linkedLostItem.brand || '' : '');
  const [color, setColor] = useState(linkedLostItem ? linkedLostItem.color || '' : '');
  const [location, setLocation] = useState(linkedLostItem ? linkedLostItem.location : '');
  const [foundDate, setFoundDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [storageLocation, setStorageLocation] = useState('Campus Security Office - Gate 1');
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

  const storageOptions = [
    'Campus Security Office - Gate 1',
    'Hostel Block Office',
    'Central Library Desk',
    'Department Office',
    'With Me (Turning in shortly)'
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
      formData.append('found_date', foundDate);
      formData.append('description', description);
      formData.append('storage_location', storageLocation);
      formData.append('contact_email', contactEmail);
      if (contactPhone) formData.append('contact_phone', contactPhone);
      if (linkedLostItem) formData.append('lost_item_id', linkedLostItem.id);
      if (uploadedFile) formData.append('file', uploadedFile);

      const res = await api.post('/found/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setCreatedItem({
        report_id: res.data.report_id,
        access_token: res.data.access_token
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit found item report.');
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
            <h2 className="text-xl font-bold text-white tracking-tight">Found Item Logged Successfully</h2>
            <p className="text-xs text-zinc-400 mt-1">
              A confirmation email with your report receipt has been sent to <span className="text-zinc-200 font-semibold">{contactEmail}</span>.
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
            Please hand the physical item to <strong>{storageLocation}</strong>.
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <a
              href={trackingUrl}
              className="saas-button-primary text-xs py-2.5 flex items-center justify-center gap-1.5"
            >
              Open Tracking Link <ExternalLink className="w-3.5 h-3.5" />
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
      
      {/* Wizard Progress Bar */}
      <div className="saas-card p-4 flex items-center justify-between font-mono text-xs">
        <span className="text-zinc-300 font-semibold">Report Found Item</span>
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
        
        {linkedLostItem && (
          <div className="bg-emerald-950/40 border border-emerald-800/60 p-3 rounded text-xs font-mono text-emerald-300 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-semibold block">Linking to Lost Item Report: {linkedLostItem.report_id}</span>
              <span className="text-[11px] text-emerald-400/80">Item: {linkedLostItem.title} | Location: {linkedLostItem.location}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs p-3 rounded font-mono">
            {error}
          </div>
        )}

        {/* STEP 1: UPLOAD PHOTOS + CATEGORY */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Step 1: What item was found?</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Upload a clear photo of the item and select category</p>
            </div>

            {/* Drag & Drop Photo Upload */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">Upload Clear Photo * (Required)</label>
              <ImageUploader
                onImageChange={setUploadedFile}
                onAIDetect={handleAIDetected}
                isRequired={true}
                selectedCategory={category}
              />
            </div>

            {/* Item Title */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Item Name *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Silver AirPods Pro Case"
                className="saas-input w-full py-2 px-3"
              />
            </div>

            {/* Category Pills */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">Category *</label>
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
                disabled={!title.trim() || !uploadedFile}
                onClick={() => setStep(2)}
                className="saas-button-primary text-xs flex items-center gap-1.5"
              >
                Next: Location & Holding Desk <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: WHERE FOUND & HOLDING LOCATION */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Step 2: Where was it found & where is it now?</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Specify discovery location and holding office</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Where Found *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Food Court Table 14"
                className="saas-input w-full py-2 px-3"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Date Found *</label>
              <input
                type="date"
                required
                value={foundDate}
                onChange={(e) => setFoundDate(e.target.value)}
                className="saas-input w-full py-2 px-3"
              />
            </div>

            {/* Storage Location Options */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">Where is the item held now? *</label>
              <div className="space-y-2">
                {storageOptions.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 bg-zinc-900 p-2.5 rounded border border-zinc-800 cursor-pointer text-xs text-zinc-200">
                    <input
                      type="radio"
                      name="storage"
                      checked={storageLocation === opt}
                      onChange={() => setStorageLocation(opt)}
                      className="text-blue-600 focus:ring-0"
                    />
                    {opt}
                  </label>
                ))}
              </div>
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
                Next: Physical Details <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PHYSICAL DETAILS */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Step 3: Description & Physical Condition</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Describe item condition without disclosing sensitive secrets</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Description & Notes *</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Physical condition, color, key details..."
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
                Next: Contact Info <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CONTACT INFO */}
        {step === 4 && (
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Step 4: Contact Information</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Where should status notifications be sent?</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Contact Email * (Never shared publicly)</label>
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
                Your contact details are encrypted and never disclosed.
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                Photos are analyzed and stored securely.
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
                {loading ? 'Submitting Report...' : 'Complete & Log Found Item'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
