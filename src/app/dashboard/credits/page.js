"use client";

import { useState, useEffect } from 'react';
import { PageShell } from '@/components/ui/PageShell';
import { Button } from '@/components/ui/button';
import { Check, Star, Zap, CreditCard, Loader2, Smartphone, QrCode, Shield, Coins } from 'lucide-react';
import { useRazorpay } from '@/hooks/useRazorpay';
import { useToast } from '@/components/ui/toast';
import { supabase } from '@/lib/supabase';
import api from '@/lib/api';

const PLANS = [
  {
    id: 'plan_basic',
    name: 'Basic Pack',
    price: 99,
    credits: 100,
    features: [
      '100 AI Generations',
      'Standard Support',
      'All AI Tools Access'
    ]
  },
  {
    id: 'plan_pro',
    name: 'Pro Pack',
    price: 399,
    credits: 500,
    isPopular: true,
    features: [
      '500 AI Generations',
      'Priority Support',
      'All AI Tools Access',
      'Early Access Features'
    ]
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise Pack',
    price: 999,
    credits: 1500,
    features: [
      '1500 AI Generations',
      'Dedicated Support',
      'All AI Tools Access',
      'Early Access Features',
      'Bulk Export & API Access'
    ]
  }
];

export default function CreditsPage() {
  const { loadRazorpay } = useRazorpay();
  const [processingPlan, setProcessingPlan] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [currentCredits, setCurrentCredits] = useState(null);
  const [tier, setTier] = useState('FREE');
  const toast = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUserEmail(data.user.email || '');
        setUserName(data.user.user_metadata?.full_name || '');
      }
    });

    api.get('/users/me').then(({ data }) => {
      if (data) {
        const bal = data.creditBalance ?? data.credits ?? data.profile?.creditBalance ?? 0;
        setCurrentCredits(bal);
        setTier(data.tier || data.profile?.tier || 'FREE');
      }
    }).catch(() => setCurrentCredits(0));
  }, []);

  const handlePurchase = async (plan) => {
    try {
      setProcessingPlan(plan.id);
      
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error('Error', 'Failed to load Razorpay SDK. Please check your connection.');
        setProcessingPlan(null);
        return;
      }

      // 1. Create Order on Backend
      const { data: order } = await api.post('/payments/create-order', {
        amount: plan.price,
        currency: 'INR'
      });

      // 2. Open Razorpay Checkout with UPI/QR/GPay support
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Elevara Career OS',
        description: `${plan.name} - ${plan.credits} Credits`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const { data: verifyData } = await api.post('/payments/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan.id,
              credits: plan.credits
            });

            if (verifyData.success) {
              toast.success('Credits Added!', `Successfully added ${plan.credits} credits to your account.`);
              setCurrentCredits(verifyData.newBalance);
              if (verifyData.tier) setTier(verifyData.tier);
              window.dispatchEvent(new CustomEvent('creditsUpdated', { 
                detail: { creditBalance: verifyData.newBalance } 
              }));
            } else {
              toast.error('Verification Failed', 'Payment verification failed. Please contact support.');
            }
          } catch (err) {
            console.error('Verification error', err);
            toast.error('Verification Error', 'Failed to verify payment with server.');
          } finally {
            setProcessingPlan(null);
          }
        },
        prefill: {
          name: userName || 'Elevara User',
          email: userEmail || ''
        },
        theme: {
          color: '#d97757'
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI",
                instruments: [
                  { method: "upi", flows: ["qr", "collect", "intent"] }
                ]
              },
              other: {
                name: "Other Payment Methods",
                instruments: [
                  { method: "card" },
                  { method: "netbanking" },
                  { method: "wallet" }
                ]
              }
            },
            sequence: ["block.upi", "block.other"],
            preferences: {
              show_default_blocks: true
            }
          }
        },
        modal: {
          ondismiss: function() {
            setProcessingPlan(null);
            toast.info('Cancelled', 'Payment was cancelled.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed', response.error);
        toast.error('Payment Failed', response.error.description);
        setProcessingPlan(null);
      });
      
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error('Error', 'Failed to initialize payment.');
      setProcessingPlan(null);
    }
  };

  return (
    <PageShell 
      title="Credits & Plans" 
      subtitle="Power up your career tools with instant AI generation credits. No monthly subscriptions."
    >
      <div className="max-w-5xl mx-auto space-y-10 py-4">

        {/* Current Balance Banner */}
        <div className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-(--surface-soft) border border-(--hairline-soft) flex items-center justify-center text-(--primary)">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-(--muted) font-medium">Available Balance</p>
              <h3 className="text-3xl font-serif text-(--ink) tracking-tight">{currentCredits ?? '--'} Credits</h3>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-(--surface-soft) border border-(--hairline-soft) text-xs text-(--muted) font-medium">
              {tier === 'PRO' ? 'Pro Plan Active' : 'Free Tier'}
            </span>
            <span className="px-3 py-1 rounded-full bg-(--primary)/10 text-(--primary) border border-(--primary)/20 text-xs font-medium">
              Lifetime Validity
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div 
              key={plan.id} 
              className={`rounded-2xl border bg-(--surface-card) p-6 flex flex-col justify-between relative transition-all duration-200 ${
                plan.isPopular 
                  ? 'border-(--primary) shadow-md ring-1 ring-(--primary)/20' 
                  : 'border-(--hairline) shadow-sm hover:border-(--primary)/40 hover:bg-(--surface-soft)'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-(--primary) text-white text-[11px] font-medium px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1.5">
                  <Star className="w-3 h-3 fill-current" />
                  Most Popular
                </div>
              )}
              
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-serif text-(--ink) mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-serif text-(--ink)">₹{plan.price}</span>
                    <span className="text-xs text-(--muted)">one-time</span>
                  </div>
                </div>

                <div className="rounded-xl bg-(--surface-soft) border border-(--hairline-soft) p-4 mb-6 flex items-center gap-3">
                  <Zap className="w-4 h-4 text-(--primary)" />
                  <span className="text-sm font-medium text-(--ink)">{plan.credits} Credits</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-(--body)">
                      <Check className="w-4 h-4 text-(--primary) shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant={plan.isPopular ? 'default' : 'secondary'}
                className="w-full"
                disabled={processingPlan !== null}
                onClick={() => handlePurchase(plan)}
              >
                {processingPlan === plan.id ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </span>
                ) : (
                  `Get ${plan.credits} Credits`
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Accepted payment methods */}
        <div className="flex flex-wrap items-center justify-center gap-3 py-4 text-xs text-(--muted)">
          <span>Secure checkout powered by Razorpay:</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-(--surface-soft) border border-(--hairline-soft)">
            <Smartphone className="w-3 h-3 text-(--primary)" /> UPI / GPay
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-(--surface-soft) border border-(--hairline-soft)">
            <QrCode className="w-3 h-3 text-(--primary)" /> Instant QR
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-(--surface-soft) border border-(--hairline-soft)">
            <CreditCard className="w-3 h-3 text-(--primary)" /> Cards & NetBanking
          </span>
        </div>

      </div>
    </PageShell>
  );
}
