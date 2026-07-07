'use client';
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, UserPlus, ArrowRight, LogIn, Trash2, Plus } from 'lucide-react';
import { GRADES } from '../curriculumData';

interface FamilyRegistrationFormProps {
  schools: any[];
  onComplete: () => void;
  onCancel: () => void;
}

export default function FamilyRegistrationForm({ schools, onComplete, onCancel }: FamilyRegistrationFormProps) {
  const [parentFirstName, setParentFirstName] = useState('');
  const [parentLastName, setParentLastName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentPassword, setParentPassword] = useState('');

  const [children, setChildren] = useState([{
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    schoolId: '',
    grade: '',
    relationship: 'Parent'
  }]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  const handleAddChild = () => {
    setChildren([...children, {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      schoolId: '',
      grade: '',
      relationship: 'Parent'
    }]);
  };

  const handleRemoveChild = (index: number) => {
    const newChildren = [...children];
    newChildren.splice(index, 1);
    setChildren(newChildren);
  };

  const updateChild = (index: number, field: string, value: string) => {
    const newChildren = [...children];
    (newChildren[index] as any)[field] = value;
    setChildren(newChildren);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!parentFirstName || !parentLastName || !parentEmail || !parentPassword) {
      setErrorText('Please fill in all required parent details.');
      return;
    }

    if (children.length === 0) {
      setErrorText('Please add at least one child.');
      return;
    }

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (!child.firstName || !child.lastName || !child.email || !child.password || !child.schoolId || !child.grade) {
        setErrorText(`Please fill in all required details for Child ${i + 1}.`);
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register-family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent: {
            firstName: parentFirstName,
            lastName: parentLastName,
            email: parentEmail.trim(),
            phone: parentPhone,
            password: parentPassword,
          },
          children: children.map(c => ({
            ...c,
            email: c.email.trim()
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Registration failed');
      }

      onComplete();

    } catch (err: any) {
      setErrorText(err.message || 'Failed to register family. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <GraduationCap className="w-48 h-48" />
      </div>

      <div className="mb-8 relative z-10">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Family Registration</h2>
        <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest">
          Register as a parent and add your children
        </p>
      </div>

      {errorText && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold animate-pulse">
          {errorText}
        </div>
      )}

      {successText && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-bold">
          {successText}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 text-left relative z-10">
        
        {/* Parent Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-indigo-700 border-b border-indigo-100 pb-2">
            1. Parent / Guardian Details
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">First Name *</label>
              <input
                type="text"
                required
                value={parentFirstName}
                onChange={(e) => setParentFirstName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Last Name *</label>
              <input
                type="text"
                required
                value={parentLastName}
                onChange={(e) => setParentLastName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Parent Email *</label>
              <input
                type="email"
                required
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Phone Number</label>
              <input
                type="tel"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Parent Login Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={parentPassword}
              onChange={(e) => setParentPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Children Details */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-700">
              2. Children Details
            </h3>
            <button
              type="button"
              onClick={handleAddChild}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg"
            >
              <Plus className="w-3 h-3" /> Add Another Child
            </button>
          </div>

          {children.map((child, index) => (
            <div key={index} className="p-5 bg-slate-50/50 border border-slate-200 rounded-2xl relative space-y-4">
              {children.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveChild(index)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition"
                  title="Remove Child"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              <h4 className="text-xs font-black uppercase text-slate-700">Child {index + 1}</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">First Name *</label>
                  <input
                    type="text"
                    required
                    value={child.firstName}
                    onChange={(e) => updateChild(index, 'firstName', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={child.lastName}
                    onChange={(e) => updateChild(index, 'lastName', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Child Email *</label>
                  <input
                    type="email"
                    required
                    value={child.email}
                    onChange={(e) => updateChild(index, 'email', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Child Login Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={child.password}
                    onChange={(e) => updateChild(index, 'password', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">School *</label>
                  <select
                    required
                    value={child.schoolId}
                    onChange={(e) => updateChild(index, 'schoolId', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Select School --</option>
                    {schools.map(school => (
                      <option key={school.id} value={school.id}>{school.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Grade *</label>
                  <select
                    required
                    value={child.grade}
                    onChange={(e) => updateChild(index, 'grade', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Select Grade --</option>
                    {GRADES.map(g => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black text-sm rounded-xl transition flex items-center justify-center gap-2"
        >
          {isLoading ? 'Registering Family...' : 'Complete Registration'}
          <UserPlus className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-6 mt-6 border-t border-slate-100 text-center">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
        >
          Cancel and return to Login
        </button>
      </div>

    </motion.div>
  );
}
