"use client"

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckoutProvider, useCheckout, PaymentMethod } from '@/context/CheckoutContext';
import { supabase } from '@/lib/supabase';

// Checkout Progress component
const CheckoutProgress: React.FC = () => {
  const { currentStep } = useCheckout();

  const steps = [
    { id: 1, name: 'Shipping' },
    { id: 2, name: 'Payment' },
    { id: 3, name: 'Confirmation' }
  ];

  return (
    <div className="mb-8">
      <h1 className="text-3xl text-[#5a4c46] text-center mb-8" style={{ fontFamily: "'Rhode', sans-serif" }}>Checkout</h1>

      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= step.id
                  ? 'bg-[#784D2C] text-white'
                  : 'bg-[#f3f0ef] text-[#5a4c46]'
                  }`}
              >
                {currentStep > step.id ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <span className={`text-xs mt-2 tracking-[0.2em] uppercase ${currentStep >= step.id ? 'font-medium text-[#5a4c46]' : 'text-[#84756f]'
                }`}>
                {step.name}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-16 mx-2 ${currentStep > index + 1 ? 'bg-[#784D2C]' : 'bg-[#e8ded0]'
                  }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Shipping Step Component
const ShippingStep: React.FC = () => {
  const {
    items,
    subtotal,
    shippingCost,
    tax,
    total,
    shippingInfo,
    updateShippingInfo,
    billingInfo,
    updateBillingInfo,
    setCurrentStep,
    isCheckingShipping,
    availableShippingMethods,
    shippingError
  } = useCheckout();

  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Use refs for retry logic (persists across renders but not state updates)
  const retryCountRef = useRef(0);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  // Check if user is logged in and load their info
  useEffect(() => {
    const maxRetries = 5;
    retryCountRef.current = 0; // Reset retry count on mount

    const loadUserInfo = async () => {
      try {
        console.log(`[loadUserInfo] Attempt ${retryCountRef.current + 1}/${maxRetries}`);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[loadUserInfo] Error getting session:', sessionError);
          // Retry if we haven't exceeded max retries
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            const timeoutId = setTimeout(loadUserInfo, 1000); // Increased to 1 second
            timeoutRefs.current.push(timeoutId);
            return;
          }
          console.log('[loadUserInfo] Max retries reached, no session found');
          setIsLoggedIn(false);
          setIsLoadingUser(false);
          return;
        }

        if (session?.user) {
          console.log('[loadUserInfo] Session found:', session.user.email);
          console.log('Session found, loading user info for:', session.user.email, 'User ID:', session.user.id);
          setIsLoggedIn(true);

          // Load user profile and addresses in parallel
          const [profileResult, addressesResult] = await Promise.all([
            supabase
              .from('profiles')
              .select('first_name, last_name, phone')
              .eq('id', session.user.id)
              .single(),
            supabase
              .from('customer_addresses')
              .select('*')
              .eq('user_id', session.user.id)
              .order('is_default', { ascending: false })
              .order('created_at', { ascending: false })
          ]);

          const { data: profile, error: profileError } = profileResult;
          const { data: addresses, error: addressesError } = addressesResult;

          // Log detailed results for debugging
          console.log('Profile fetch result:', {
            hasProfile: !!profile,
            profile: profile,
            error: profileError?.message || null
          });

          console.log('Addresses fetch result:', {
            hasAddresses: !!(addresses && addresses.length > 0),
            addressCount: addresses?.length || 0,
            addresses: addresses,
            error: addressesError?.message || null
          });

          // Build complete shipping info object
          const defaultAddress = addresses && addresses.length > 0
            ? (addresses.find(addr => addr.is_default) || addresses[0])
            : null;

          // Auto-fill ALL fields in a single update call
          const shippingUpdate: Partial<typeof shippingInfo> = {};

          // Always fill email from session (even if profile doesn't exist)
          if (session.user.email) {
            shippingUpdate.email = session.user.email;
          }

          // Fill name and phone from profile if available
          if (profile) {
            if (profile.first_name) shippingUpdate.firstName = profile.first_name;
            if (profile.last_name) shippingUpdate.lastName = profile.last_name;
            if (profile.phone) shippingUpdate.phone = profile.phone;
          }

          // Fill address if available
          if (defaultAddress) {
            if (defaultAddress.address_line_1) shippingUpdate.address = defaultAddress.address_line_1;
            if (defaultAddress.address_line_2) shippingUpdate.apartment = defaultAddress.address_line_2;
            if (defaultAddress.city) shippingUpdate.city = defaultAddress.city;

            // Map state name to code if needed
            if (defaultAddress.state) {
              const stateNameToCode: Record<string, string> = {
                'andaman and nicobar islands': 'AN', 'andhra pradesh': 'AP', 'arunachal pradesh': 'AR',
                'assam': 'AS', 'bihar': 'BR', 'chandigarh': 'CH', 'chhattisgarh': 'CT',
                'dadra and nagar haveli': 'DN', 'daman and diu': 'DD', 'delhi': 'DL', 'goa': 'GA',
                'gujarat': 'GJ', 'haryana': 'HR', 'himachal pradesh': 'HP', 'jammu and kashmir': 'JK',
                'jharkhand': 'JH', 'karnataka': 'KA', 'kerala': 'KL', 'ladakh': 'LA',
                'lakshadweep': 'LD', 'madhya pradesh': 'MP', 'maharashtra': 'MH', 'manipur': 'MN',
                'meghalaya': 'ML', 'mizoram': 'MZ', 'nagaland': 'NL', 'odisha': 'OR',
                'puducherry': 'PY', 'punjab': 'PB', 'rajasthan': 'RJ', 'sikkim': 'SK',
                'tamil nadu': 'TN', 'telangana': 'TG', 'tripura': 'TR', 'uttar pradesh': 'UP',
                'uttarakhand': 'UK', 'west bengal': 'WB'
              };
              const normalizedState = defaultAddress.state.toLowerCase().trim();
              shippingUpdate.state = stateNameToCode[normalizedState] || defaultAddress.state;
            }

            if (defaultAddress.postal_code) shippingUpdate.zipCode = defaultAddress.postal_code;
            if (defaultAddress.country) shippingUpdate.country = defaultAddress.country;
          }

          // Update all fields at once - always call even if only email (to hide login prompt)
          console.log('[loadUserInfo] Auto-filling shipping info:', shippingUpdate);
          console.log('[loadUserInfo] Current shippingInfo before update:', shippingInfo);

          // Force update by calling updateShippingInfo
          updateShippingInfo(shippingUpdate);

          // Wait a moment then verify the update worked
          setTimeout(() => {
            console.log('[loadUserInfo] ShippingInfo after update should be:', shippingUpdate);
          }, 100);

          // Warn if no data found
          if (!profile && !defaultAddress) {
            console.warn('[loadUserInfo] No profile or address data found in Supabase. Only email will be auto-filled.');
            console.warn('[loadUserInfo] Email being filled:', session.user.email);
          }

          setIsLoadingUser(false);
        } else {
          // No session yet - retry if we haven't exceeded max retries
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            const timeoutId = setTimeout(loadUserInfo, 500);
            timeoutRefs.current.push(timeoutId);
            return;
          }
          setIsLoggedIn(false);
          setIsLoadingUser(false);
        }
      } catch (error) {
        console.error('Error loading user info:', error);
        // Retry on error if we haven't exceeded max retries
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          const timeoutId = setTimeout(loadUserInfo, 500);
          timeoutRefs.current.push(timeoutId);
          return;
        }
        setIsLoggedIn(false);
        setIsLoadingUser(false);
      }
    };

    // Load user info on mount (this will check for existing session)
    loadUserInfo();

    // Listen for auth changes (when user logs in/out)
    // Note: onAuthStateChange fires AFTER mount, so loadUserInfo() on mount handles initial session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email || 'no session');

      // For INITIAL_SESSION, check getSession() because event session can be undefined
      if (event === 'INITIAL_SESSION') {
        // loadUserInfo() already runs on mount, but INITIAL_SESSION might fire after mount
        // So we check session and reload if needed
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession?.user) {
          console.log('Initial session confirmed:', currentSession.user.email);
          setIsLoggedIn(true);
          retryCountRef.current = 0;
          await loadUserInfo();
        } else {
          console.log('No initial session - user not logged in');
          setIsLoggedIn(false);
          setIsLoadingUser(false);
        }
      } else if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in:', session.user.email);
        setIsLoggedIn(true);
        retryCountRef.current = 0;
        await loadUserInfo();
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setIsLoggedIn(false);
        setIsLoadingUser(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('Token refreshed for:', session.user.email);
        setIsLoggedIn(true);
        await loadUserInfo();
      }
    });

    return () => {
      // Clear all timeouts on cleanup
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current = [];
      subscription.unsubscribe();
    };
  }, []); // Empty array - only run on mount. updateShippingInfo is stable from context.

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateShippingInfo({ [name]: value });

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleShippingMethodChange = (method: 'standard' | 'express') => {
    updateShippingInfo({ shippingMethod: method });
  };

  const handleSameAsShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBillingInfo({ sameAsShipping: e.target.checked });
  };

  const validateShippingInfo = (): boolean => {
    const newErrors: Record<string, string> = {};
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone',
      'address', 'city', 'state', 'zipCode'
    ];

    requiredFields.forEach(field => {
      if (!shippingInfo[field as keyof typeof shippingInfo]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
      }
    });

    if (shippingInfo.email && !/^\S+@\S+\.\S+$/.test(shippingInfo.email)) {
      newErrors.email = 'Valid email is required';
    }

    if (shippingInfo.phone && !/^(\+91)?[6-9]\d{9}$/.test(shippingInfo.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Valid 10-digit Indian phone number required';
    }

    if (shippingInfo.zipCode && !/^\d{6}$/.test(shippingInfo.zipCode)) {
      newErrors.zipCode = 'Valid 6-digit PIN code required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateShippingInfo()) {
      return;
    }

    setCurrentStep(2);
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Form */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-medium mb-6 font-['Rhode',sans-serif] text-[#5a4c46]">Shipping Information</h2>

          {/* Login/Signup Prompt - Show only if not logged in */}
          {!isLoadingUser && !isLoggedIn && (
            <div className="mb-6 p-4 bg-[#f3f0ef] border border-[#e8ded0] rounded-md">
              <p className="text-sm text-[#5a4c46] mb-3">
                Already have an account? Sign in to auto-fill your information.
              </p>
              <div className="flex gap-3">
                <Link
                  href={`/login?return_url=${encodeURIComponent('/checkout')}`}
                  className="px-4 py-2 bg-[#5a4c46] text-white hover:bg-[#4a3c36] uppercase tracking-wider text-xs rounded-md transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href={`/account/register?return_url=${encodeURIComponent('/checkout')}`}
                  className="px-4 py-2 border border-[#5a4c46] text-[#5a4c46] hover:bg-[#5a4c46] hover:text-white uppercase tracking-wider text-xs rounded-md transition-colors duration-200"
                >
                  Create Account
                </Link>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Contact Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-[#784D2C] uppercase tracking-wide text-sm">Contact Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-[#5a4c46] mb-1">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={shippingInfo.firstName}
                    onChange={handleInputChange}
                    className={`w-full p-3 border ${errors.firstName ? 'border-red-500' : 'border-[#e8ded0]'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#784D2C]`}
                  />
                  {errors.firstName && <p className="mt-1 text-red-500 text-sm">{errors.firstName}</p>}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-[#5a4c46] mb-1">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={shippingInfo.lastName}
                    onChange={handleInputChange}
                    className={`w-full p-3 border ${errors.lastName ? 'border-red-500' : 'border-[#e8ded0]'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#784D2C]`}
                  />
                  {errors.lastName && <p className="mt-1 text-red-500 text-sm">{errors.lastName}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#5a4c46] mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleInputChange}
                    className={`w-full p-3 border ${errors.email ? 'border-red-500' : 'border-[#e8ded0]'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#784D2C]`}
                  />
                  {errors.email && <p className="mt-1 text-red-500 text-sm">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#5a4c46] mb-1">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    className={`w-full p-3 border ${errors.phone ? 'border-red-500' : 'border-[#e8ded0]'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#784D2C]`}
                  />
                  {errors.phone && <p className="mt-1 text-red-500 text-sm">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-[#784D2C] uppercase tracking-wide text-sm">Shipping Address</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-[#5a4c46] mb-1">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    className={`w-full p-3 border ${errors.address ? 'border-red-500' : 'border-[#e8ded0]'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#784D2C]`}
                  />
                  {errors.address && <p className="mt-1 text-red-500 text-sm">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-[#5a4c46] mb-1">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      className={`w-full p-3 border ${errors.city ? 'border-red-500' : 'border-[#e8ded0]'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#784D2C]`}
                    />
                    {errors.city && <p className="mt-1 text-red-500 text-sm">{errors.city}</p>}
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-[#5a4c46] mb-1">State</label>
                    <select
                      id="state"
                      name="state"
                      value={shippingInfo.state}
                      onChange={handleInputChange}
                      className={`w-full p-3 border ${errors.state ? 'border-red-500' : 'border-[#e8ded0]'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#784D2C] bg-white`}
                    >
                      <option value="">Select State</option>
                      <option value="AN">Andaman and Nicobar Islands</option>
                      <option value="AP">Andhra Pradesh</option>
                      <option value="AR">Arunachal Pradesh</option>
                      <option value="AS">Assam</option>
                      <option value="BR">Bihar</option>
                      <option value="CH">Chandigarh</option>
                      <option value="CT">Chhattisgarh</option>
                      <option value="DN">Dadra and Nagar Haveli</option>
                      <option value="DD">Daman and Diu</option>
                      <option value="DL">Delhi</option>
                      <option value="GA">Goa</option>
                      <option value="GJ">Gujarat</option>
                      <option value="HR">Haryana</option>
                      <option value="HP">Himachal Pradesh</option>
                      <option value="JK">Jammu and Kashmir</option>
                      <option value="JH">Jharkhand</option>
                      <option value="KA">Karnataka</option>
                      <option value="KL">Kerala</option>
                      <option value="LA">Ladakh</option>
                      <option value="LD">Lakshadweep</option>
                      <option value="MP">Madhya Pradesh</option>
                      <option value="MH">Maharashtra</option>
                      <option value="MN">Manipur</option>
                      <option value="ML">Meghalaya</option>
                      <option value="MZ">Mizoram</option>
                      <option value="NL">Nagaland</option>
                      <option value="OR">Odisha</option>
                      <option value="PY">Puducherry</option>
                      <option value="PB">Punjab</option>
                      <option value="RJ">Rajasthan</option>
                      <option value="SK">Sikkim</option>
                      <option value="TN">Tamil Nadu</option>
                      <option value="TG">Telangana</option>
                      <option value="TR">Tripura</option>
                      <option value="UP">Uttar Pradesh</option>
                      <option value="UK">Uttarakhand</option>
                      <option value="WB">West Bengal</option>
                    </select>
                    {errors.state && <p className="mt-1 text-red-500 text-sm">{errors.state}</p>}
                  </div>

                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-[#5a4c46] mb-1">PIN Code</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={handleInputChange}
                      className={`w-full p-3 border ${errors.zipCode ? 'border-red-500' : 'border-[#e8ded0]'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#784D2C]`}
                      maxLength={6}
                    />
                    {errors.zipCode && <p className="mt-1 text-red-500 text-sm">{errors.zipCode}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-[#784D2C] uppercase tracking-wide text-sm flex items-center justify-between">
                Shipping Method
                {isCheckingShipping && <span className="text-xs text-gray-500 normal-case ml-2 animate-pulse">Calculating rates...</span>}
              </h3>

              {shippingError && (
                <div className="p-3 mb-4 bg-red-50 text-red-700 text-sm rounded border border-red-100">
                  {shippingError}
                </div>
              )}

              <div className="space-y-4">
                {availableShippingMethods.length > 0 ? (
                  availableShippingMethods.map((method: any) => (
                    <div
                      key={method.method}
                      onClick={() => handleShippingMethodChange(method.method)}
                      className={`p-4 border rounded-md flex items-start cursor-pointer ${shippingInfo.shippingMethod === method.method
                        ? 'border-[#784D2C] bg-[#f3f0ef]'
                        : 'border-[#e8ded0]'
                        }`}
                    >
                      <div className="mr-3 mt-1">
                        <div className={`w-5 h-5 rounded-full border ${shippingInfo.shippingMethod === method.method
                          ? 'border-[#784D2C]'
                          : 'border-gray-400'
                          } flex items-center justify-center`}
                        >
                          {shippingInfo.shippingMethod === method.method && (
                            <div className="w-3 h-3 rounded-full bg-[#784D2C]"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-[#5a4c46] capitalize">{method.method.replace(/_/g, ' ')} Shipping</h4>
                          <span className="font-medium text-[#5a4c46]">{method.cost === 0 ? 'Free' : `₹${method.cost}`}</span>
                        </div>
                        <p className="text-sm text-[#8b7d71] mt-1">Delivery in {method.estimated_delivery}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  !isCheckingShipping && (
                    <div className="p-4 border border-[#e8ded0] rounded-md bg-gray-50 text-gray-500 text-sm text-center">
                      {shippingInfo.zipCode && shippingInfo.zipCode.length === 6 ? 'No shipping methods available for this pincode.' : 'Enter a valid PIN code to see shipping rates.'}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Billing Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-[#784D2C] uppercase tracking-wide text-sm">Billing Information</h3>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={billingInfo.sameAsShipping}
                    onChange={handleSameAsShippingChange}
                    className="w-4 h-4 rounded border-[#e8ded0] text-[#784D2C] focus:ring-[#784D2C]"
                  />
                  <span className="ml-2 text-[#5a4c46]">Same as shipping address</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-6 bg-[#784D2C] text-white font-medium rounded-md hover:bg-[#5a3d20] focus:outline-none focus:ring-2 focus:ring-[#e8ded0]"
            >
              Continue to Payment
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-[#e8ded0] rounded-md p-6 sticky top-6">
            <h2 className="text-xl font-medium mb-4 font-['Rhode',sans-serif] text-[#5a4c46]">Order Summary</h2>

            {/* Items */}
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between gap-2">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="h-12 w-12 md:h-16 md:w-16 flex-shrink-0 overflow-hidden rounded-md border border-[#e8ded0] mr-2 md:mr-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="text-xs md:text-sm font-medium text-[#5a4c46] line-clamp-2 leading-tight">{item.name}</h3>
                      {item.color && <p className="text-xs text-[#8b7d71] mt-0.5">{item.color}</p>}
                      <p className="text-xs text-[#8b7d71]">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-xs md:text-sm font-medium text-[#5a4c46] flex-shrink-0">₹{item.price.toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-[#e8ded0] pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <p className="text-[#8b7d71]">Subtotal</p>
                <p className="font-medium text-[#5a4c46]">₹{subtotal.toLocaleString()}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-[#8b7d71]">Shipping</p>
                <p className="font-medium text-[#5a4c46]">₹{shippingCost.toLocaleString()}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-[#8b7d71]">Tax (18%)</p>
                <p className="font-medium text-[#5a4c46]">₹{tax.toLocaleString()}</p>
              </div>
              <div className="flex justify-between text-base font-medium pt-2 border-t border-[#e8ded0] mt-2">
                <p className="text-[#5a4c46]">Total</p>
                <p className="text-[#784D2C]">₹{total.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Payment Step Component
const PaymentStep: React.FC = () => {
  const {
    items,
    subtotal,
    shippingCost,
    tax,
    total,
    paymentInfo,
    updatePaymentInfo,
    placeOrder,
    isProcessing,
    shippingInfo,
    billingInfo,
    setCurrentStep
  } = useCheckout();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleMethodChange = (method: PaymentMethod) => {
    updatePaymentInfo({ method });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updatePaymentInfo({ [name]: value });

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validatePaymentInfo = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (paymentInfo.method === 'creditCard') {
      if (!paymentInfo.cardNumber || paymentInfo.cardNumber.length < 16) {
        newErrors.cardNumber = 'Valid card number is required';
      }
      if (!paymentInfo.cardName) {
        newErrors.cardName = 'Name on card is required';
      }
      if (!paymentInfo.expiryDate || !/^\d{2}\/\d{2}$/.test(paymentInfo.expiryDate)) {
        newErrors.expiryDate = 'Valid expiry date (MM/YY) is required';
      }
      if (!paymentInfo.cvv || !/^\d{3,4}$/.test(paymentInfo.cvv)) {
        newErrors.cvv = 'Valid CVV is required';
      }
    } else if (paymentInfo.method === 'upi') {
      if (!paymentInfo.upiId || !paymentInfo.upiId.includes('@')) {
        newErrors.upiId = 'Valid UPI ID is required';
      }
    } else if (paymentInfo.method === 'paypal') {
      if (!paymentInfo.paypalEmail || !paymentInfo.paypalEmail.includes('@')) {
        newErrors.paypalEmail = 'Valid PayPal email is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePaymentInfo()) {
      return;
    }

    await placeOrder();
  };

  const goBack = () => {
    setCurrentStep(1);
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-medium mb-6 font-['Rhode',sans-serif] text-[#5a4c46]">Payment Method</h2>

          <form onSubmit={handleSubmit}>
            {/* Payment Method Selection */}
            <div className="mb-6">
              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  className={`flex-1 py-3 px-4 border rounded-md ${paymentInfo.method === 'creditCard'
                    ? 'border-[#784D2C] bg-[#784D2C] text-white'
                    : 'border-[#e8ded0] hover:border-[#c9b8a8] text-[#5a4c46]'
                    }`}
                  onClick={() => handleMethodChange('creditCard')}
                >
                  Credit Card
                </button>
                <button
                  type="button"
                  className={`flex-1 py-3 px-4 border rounded-md ${paymentInfo.method === 'upi'
                    ? 'border-[#784D2C] bg-[#784D2C] text-white'
                    : 'border-[#e8ded0] hover:border-[#c9b8a8] text-[#5a4c46]'
                    }`}
                  onClick={() => handleMethodChange('upi')}
                >
                  UPI
                </button>
                <button
                  type="button"
                  className={`flex-1 py-3 px-4 border rounded-md ${paymentInfo.method === 'paypal'
                    ? 'border-[#784D2C] bg-[#784D2C] text-white'
                    : 'border-[#e8ded0] hover:border-[#c9b8a8] text-[#5a4c46]'
                    }`}
                  onClick={() => handleMethodChange('paypal')}
                >
                  PayPal
                </button>
              </div>
            </div>

            {/* Credit Card Fields */}
            {paymentInfo.method === 'creditCard' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-[#5a4c46] mb-1">Card Number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={paymentInfo.cardNumber || ''}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    className={`w-full p-3 border ${errors.cardNumber ? 'border-red-500' : 'border-[#e8ded0]'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#784D2C]`}
                  />
                  {errors.cardNumber && <p className="mt-1 text-red-500 text-sm">{errors.cardNumber}</p>}
                </div>

                <div>
                  <label htmlFor="cardName" className="block text-sm font-medium text-[#5a4c46] mb-1">Name on Card</label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    value={paymentInfo.cardName || ''}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={`w-full p-3 border ${errors.cardName ? 'border-red-500' : 'border-[#e8ded0]'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#784D2C]`}
                  />
                  {errors.cardName && <p className="mt-1 text-red-500 text-sm">{errors.cardName}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-[#5a4c46] mb-1">Expiry Date</label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={paymentInfo.expiryDate || ''}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      className={`w-full p-3 border ${errors.expiryDate ? 'border-red-500' : 'border-[#e8ded0]'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#784D2C]`}
                    />
                    {errors.expiryDate && <p className="mt-1 text-red-500 text-sm">{errors.expiryDate}</p>}
                  </div>

                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-[#5a4c46] mb-1">CVV</label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={paymentInfo.cvv || ''}
                      onChange={handleInputChange}
                      placeholder="123"
                      className={`w-full p-3 border ${errors.cvv ? 'border-red-500' : 'border-[#e8ded0]'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#784D2C]`}
                    />
                    {errors.cvv && <p className="mt-1 text-red-500 text-sm">{errors.cvv}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* UPI Fields */}
            {paymentInfo.method === 'upi' && (
              <div>
                <label htmlFor="upiId" className="block text-sm font-medium text-[#5a4c46] mb-1">UPI ID</label>
                <input
                  type="text"
                  id="upiId"
                  name="upiId"
                  value={paymentInfo.upiId || ''}
                  onChange={handleInputChange}
                  placeholder="yourname@upi"
                  className={`w-full p-3 border ${errors.upiId ? 'border-red-500' : 'border-[#e8ded0]'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#784D2C]`}
                />
                {errors.upiId && <p className="mt-1 text-red-500 text-sm">{errors.upiId}</p>}
              </div>
            )}

            {/* PayPal Fields */}
            {paymentInfo.method === 'paypal' && (
              <div>
                <label htmlFor="paypalEmail" className="block text-sm font-medium text-[#5a4c46] mb-1">PayPal Email</label>
                <input
                  type="email"
                  id="paypalEmail"
                  name="paypalEmail"
                  value={paymentInfo.paypalEmail || ''}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className={`w-full p-3 border ${errors.paypalEmail ? 'border-red-500' : 'border-[#e8ded0]'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#784D2C]`}
                />
                {errors.paypalEmail && <p className="mt-1 text-red-500 text-sm">{errors.paypalEmail}</p>}
              </div>
            )}

            {/* Billing Information Summary */}
            <div className="mt-8 p-5 bg-[#f8f4f0] border border-[#e8ded0] rounded-md">
              <h3 className="text-lg font-medium mb-2 text-[#784D2C] uppercase tracking-wide text-sm">Billing Address</h3>
              <p className="text-[#5a4c46]">{billingInfo.firstName} {billingInfo.lastName}</p>
              <p className="text-[#5a4c46]">{billingInfo.address}{billingInfo.apartment ? `, ${billingInfo.apartment}` : ''}</p>
              <p className="text-[#5a4c46]">{billingInfo.city}, {billingInfo.state} {billingInfo.zipCode}</p>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between mt-8">
              <button
                type="button"
                onClick={goBack}
                className="text-[#784D2C] hover:text-[#5a3d20] flex items-center"
              >
                ← Return to shipping
              </button>

              <button
                type="submit"
                disabled={isProcessing}
                className="py-3 px-6 bg-[#784D2C] text-white font-medium rounded-md hover:bg-[#5a3d20] focus:outline-none focus:ring-2 focus:ring-[#e8ded0] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-[#e8ded0] rounded-md p-6 sticky top-6">
            <h2 className="text-xl font-medium mb-4 font-['Rhode',sans-serif] text-[#5a4c46]">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between gap-2">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="h-12 w-12 md:h-16 md:w-16 flex-shrink-0 overflow-hidden rounded-md border border-[#e8ded0] mr-2 md:mr-4">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover object-center" />
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="text-xs md:text-sm font-medium text-[#5a4c46] line-clamp-2 leading-tight">{item.name}</h3>
                      <p className="text-xs text-[#8b7d71] mt-0.5">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-xs md:text-sm font-medium text-[#5a4c46] flex-shrink-0">₹{item.price.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-[#e8ded0] pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <p className="text-[#8b7d71]">Subtotal</p>
                <p className="font-medium text-[#5a4c46]">₹{subtotal.toLocaleString()}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-[#8b7d71]">Shipping</p>
                <p className="font-medium text-[#5a4c46]">₹{shippingCost.toLocaleString()}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-[#8b7d71]">Tax (18%)</p>
                <p className="font-medium text-[#5a4c46]">₹{tax.toLocaleString()}</p>
              </div>
              <div className="flex justify-between text-base font-medium pt-2 border-t border-[#e8ded0] mt-2">
                <p className="text-[#5a4c46]">Total</p>
                <p className="text-[#784D2C]">₹{total.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Confirmation Step Component
const ConfirmationStep: React.FC = () => {
  const {
    items,
    subtotal,
    shippingCost,
    tax,
    total,
    shippingInfo,
    orderNumber
  } = useCheckout();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const formatDate = (daysToAdd: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const estimatedDelivery = {
    start: formatDate(3),
    end: formatDate(7)
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-[#f8f5f2] p-8 rounded-lg mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-[#784D2C] rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-medium text-center text-[#5a4c46] mb-2">Order Confirmed!</h2>
        <p className="text-center text-[#5a4c46] mb-6">Thank you for your purchase. Your order has been received.</p>

        <div className="bg-white p-5 rounded-md mb-6">
          <div className="flex justify-between mb-3 border-b border-[#f1f1f1] pb-3">
            <span className="text-sm text-[#5a4c46]">Order Number:</span>
            <span className="text-sm font-medium text-[#5a4c46]">{orderNumber}</span>
          </div>
          <div className="flex justify-between mb-3 border-b border-[#f1f1f1] pb-3">
            <span className="text-sm text-[#5a4c46]">Order Date:</span>
            <span className="text-sm font-medium text-[#5a4c46]">{new Date().toLocaleDateString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-[#5a4c46]">Estimated Delivery:</span>
            <span className="text-sm font-medium text-[#5a4c46]">{estimatedDelivery.start} - {estimatedDelivery.end}</span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-[#5a4c46] mb-3 uppercase tracking-wide">Shipping Information</h3>
          <div className="bg-white p-5 rounded-md">
            <p className="text-sm mb-1 text-[#5a4c46]">{shippingInfo.firstName} {shippingInfo.lastName}</p>
            <p className="text-sm mb-1 text-[#5a4c46]">{shippingInfo.address}{shippingInfo.apartment && `, ${shippingInfo.apartment}`}</p>
            <p className="text-sm mb-1 text-[#5a4c46]">{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
            <p className="text-sm text-[#5a4c46]">Phone: {shippingInfo.phone}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-[#5a4c46] mb-3 uppercase tracking-wide">Order Summary</h3>
          <div className="bg-white p-5 rounded-md">
            <div className="max-h-64 overflow-y-auto mb-4">
              {items.map((item, index) => (
                <div key={index} className="flex py-3 border-b border-[#f1f1f1] last:border-0">
                  <div className="w-16 h-16 flex-shrink-0 bg-[#f8f5f2] rounded overflow-hidden mr-4">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-sm font-medium text-[#5a4c46]">{item.name}</h4>
                    {item.color && <p className="text-xs text-[#5a4c46]/80">{item.color}</p>}
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-[#5a4c46]">Qty: {item.quantity}</span>
                      <span className="text-sm font-medium text-[#5a4c46]">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#f1f1f1] pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-[#5a4c46]">Subtotal</span>
                <span className="text-sm text-[#5a4c46]">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-[#5a4c46]">Shipping</span>
                <span className="text-sm text-[#5a4c46]">₹{shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-sm text-[#5a4c46]">Tax (18% GST)</span>
                <span className="text-sm text-[#5a4c46]">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-base text-[#5a4c46]">Total</span>
                <span className="text-base text-[#5a4c46]">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/all-products"
            className="bg-white border border-[#784D2C] text-[#784D2C] py-3 px-6 rounded text-sm uppercase tracking-wide transition-colors hover:bg-[#f8f5f2] text-center"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="bg-[#784D2C] text-white py-3 px-6 rounded text-sm uppercase tracking-wide transition-colors hover:bg-[#5a4c46] text-center"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

// Inner component that uses the checkout context
const CheckoutContent: React.FC = () => {
  const { currentStep } = useCheckout();

  return (
    <div className="bg-[#faf6f3] min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <CheckoutProgress />

          <div className="bg-white p-6 md:p-8 rounded-md shadow-sm border border-[#e8e2d9]">
            {currentStep === 1 && <ShippingStep />}
            {currentStep === 2 && <PaymentStep />}
            {currentStep === 3 && <ConfirmationStep />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrapper component that provides checkout context
// CartProvider is already provided in root layout
export default function CheckoutPage() {
  return (
    <CheckoutProvider>
      <CheckoutContent />
    </CheckoutProvider>
  );
}


