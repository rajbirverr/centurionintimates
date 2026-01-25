"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BaseDropdown from './BaseDropdown';
import { signIn, signUp, signOut, getCurrentUser } from '@/lib/actions/auth';
import { getUserProfile, type UserProfile } from '@/lib/actions/profile';
import { getAllOrders, getOrderItems, type Order, type OrderItem } from '@/lib/actions/orders';
import { supabase } from '@/lib/supabase';

// Define account navigation links
const accountLinks = [
  { name: "ACCOUNT OVERVIEW", path: "/account" },
  { name: "ORDER HISTORY", path: "/account?tab=orders" },
  { name: "ADDRESS BOOK", path: "/account?tab=addresses" },
  { name: "WISHLIST", path: "/account?tab=wishlist" }
];

interface AccountDropdownProps {
  isOpen: boolean;
  navHeight: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const AccountDropdown: React.FC<AccountDropdownProps> = ({
  isOpen,
  navHeight,
  onMouseEnter,
  onMouseLeave
}) => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);
  const [recentOrderItem, setRecentOrderItem] = useState<OrderItem | null>(null);
  const [orderItemImage, setOrderItemImage] = useState<string | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(false);
  
  // Form state for login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Form state for register
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [newsletter, setNewsletter] = useState(false);

  // Load user data when logged in
  const loadUserData = async () => {
    if (!isLoggedIn) return;
    
    setLoadingUserData(true);
    try {
      // Load profile
      const profileResult = await getUserProfile();
      if (profileResult.success && profileResult.profile) {
        setProfile(profileResult.profile);
      }

      // Load most recent order
      const orders = await getAllOrders();
      if (orders && orders.length > 0) {
        const mostRecentOrder = orders[0];
        setRecentOrder(mostRecentOrder);

        // Load order items for the most recent order
        const orderItems = await getOrderItems(mostRecentOrder.id);
        if (orderItems && orderItems.length > 0) {
          const firstItem = orderItems[0];
          setRecentOrderItem(firstItem);

          // Get product image for the first item
          try {
            const { data: imageData } = await supabase
              .from('product_images')
              .select('image_url')
              .eq('product_id', firstItem.product_id)
              .eq('is_primary', true)
              .limit(1)
              .maybeSingle();

            if (imageData?.image_url) {
              setOrderItemImage(imageData.image_url);
            } else {
              // Try to get any image if no primary
              const { data: anyImage } = await supabase
                .from('product_images')
                .select('image_url')
                .eq('product_id', firstItem.product_id)
                .limit(1)
                .maybeSingle();
              
              if (anyImage?.image_url) {
                setOrderItemImage(anyImage.image_url);
              }
            }
          } catch (err) {
            console.error('Error loading product image:', err);
          }
        }
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoadingUserData(false);
    }
  };

  // Check if user is logged in on mount and when dropdown opens
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await getCurrentUser();
        if (result.success && result.user) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          setProfile(null);
          setRecentOrder(null);
          setRecentOrderItem(null);
          setOrderItemImage(null);
        }
      } catch (error) {
        setIsLoggedIn(false);
        setProfile(null);
        setRecentOrder(null);
        setRecentOrderItem(null);
        setOrderItemImage(null);
      }
    };

    if (isOpen) {
      checkAuth();
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setIsLoggedIn(true);
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setProfile(null);
        setRecentOrder(null);
        setRecentOrderItem(null);
        setOrderItemImage(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isOpen]);

  // Load user data when logged in state changes
  useEffect(() => {
    if (isLoggedIn && isOpen) {
      loadUserData();
    }
  }, [isLoggedIn, isOpen]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn(email, password);

      if (result.success) {
        setIsLoggedIn(true);
        setEmail('');
        setPassword('');
        // Refresh the page to update the UI
        window.location.reload();
      } else {
        setError(result.error || 'Failed to sign in');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate password strength
    if (registerPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const result = await signUp({
        email: registerEmail,
        password: registerPassword,
        firstName,
        lastName,
      });

      if (result.success) {
        setIsLoggedIn(true);
        setFirstName('');
        setLastName('');
        setRegisterEmail('');
        setRegisterPassword('');
        // Refresh the page to update the UI
        window.location.reload();
      } else {
        setError(result.error || 'Failed to create account');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      setIsLoggedIn(false);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <BaseDropdown
      isOpen={isOpen}
      navHeight={navHeight}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="bg-white py-6">
        <div className="max-w-4xl mx-auto px-4">
          {isLoggedIn ? (
            /* Logged in view */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Account greeting */}
              <div className="md:border-r border-[#e5e2e0] md:pr-8">
                <div className="text-center md:text-left mb-6">
                  <h2 className="text-[#5a4c46] text-xl font-light mb-2">
                    {loadingUserData ? 'Loading...' : profile?.first_name ? `Welcome back, ${profile.first_name}` : 'Welcome back'}
                  </h2>
                  <p className="text-[#84756f] text-sm">
                    Manage your account preferences and view your order history.
                  </p>
                </div>
                
                {/* Quick links */}
                <ul className="space-y-4">
                  {accountLinks.map((link, index) => (
                    <li key={index}>
                      <Link 
                        href={link.path} 
                        className="text-[#5a4c46] hover:text-[#91594c] text-sm uppercase tracking-wider block py-1"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                
                {/* Sign out button */}
                <button 
                  className="mt-8 border border-[#5a4c46] text-[#5a4c46] hover:bg-[#5a4c46] hover:text-white px-6 py-2 uppercase text-xs tracking-[0.2em] transition-colors duration-200 w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleLogout}
                  disabled={loading}
                >
                  {loading ? 'Signing Out...' : 'Sign Out'}
                </button>
              </div>
              
              {/* Recent order */}
              <div>
                <h3 className="text-[#5a4c46] uppercase text-sm tracking-wider mb-4 font-medium">RECENT ORDER</h3>
                {loadingUserData ? (
                  <div className="bg-[#f3f0ef] p-4">
                    <p className="text-[#84756f] text-xs">Loading...</p>
                  </div>
                ) : recentOrder && recentOrderItem ? (
                  <div className="bg-[#f3f0ef] p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-[#5a4c46] text-xs">Order #{recentOrder.id.slice(0, 8).toUpperCase()}</span>
                      <span className="text-[#5a4c46] text-xs">
                        {new Date(recentOrder.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-4">
                      <div className="bg-white w-20 h-20 flex items-center justify-center overflow-hidden">
                        {orderItemImage ? (
                          <img 
                            src={orderItemImage} 
                            alt={recentOrderItem.product_name} 
                            className="h-full w-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200"></div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-[#5a4c46] text-sm font-medium uppercase">{recentOrderItem.product_name}</h4>
                        <p className="text-[#84756f] text-xs mt-1">₹{Number(recentOrderItem.price).toLocaleString('en-IN')}</p>
                        <p className="text-[#91594c] text-xs mt-2 capitalize">
                          {recentOrder.status} • {new Date(recentOrder.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <Link href={`/account?tab=orders`} className="text-[#5a4c46] text-xs uppercase tracking-wider mt-4 inline-block hover:text-[#91594c]">
                      View Order Details
                    </Link>
                  </div>
                ) : (
                  <div className="bg-[#f3f0ef] p-4">
                    <p className="text-[#84756f] text-xs">No recent orders</p>
                    <Link href="/all-products" className="text-[#5a4c46] text-xs uppercase tracking-wider mt-2 inline-block hover:text-[#91594c]">
                      Start Shopping
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Not logged in view */
            <div>
              {/* Tabs for login/register */}
              <div className="flex justify-center mb-6 border-b border-[#e5e2e0]">
                <button 
                  className={`px-6 py-2 text-sm uppercase tracking-[0.1em] ${activeTab === 'login' ? 'border-b-2 border-[#5a4c46] text-[#5a4c46]' : 'text-[#84756f]'}`}
                  onClick={() => setActiveTab('login')}
                >
                  Sign In
                </button>
                <button 
                  className={`px-6 py-2 text-sm uppercase tracking-[0.1em] ${activeTab === 'register' ? 'border-b-2 border-[#5a4c46] text-[#5a4c46]' : 'text-[#84756f]'}`}
                  onClick={() => setActiveTab('register')}
                >
                  Create Account
                </button>
              </div>
              
              {activeTab === 'login' ? (
                /* Login form */
                <div className="max-w-md mx-auto">
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs">
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleLogin}>
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-[#5a4c46] text-xs uppercase tracking-wider mb-2">
                        Email Address
                      </label>
                      <input 
                        type="email" 
                        id="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#f3f0ef] border-none px-4 py-2 text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="password" className="block text-[#5a4c46] text-xs uppercase tracking-wider mb-2">
                        Password
                      </label>
                      <input 
                        type="password" 
                        id="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#f3f0ef] border-none px-4 py-2 text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="remember" 
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="mr-2 h-4 w-4 text-[#5a4c46] focus:ring-[#5a4c46] rounded" 
                          disabled={loading}
                        />
                        <label htmlFor="remember" className="text-[#84756f] text-xs">
                          Remember me
                        </label>
                      </div>
                      <Link href="/login#recover" className="text-[#5a4c46] text-xs hover:underline">
                        Forgot Password?
                      </Link>
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-[#5a4c46] text-white hover:bg-[#4a3c36] px-4 py-2 uppercase text-xs tracking-[0.2em] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                  </form>
                </div>
              ) : (
                /* Registration form */
                <div className="max-w-md mx-auto">
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs">
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleRegister}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="firstName" className="block text-[#5a4c46] text-xs uppercase tracking-wider mb-2">
                          First Name
                        </label>
                        <input 
                          type="text" 
                          id="firstName" 
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full bg-[#f3f0ef] border-none px-4 py-2 text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
                          required
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-[#5a4c46] text-xs uppercase tracking-wider mb-2">
                          Last Name
                        </label>
                        <input 
                          type="text" 
                          id="lastName" 
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full bg-[#f3f0ef] border-none px-4 py-2 text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="registerEmail" className="block text-[#5a4c46] text-xs uppercase tracking-wider mb-2">
                        Email Address
                      </label>
                      <input 
                        type="email" 
                        id="registerEmail" 
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="w-full bg-[#f3f0ef] border-none px-4 py-2 text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="registerPassword" className="block text-[#5a4c46] text-xs uppercase tracking-wider mb-2">
                        Password
                      </label>
                      <input 
                        type="password" 
                        id="registerPassword" 
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="w-full bg-[#f3f0ef] border-none px-4 py-2 text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
                        required
                        minLength={6}
                        disabled={loading}
                      />
                      <p className="mt-1 text-xs text-[#84756f]">Must be at least 6 characters</p>
                    </div>
                    <div className="mb-6">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="newsletter" 
                          checked={newsletter}
                          onChange={(e) => setNewsletter(e.target.checked)}
                          className="mr-2 h-4 w-4 text-[#5a4c46] focus:ring-[#5a4c46] rounded" 
                          disabled={loading}
                        />
                        <label htmlFor="newsletter" className="text-[#84756f] text-xs">
                          Subscribe to our newsletter
                        </label>
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-[#5a4c46] text-white hover:bg-[#4a3c36] px-4 py-2 uppercase text-xs tracking-[0.2em] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </BaseDropdown>
  );
};

export default AccountDropdown;
