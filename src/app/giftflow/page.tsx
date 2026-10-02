"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function GiftFlowPage() {
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email submitted:', email);
    // Add your form submission logic here
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'py-4 bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/10' : 'py-6 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            GiftFlow
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-400 hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</Link>
            <Link href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link>
            <Link href="#about" className="text-gray-400 hover:text-white transition-colors">About</Link>
          </div>
          <button className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:-translate-y-0.5">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-pink-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-indigo-400">Now in Public Beta</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Send Gifts That{' '}
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Spark Joy
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-lg">
              The modern way to send meaningful gifts. Instant delivery, beautiful presentations, and unforgettable experiences for your loved ones.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2">
                Start Gifting
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button className="px-8 py-4 border-2 border-white/20 rounded-full font-semibold hover:border-purple-500 hover:bg-purple-500/10 transition-all">
                Watch Demo
              </button>
            </div>
          </div>
          
          <div className="relative h-[500px]">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-pink-500/20 rounded-3xl blur-2xl" />
            <div className="relative h-full rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&h=1000&fit=crop"
                alt="Gift box with flowers"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
              
              {/* Floating Card */}
              <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-2xl">
                      🎁
                    </div>
                    <div>
                      <p className="font-semibold">Gift Card</p>
                      <p className="text-sm text-gray-400">Ready to send</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
                    $250
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                      JD
                    </div>
                    <span className="text-sm">From John Doe</span>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                    Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#1e293b]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full mb-4">
              <span className="text-sm font-semibold text-indigo-400">Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need to Gift Better</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to make gifting effortless, memorable, and magical.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'Instant Delivery',
                description: 'Send gifts instantly via email, SMS, or social media. No waiting, no shipping delays.',
                image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop'
              },
              {
                icon: '🎨',
                title: 'Beautiful Designs',
                description: 'Choose from hundreds of stunning templates or create your own. Every gift looks extraordinary.',
                image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop'
              },
              {
                icon: '🔒',
                title: 'Secure & Private',
                description: 'Bank-level encryption protects every transaction. Your recipients\' information stays private.',
                image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop'
              },
              {
                icon: '🌍',
                title: 'Global Reach',
                description: 'Send gifts to anyone, anywhere in the world. Support for 100+ currencies.',
                image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400&h=300&fit=crop'
              },
              {
                icon: '📊',
                title: 'Track & Monitor',
                description: 'Know exactly when your gift is opened. Real-time notifications and delivery tracking.',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
              },
              {
                icon: '💝',
                title: 'Personalized Messages',
                description: 'Add heartfelt notes, photos, or videos to make every gift truly personal.',
                image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&h=300&fit=crop'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/20"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] to-transparent" />
                  <div className="absolute bottom-4 left-4 text-4xl">{feature.icon}</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full mb-4">
              <span className="text-sm font-semibold text-indigo-400">How It Works</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Three Simple Steps</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Send the perfect gift in under 2 minutes. It's that easy.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
            
            {[
              {
                step: '1',
                title: 'Choose Your Gift',
                description: 'Select from gift cards, experiences, or custom monetary gifts. Set the amount and personalize your message.',
                image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=600&h=400&fit=crop'
              },
              {
                step: '2',
                title: 'Add Recipient',
                description: 'Enter their email or phone number. Add a personal touch with photos, videos, or heartfelt notes.',
                image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=400&fit=crop'
              },
              {
                step: '3',
                title: 'Send Instantly',
                description: 'Your gift is delivered instantly. They receive a beautiful notification and can redeem it right away.',
                image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop'
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-purple-500/30 relative z-10">
                  {item.step}
                </div>
                <div className="relative h-64 rounded-2xl overflow-hidden mb-6">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-center">{item.title}</h3>
                <p className="text-gray-400 text-center">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTRjMC0yId0+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '2M+', label: 'Gifts Sent' },
              { number: '150+', label: 'Countries' },
              { number: '98%', label: 'Satisfaction' },
              { number: '24/7', label: 'Support' }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg font-medium opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#0f172a]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to Make Someone's{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Day Special?
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of people who are already spreading joy with GiftFlow. Start gifting today.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 bg-white/5 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:-translate-y-0.5 whitespace-nowrap"
            >
              Get Started Free
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-[#1e293b] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                GiftFlow
              </Link>
              <p className="text-gray-400 mt-4 max-w-sm">
                Making gifting magical, one gift at a time. The modern platform for meaningful connections.
              </p>
            </div>
            
            {[
              {
                title: 'Product',
                links: ['Features', 'Pricing', 'Gift Cards', 'For Business']
              },
              {
                title: 'Company',
                links: ['About', 'Blog', 'Careers', 'Contact']
              },
              {
                title: 'Legal',
                links: ['Privacy', 'Terms', 'Security']
              }
            ].map((col, index) => (
              <div key={index}>
                <h4 className="font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, i) => (
                    <li key={i}>
                      <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm">
            <p>© 2024 GiftFlow. All rights reserved.</p>
            <p>Made with 💝 for gift-givers everywhere</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
