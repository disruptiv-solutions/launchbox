"use client";

import React, { useState } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { useTheme } from '../../../contexts/theme-context';
import { 
  createPremiumCheckoutSession,
  getPremiumFeatures
} from '../../../service/subscription-service';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [processingPayment, setProcessingPayment] = useState(false);

  // No need for separate data loading - using static premium plan

  // Removed - using only the quick premium upgrade function

  const handlePremiumUpgrade = async () => {
    if (!user) return;

    try {
      setProcessingPayment(true);
      await createPremiumCheckoutSession(
        user,
        `${window.location.origin}/dashboard/billing?success=true`,
        `${window.location.origin}/dashboard/billing?canceled=true`
      );
    } catch (error) {
      console.error('Error creating premium checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Using getPremiumFeatures from subscription service

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-lg theme-bg-secondary theme-border-primary border shadow-xl transition-all">
          {/* Header */}
          <div className="theme-bg-primary px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">
                Upgrade to Premium
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-300 text-2xl"
                disabled={processingPayment}
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="space-y-6">
                {/* Features */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">
                    Premium Features
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getPremiumFeatures().map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <span className="theme-text-primary mr-3 mt-1">✓</span>
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Premium Upgrade */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">
                    Premium Plan
                  </h4>
                  <div className="theme-bg-quaternary rounded-lg p-6 theme-border-secondary border">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h5 className="font-medium text-white text-xl">Premium Monthly</h5>
                        <p className="text-gray-300 text-sm">Full access to all premium features</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">$9.99</div>
                        <div className="text-sm text-gray-400">per month</div>
                      </div>
                    </div>

                    <button
                      onClick={handlePremiumUpgrade}
                      disabled={processingPayment}
                      className="w-full theme-bg-primary hover:brightness-110 text-white py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
                    >
                      {processingPayment ? 'Processing...' : 'Start Premium Subscription'}
                    </button>
                  </div>
                </div>

                {/* Simple pricing - no need for complex product loading */}

                {/* Security Note */}
                <div className="theme-bg-quinary rounded-lg p-4 border theme-border-tertiary">
                  <div className="flex items-start">
                    <span className="text-blue-400 mr-3 mt-1">ℹ</span>
                    <div>
                      <p className="text-sm text-gray-300">
                        <strong className="text-white">Secure Payment:</strong> Your payment is processed securely through Stripe. 
                        You can cancel anytime from your billing dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
          </div>

          {/* Footer */}
          <div className="theme-bg-quaternary px-6 py-4 border-t theme-border-primary">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                disabled={processingPayment}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;