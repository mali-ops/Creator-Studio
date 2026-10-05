import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { adminConfig, PlanConfig as AdminPlanConfig } from '../services/adminConfig.ts';
import { storage } from '../services/storage.ts';
import { StripeCheckoutModal } from '../components/payment/StripeCheckoutModal.tsx';
import { StripeSubscriptionRecord } from '../types/index.ts';
import {
  CreditCard,
  Check,
  Zap,
  Info,
  Building,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  Lock,
  Calendar,
  CheckCircle2,
  X,
  RotateCcw,
} from 'lucide-react';

interface PricingPageProps {
  onOpenAuth?: (mode: 'login' | 'register') => void;
  onNavigate?: (tab: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onOpenAuth, onNavigate }) => {
  const { user, cancelSubscription } = useAuth();
  const { success, info } = useToast();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlanForStripe, setSelectedPlanForStripe] = useState<AdminPlanConfig | null>(null);
  const [settings, setSettings] = useState(adminConfig.getSettings());
  const [userSubscription, setUserSubscription] = useState<StripeSubscriptionRecord | undefined>(undefined);

  useEffect(() => {
    return adminConfig.subscribe((updated) => setSettings(updated));
  }, []);

  useEffect(() => {
    if (user?.id) {
      setUserSubscription(storage.getUserStripeSubscription(user.id));
    }
  }, [user]);

  const plans = settings.pricingPlans;
  const paymentAccounts = settings.paymentAccounts;

  const handleSelectPlan = (plan: AdminPlanConfig) => {
    if (!user) {
      onOpenAuth?.('register');
      return;
    }
    setSelectedPlanForStripe(plan);
  };

  const handleCancelSub = () => {
    if (window.confirm('Are you sure you want to cancel your Stripe recurring subscription? You will retain access until the end of your billing cycle.')) {
      cancelSubscription();
      setUserSubscription(undefined);
      success('Subscription Cancelled', 'Your Stripe auto-renew has been disabled.');
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10 text-[#17231C] animate-page-enter">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#E1E7D9] text-xs font-mono text-[#635BFF] font-bold shadow-2xs">
          <CreditCard className="w-3.5 h-3.5" />
          <span>OFFICIAL STRIPE RECURRING BILLING</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display text-[#17231C]">
          Transparent, High-Value Creator Plans
        </h1>
        <p className="text-xs sm:text-sm text-[#647168] leading-relaxed max-w-2xl mx-auto">
          Scale your content publishing with fast AI inference across 16 specialized generation tools. Cancel anytime in 1-click.
        </p>

        {/* Billing cycle toggle */}
        <div className="pt-3 flex items-center justify-center gap-3">
          <span className={`text-xs ${billingCycle === 'monthly' ? 'text-[#17231C] font-bold' : 'text-[#647168]'}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="w-12 h-6 rounded-full bg-[#E1E7D9] p-0.5 transition-colors relative cursor-pointer"
            aria-label="Toggle annual billing discount"
          >
            <div
              className={`w-5 h-5 rounded-full bg-[#17231C] transition-transform ${
                billingCycle === 'annual' ? 'translate-x-6 bg-[#92B76B]' : ''
              }`}
            />
          </button>
          <span className={`text-xs flex items-center gap-1.5 ${billingCycle === 'annual' ? 'text-[#17231C] font-bold' : 'text-[#647168]'}`}>
            <span>Annual Billing</span>
            <span className="px-1.5 py-0.5 rounded-full bg-[#D9F36B] text-[#17231C] text-[10px] font-mono font-extrabold">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* User Subscription Status Banner */}
      {user && userSubscription && (
        <div className="max-w-4xl mx-auto">
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E1E7D9] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#17231C]">
                    Active Stripe Subscription ({userSubscription.planName})
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </div>
                <p className="text-xs text-[#647168] mt-0.5">
                  Billed automatically via Stripe ({userSubscription.cardBrand.toUpperCase()} •••• {userSubscription.cardLast4}). Next renewal: {new Date(userSubscription.nextBillingDate).toLocaleDateString()}.
                </p>
              </div>
            </div>
            <button
              onClick={handleCancelSub}
              className="px-3.5 py-1.5 rounded-xl border border-[#E1E7D9] hover:border-rose-300 text-xs font-semibold text-[#647168] hover:text-rose-600 transition-colors shrink-0"
            >
              Cancel Auto-Renew
            </button>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isCurrent = user?.planTier === plan.id && user?.planStatus === 'active';
          const isPopular = plan.highlight;
          const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between space-y-6 transition-all shadow-2xs relative ${
                isPopular
                  ? 'bg-[#17231C] text-[#F7F8F2] border-[#17231C] shadow-xl ring-2 ring-[#D9F36B]'
                  : 'bg-[#FFFFFF] border-[#E1E7D9] text-[#17231C] hover:border-[#17231C]/30'
              }`}
            >
              {/* Highlight ribbon */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#D9F36B] text-[#17231C] text-[10px] font-mono font-extrabold uppercase tracking-wider shadow-sm">
                  Recommended for Creators
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-lg font-display ${isPopular ? 'text-white' : 'text-[#17231C]'}`}>
                    {plan.name}
                  </h3>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    isPopular ? 'bg-white/10 text-[#D9F36B]' : 'bg-[#F7F8F2] text-[#647168] border border-[#E1E7D9]'
                  }`}>
                    Full Access
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-extrabold font-mono tracking-tight ${isPopular ? 'text-white' : 'text-[#17231C]'}`}>
                    ${price}
                  </span>
                  <span className={`text-xs ${isPopular ? 'text-[#BECABE]' : 'text-[#647168]'}`}>
                    /{billingCycle === 'annual' ? 'month (billed annually)' : 'month'}
                  </span>
                </div>

                <div className="text-[11px] font-semibold text-[#92B76B]">
                  Instant Setup · Monthly or Annual Billing
                </div>

                <p className={`text-xs leading-relaxed min-h-[36px] ${isPopular ? 'text-[#BECABE]' : 'text-[#647168]'}`}>
                  {plan.description}
                </p>

                <div className={`pt-3 border-t space-y-2.5 ${isPopular ? 'border-white/10' : 'border-[#E1E7D9]'}`}>
                  {plan.features.map((feat) => (
                    <div key={feat} className={`flex items-start gap-2.5 text-xs ${isPopular ? 'text-[#F7F8F2]' : 'text-[#17231C]'}`}>
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isPopular ? 'text-[#D9F36B]' : 'text-[#92B76B]'}`} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl text-xs font-bold bg-white/10 text-white/60 cursor-default"
                  >
                    Current Active Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] ${
                      isPopular
                        ? 'bg-[#D9F36B] hover:bg-[#c6e650] text-[#17231C] font-extrabold'
                        : 'bg-[#17231C] hover:bg-[#101612] text-[#D9F36B]'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Subscribe to {plan.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stripe Guarantee & FAQ */}
      <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-[#E1E7D9] space-y-6 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#635BFF] uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>How Stripe Billing & Subscriptions Work</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] space-y-1.5">
            <div className="font-bold text-xs text-[#17231C] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#17231C] text-[#D9F36B] text-[11px] font-mono flex items-center justify-center">1</span>
              <span>Instant Activation</span>
            </div>
            <p className="text-[11px] text-[#647168] leading-relaxed">
              Get immediate access to all 16 AI content creation tools, priority neural queues, and brand voice models.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] space-y-1.5">
            <div className="font-bold text-xs text-[#17231C] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#17231C] text-[#D9F36B] text-[11px] font-mono flex items-center justify-center">2</span>
              <span>Secure Stripe Billing</span>
            </div>
            <p className="text-[11px] text-[#647168] leading-relaxed">
              Subscriptions are billed securely via Stripe. Invoices and receipts are instantly dispatched to your registered email.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] space-y-1.5">
            <div className="font-bold text-xs text-[#17231C] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#17231C] text-[#D9F36B] text-[11px] font-mono flex items-center justify-center">3</span>
              <span>Cancel Anytime in 1-Click</span>
            </div>
            <p className="text-[11px] text-[#647168] leading-relaxed">
              If you decide not to continue, cancel anytime before the 14 days expire from your settings. You will never be charged.
            </p>
          </div>
        </div>
      </div>

      {/* Stripe Checkout Modal */}
      {selectedPlanForStripe && (
        <StripeCheckoutModal
          plan={selectedPlanForStripe}
          billingCycle={billingCycle}
          onClose={() => setSelectedPlanForStripe(null)}
          onSuccess={() => {
            setSelectedPlanForStripe(null);
            if (user?.id) {
              setUserSubscription(storage.getUserStripeSubscription(user.id));
            }
          }}
        />
      )}
    </div>
  );
};
