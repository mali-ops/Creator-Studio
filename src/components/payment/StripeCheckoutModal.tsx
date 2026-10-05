import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { PlanConfig } from '../../services/adminConfig.ts';
import {
  CreditCard,
  Shield,
  Lock,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Calendar,
  AlertCircle,
  Zap,
} from 'lucide-react';

interface StripeCheckoutModalProps {
  plan: PlanConfig;
  billingCycle: 'monthly' | 'annual';
  onClose: () => void;
  onSuccess: () => void;
}

export const StripeCheckoutModal: React.FC<StripeCheckoutModalProps> = ({
  plan,
  billingCycle,
  onClose,
  onSuccess,
}) => {
  const { user, subscribeWithStripe } = useAuth();
  const { success, error: toastError } = useToast();

  const [cardholderName, setCardholderName] = useState(user?.fullName || '');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [country, setCountry] = useState('United States');
  const [postalCode, setPostalCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  const billedAmount = billingCycle === 'annual' ? price * 12 : price;

  // Format card number with spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format expiry MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      setExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setExpiry(raw);
    }
  };

  // Quick fill test card
  const handleTestAutoFill = () => {
    setCardholderName(user?.fullName || 'Alex Vance');
    setCardNumber('4242 4242 4242 4242');
    setExpiry('12/28');
    setCvc('123');
    setPostalCode('94103');
    setCountry('United States');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.length < 15) {
      setErrorMessage('Please enter a valid 16-digit credit card number.');
      return;
    }
    if (!expiry || !expiry.includes('/') || expiry.length < 5) {
      setErrorMessage('Please enter a valid expiration date (MM/YY).');
      return;
    }
    if (cvc.length < 3) {
      setErrorMessage('Please enter a valid 3 or 4 digit security code (CVC).');
      return;
    }

    setIsProcessing(true);

    try {
      const cardBrand = cleanNumber.startsWith('4')
        ? 'visa'
        : cleanNumber.startsWith('5')
        ? 'mastercard'
        : cleanNumber.startsWith('3')
        ? 'amex'
        : 'visa';

      const last4 = cleanNumber.slice(-4);
      const res = await subscribeWithStripe(plan.id as any, billingCycle, cardBrand, last4);

      if (res.success) {
        success(
          'Subscription Activated!',
          `Subscribed to ${plan.name} via Stripe. All workspace tools and credits are active.`
        );
        onSuccess();
      } else {
        setErrorMessage(res.error || 'Failed to process Stripe card authorization.');
        toastError('Payment Failed', res.error);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing error.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101612]/80 backdrop-blur-md animate-fade-in text-[#17231C]">
      <div className="bg-[#FFFFFF] border border-[#E1E7D9] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-modal-pop max-h-[95vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#647168] hover:text-[#17231C] hover:bg-[#F7F8F2] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#635BFF] text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#635BFF] uppercase tracking-wider">
              <span>Stripe Secure Subscription</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#635BFF]" />
              <span>Instant Activation</span>
            </div>
            <h3 className="text-xl font-bold font-display text-[#17231C]">
              {plan.name} Subscription
            </h3>
          </div>
        </div>

        {/* Instant Access Guarantee Banner */}
        <div className="mb-5 p-4 rounded-2xl bg-[#D9F36B]/25 border border-[#D9F36B] space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#17231C]">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#719129]" />
              <span>Immediate Full Access Guarantee</span>
            </span>
            <span className="font-mono text-sm text-[#17231C] font-extrabold">${billedAmount}/{billingCycle === 'annual' ? 'yr' : 'mo'}</span>
          </div>
          <p className="text-[11px] text-[#415348] leading-relaxed">
            Your card is authorized securely via Stripe. Your plan activates immediately with full access to all 16 AI content tools, priority queues, and monthly credits.
          </p>
        </div>

        {/* Plan summary line */}
        <div className="p-3.5 rounded-xl bg-[#F7F8F2] border border-[#E1E7D9] flex items-center justify-between text-xs mb-5">
          <div>
            <span className="font-bold text-[#17231C]">{plan.name}</span>
            <span className="text-[#647168] ml-2">({billingCycle === 'annual' ? 'Billed Annually' : 'Billed Monthly'})</span>
          </div>
          <div className="text-right">
            <span className="font-mono font-bold text-[#17231C]">${price}</span>
            <span className="text-[11px] text-[#647168]">/mo</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Stripe Credit Card Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#17231C]">Cardholder Name</label>
              <button
                type="button"
                onClick={handleTestAutoFill}
                className="text-[10px] font-mono text-[#635BFF] hover:underline flex items-center gap-1"
              >
                <span>⚡ Auto-fill Test Card</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="e.g. Maya Chen"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs text-[#17231C] placeholder-[#647168]/60 focus:bg-white focus:outline-none focus:border-[#635BFF] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17231C] mb-1">
              Card Number
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs font-mono text-[#17231C] placeholder-[#647168]/60 focus:bg-white focus:outline-none focus:border-[#635BFF] transition-colors"
              />
              <CreditCard className="w-4 h-4 text-[#647168] absolute left-3 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#17231C] mb-1">
                Expiration (MM/YY)
              </label>
              <input
                type="text"
                required
                value={expiry}
                onChange={handleExpiryChange}
                placeholder="12/28"
                maxLength={5}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs font-mono text-[#17231C] placeholder-[#647168]/60 focus:bg-white focus:outline-none focus:border-[#635BFF] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#17231C] mb-1">
                CVC / CVV
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  maxLength={4}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs font-mono text-[#17231C] placeholder-[#647168]/60 focus:bg-white focus:outline-none focus:border-[#635BFF] transition-colors"
                />
                <Lock className="w-3.5 h-3.5 text-[#647168] absolute left-2.5 top-3" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#17231C] mb-1">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs text-[#17231C] focus:bg-white focus:outline-none focus:border-[#635BFF]"
              >
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="Pakistan">Pakistan</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Other">Other International</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#17231C] mb-1">
                ZIP / Postal Code
              </label>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.slice(0, 10))}
                placeholder="94103"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs font-mono text-[#17231C] placeholder-[#647168]/60 focus:bg-white focus:outline-none focus:border-[#635BFF] transition-colors"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-[#635BFF] hover:bg-[#534be0] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Authorizing Stripe Card...</span>
                </span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Subscribe Now · ${billedAmount} ({billingCycle === 'annual' ? 'Annual' : 'Monthly'})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Trust Badges Footer */}
        <div className="mt-5 pt-4 border-t border-[#E1E7D9] flex flex-wrap items-center justify-between gap-3 text-[10px] text-[#647168]">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            256-Bit SSL Encrypted
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#635BFF]" />
            Instant Workspace Activation
          </span>
          <span className="font-semibold text-[#17231C]">
            Powered by Stripe
          </span>
        </div>
      </div>
    </div>
  );
};
