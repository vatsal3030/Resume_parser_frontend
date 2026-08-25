"use client";

import { useState, useEffect } from 'react';
import { PageShell } from '@/components/ui/PageShell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star, Zap, CreditCard, Loader2, Smartphone, QrCode, Shield, Coins } from 'lucide-react';
import { useRazorpay } from '@/hooks/useRazorpay';
import { useToast } from '@/components/ui/toast';
import { supabase } from '@/lib/supabase';
import api from '@/lib/api';

const PLANS = [
  {
    id: 'plan_basic',
    name: 'Basic',
    price: 99,
    credits: 100,
    color: 'bg-brutal-blue',
    features: [
      '100 AI Generations',
      'Standard Support',
      'All AI Tools Access'
    ]
  },
  {
    id: 'plan_pro',
    name: 'Pro',
    price: 399,
    credits: 500,
    color: 'bg-brutal-yellow',
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
    name: 'Enterprise',
    price: 999,
    credits: 1500,
    color: 'bg-brutal-mint',
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

  // Get current user email & live credit balance
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
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummy_key',
        amount: order.amount,
        currency: order.currency,
        name: 'Elevara',
        description: `${plan.name} Plan - ${plan.credits} Credits`,
        order_id: order.id,
        handler: async function (response) {
          try {
            toast.info('Verifying', 'Verifying payment securely...');
            // 3. Verify Payment
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan.id
            });
            
            if (verifyRes.data?.creditsAdded) {
              toast.success('Success!', `${verifyRes.data.creditsAdded} credits added to your account.`);
              // Reload page to reflect new credits in context/UI
              setTimeout(() => window.location.reload(), 1500);
            }
          } catch (err) {
            console.error('Verification failed', err);
            toast.error('Payment Error', 'Payment was successful but verification failed. Please contact support.');
          } finally {
            setProcessingPlan(null);
          }
        },
        prefill: {
          name: userName || 'Elevara User',
          email: userEmail || ''
        },
        theme: {
          color: '#000000'
        },
        // Enable UPI, QR Code, Google Pay, and other methods
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
      subtitle="Power up your career tools with AI credits."
    >
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-8">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Choose Your Power-Up</h2>
          <p className="text-xl font-bold max-w-2xl mx-auto bg-brutal-green inline-block px-2 border-2 border-brutal-black">
            Simple, transparent pricing. No subscriptions, just buy what you need.
          </p>
        </div>

        {/* Current Balance Banner */}
        <div className="bg-brutal-yellow border-4 border-brutal-black p-6 mb-8 shadow-[6px_6px_0_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white border-3 border-black flex items-center justify-center shadow-[3px_3px_0_#000]">
              <Coins className="w-8 h-8 text-black" />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-gray-800 tracking-wider">Your Current Available Balance</p>
              <h3 className="text-4xl font-black">{currentCredits ?? '--'} Credits</h3>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-white border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0_#000]">
              {tier === 'PRO' ? 'Pro Plan Active' : 'Free Tier'}
            </span>
            <span className="px-3 py-1 bg-brutal-mint border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0_#000]">
              Lifetime Validity
            </span>
          </div>
        </div>

        {/* Payment Methods Banner */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10 p-4 bg-brutal-bg border-2 border-dashed border-brutal-black">
          <span className="text-xs font-black uppercase tracking-widest text-gray-500">Accepted:</span>
          <div className="flex items-center gap-1 text-sm font-bold bg-white px-3 py-1.5 border-2 border-brutal-black">
            <Smartphone className="w-4 h-4" /> GPay / UPI
          </div>
          <div className="flex items-center gap-1 text-sm font-bold bg-white px-3 py-1.5 border-2 border-brutal-black">
            <QrCode className="w-4 h-4" /> QR Code
          </div>
          <div className="flex items-center gap-1 text-sm font-bold bg-white px-3 py-1.5 border-2 border-brutal-black">
            <CreditCard className="w-4 h-4" /> Cards
          </div>
          <div className="flex items-center gap-1 text-sm font-bold bg-white px-3 py-1.5 border-2 border-brutal-black">
            <Shield className="w-4 h-4" /> Net Banking
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <div key={plan.id} className="relative animate-in zoom-in-95 duration-500">
              {plan.isPopular && (
                <div className="absolute -top-4 -right-4 z-10 bg-brutal-pink text-black font-black uppercase px-4 py-2 border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] rotate-3 flex items-center gap-2">
                  <Star className="w-5 h-5 fill-current" />
                  Most Popular
                </div>
              )}
              
              <Card className={`h-full border-4 border-brutal-black shadow-[8px_8px_0_rgba(0,0,0,1)] hover:shadow-[12px_12px_0_rgba(0,0,0,1)] transition-all ${plan.color} relative overflow-hidden`}>
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="mb-6">
                    <h3 className="text-2xl font-black uppercase mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black">₹{plan.price}</span>
                      <span className="font-bold text-base opacity-80">/ one-time</span>
                    </div>
                  </div>
                  
                  <div className="bg-white border-4 border-brutal-black p-5 mb-6 shadow-inner flex-1 transform -rotate-1">
                    <div className="flex items-center gap-3 mb-5 bg-brutal-black text-white p-3 font-black text-lg uppercase tracking-widest">
                      <Zap className="w-5 h-5 text-brutal-yellow fill-current" />
                      {plan.credits} Credits
                    </div>
                    
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 font-bold text-sm">
                          <Check className="w-5 h-5 border-2 border-brutal-black bg-brutal-green p-0.5 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    variant="brutal" 
                    className={`w-full py-5 text-lg font-black uppercase tracking-widest bg-white hover:bg-gray-100 flex items-center justify-center gap-3 ${processingPlan === plan.id ? 'opacity-90' : ''}`}
                    onClick={() => handlePurchase(plan)}
                    disabled={processingPlan !== null}
                  >
                    {processingPlan === plan.id ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Buy {plan.name}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center max-w-2xl mx-auto border-4 border-dashed border-brutal-black p-8 bg-white opacity-80 hover:opacity-100 transition-opacity">
          <h4 className="text-xl font-black uppercase mb-2">Secure Payments</h4>
          <p className="font-bold text-gray-600">
            All transactions are securely processed by Razorpay. We support UPI (Google Pay, PhonePe, Paytm), QR code scanning, debit/credit cards, net banking, and wallets. We do not store any of your payment information.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
